"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { handleFormSubmissionResponse, extractMessage } from "@/lib/messages";
import type { Withdrawal, User } from "@shared/schema";

export function WithdrawalApproval() {
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const [txid, setTxid] = useState("");
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ pendingWithdrawals: Withdrawal[]; totalPendingAmount: number; count: number }>({
    queryKey: ["admin/withdrawals/pending"],
    queryFn: adminApi.getPendingWithdrawals,
  });
  const pendingWithdrawals = data?.pendingWithdrawals ?? [];

  const approveWithdrawalMutation = useMutation({
    mutationFn: async ({ id, txid, paymentProof }: { id: string; txid: string; paymentProof?: File }) => {
      if (!paymentProof) {
        toast({
          variant: "destructive",
          title: "Payment Proof Required",
          description: "You must upload a payment proof (image or PDF) to approve this withdrawal.",
        });
        throw new Error("Payment proof is required");
      }
      // Validate file type
      if (
        !paymentProof.type.startsWith('image/') &&
        paymentProof.type !== 'application/pdf'
      ) {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Only images and PDFs are allowed.",
        });
        throw new Error("Invalid file type");
      }
      // Validate file size
      if (paymentProof.size > 10 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File Too Large",
          description: "Maximum file size is 10MB.",
        });
        throw new Error("File too large");
      }
      // Send FormData with txid and paymentProof
      const formData = new FormData();
      formData.append('txid', txid);
      formData.append('paymentProof', paymentProof);
      return adminApi.approveWithdrawal(id, formData);
    },
    onSuccess: (response) => {
      // Use server message if available, otherwise use default
      const toastConfig = handleFormSubmissionResponse(response, 'approve');
      toast(toastConfig);
      
      queryClient.invalidateQueries({ queryKey: ["admin/withdrawals/pending"] });
      queryClient.invalidateQueries({ queryKey: ["admin/stats"] });
      
      setIsDialogOpen(false);
      setTxid("");
      setPaymentProof(null);
      setSelectedWithdrawal(null);
    },
    onError: (error: any) => {
      const message = extractMessage(error);
      // Only show the error toast if the message is not the generic fallback
      if (message && message !== 'An unexpected error occurred. Please try again.') {
      toast({
        variant: "destructive",
        title: "Withdrawal Approval Failed",
        description: message,
      });
      }
    },
  });

  const rejectWithdrawalMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      adminApi.rejectWithdrawal(id, reason),
    onSuccess: (response) => {
      // Use server message if available, otherwise use default
      const toastConfig = handleFormSubmissionResponse(response, 'reject');
      toast(toastConfig);
      
      queryClient.invalidateQueries({ queryKey: ["admin/withdrawals/pending"] });
      // Do NOT invalidate stats or balance queries on rejection
      setIsRejectDialogOpen(false);
      setRejectReason("");
      setSelectedWithdrawal(null);
    },
    onError: (error: any) => {
      // Debug: log the error object
      console.error("Reject withdrawal error:", error);

      // Try to extract a meaningful message
      let message = "An unexpected error occurred. Please try again.";
      if (error?.response?.data?.message) {
        message = error.response.data.message;
      } else if (error?.message) {
        message = error.message;
      }

      toast({
        variant: "destructive",
        title: "Withdrawal Rejection Failed",
        description: message,
      });
    },
  });

  const handleApprove = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setIsDialogOpen(true);
  };

  const handleConfirmApproval = () => {
    if (!selectedWithdrawal || !txid.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a transaction ID",
      });
      return;
    }
    approveWithdrawalMutation.mutate({ 
      id: selectedWithdrawal._id, 
      txid,
      paymentProof: paymentProof || undefined
    });
  };

  const handleReject = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setIsRejectDialogOpen(true);
  };

  const handleConfirmReject = () => {
    if (!selectedWithdrawal) return;
    rejectWithdrawalMutation.mutate({ id: selectedWithdrawal._id, reason: rejectReason });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getMethodDisplayName = (method: string) => {
    switch (method) {
      case 'easypaisa':
        return 'EasyPaisa';
      case 'jazzcash':
        return 'JazzCash';
      case 'bank_account':
        return 'Bank Account';
      case 'trc20':
        return 'TRC20';
      case 'others':
        return 'Others';
      default:
        return method;
    }
  };

  const getMethodDetails = (withdrawal: Withdrawal) => {
    switch (withdrawal.method) {
      case 'easypaisa':
      case 'jazzcash':
        return withdrawal.phoneNumber || 'N/A';
      case 'bank_account':
        return `${withdrawal.bankName || 'N/A'} - ${withdrawal.accountNumber || 'N/A'}`;
      case 'trc20':
        return withdrawal.trcId || 'N/A';
      case 'others':
        return `${withdrawal.platform || 'N/A'} - ${withdrawal.accountNumber || 'N/A'}`;
      default:
        return 'N/A';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Withdrawal Approvals</CardTitle>
        <div className="text-sm text-gray-600">
          {pendingWithdrawals.length} pending withdrawals • Total: PKR {data?.totalPendingAmount.toLocaleString()}
        </div>
      </CardHeader>
      <CardContent>
        {pendingWithdrawals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No pending withdrawals
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingWithdrawals.map((withdrawal) => (
                <TableRow key={withdrawal._id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {(withdrawal.userId as any)?.fullName || "Unknown User"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {(withdrawal.userId as any)?.email || "No email"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    PKR {withdrawal.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="capitalize">{withdrawal.type}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{getMethodDisplayName(withdrawal.method)}</div>
                      <div className="text-xs text-gray-500">
                        {getMethodDetails(withdrawal)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(withdrawal.createdAt), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(withdrawal)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(withdrawal)}
                      >
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Withdrawal</DialogTitle>
            </DialogHeader>
            {selectedWithdrawal && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Amount:</p>
                    <p>PKR {selectedWithdrawal.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="font-medium">Type:</p>
                    <p className="capitalize">{selectedWithdrawal.type}</p>
                  </div>
                  <div>
                    <p className="font-medium">Method:</p>
                    <p>{getMethodDisplayName(selectedWithdrawal.method)}</p>
                  </div>
                  <div>
                    <p className="font-medium">User:</p>
                    <p>{(selectedWithdrawal.userId as any)?.fullName}</p>
                  </div>
                </div>

                <div>
                  <p className="font-medium text-gray-600">Method Details:</p>
                  <p className="text-sm bg-gray-50 p-2 rounded">
                    {getMethodDetails(selectedWithdrawal)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction ID *
                  </label>
                  <Input
                    placeholder="Enter transaction ID"
                    value={txid}
                    onChange={(e) => setTxid(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Proof *
                  </label>
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload a screenshot or PDF of the payment proof
                  </p>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleConfirmApproval}
                    disabled={approveWithdrawalMutation.isPending || !txid.trim()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {approveWithdrawalMutation.isPending ? "Processing..." : "Approve & Complete"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Withdrawal</DialogTitle>
            </DialogHeader>
            {selectedWithdrawal && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Amount:</p>
                    <p>PKR {selectedWithdrawal.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="font-medium">Type:</p>
                    <p className="capitalize">{selectedWithdrawal.type}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason *
                  </label>
                  <Textarea
                    placeholder="Enter reason for rejection"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleConfirmReject}
                    disabled={rejectWithdrawalMutation.isPending || !rejectReason.trim()}
                    variant="destructive"
                  >
                    {rejectWithdrawalMutation.isPending ? "Processing..." : "Reject"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
