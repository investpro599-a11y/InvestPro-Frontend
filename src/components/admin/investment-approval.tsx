"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, XCircle, Eye, FileText } from "lucide-react";
import { format } from "date-fns";
import type { Investment } from "@shared/schema";
import { handleFormSubmissionResponse, extractMessage } from "@/lib/messages";

export function InvestmentApproval() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [investmentToReject, setInvestmentToReject] = useState<Investment | null>(null);

  const { data: pendingInvestments = [], isLoading } = useQuery({
    queryKey: ["admin/investments/pending"],
    queryFn: adminApi.getPendingInvestments,
  });

  // Get user details for the selected investment
  const { data: userDetails } = useQuery({
    queryKey: ["admin/users", selectedInvestment?.userId],
    queryFn: () => {
      const userId = typeof selectedInvestment?.userId === 'object' && selectedInvestment.userId 
        ? (selectedInvestment.userId.id || selectedInvestment.userId._id) 
        : selectedInvestment?.userId;
      
      if (!userId) return null;

      return adminApi.getUserById(userId);
    },
    enabled: !!selectedInvestment?.userId,
  });

  const approveInvestmentMutation = useMutation({
    mutationFn: (id: string) => adminApi.approveInvestment(id),
    onSuccess: (response) => {
      // Use server message if available, otherwise use default
      const toastConfig = handleFormSubmissionResponse(response, 'approve');
      toast(toastConfig);
      
      queryClient.invalidateQueries({ queryKey: ["admin/investments/pending"] });
      queryClient.invalidateQueries({ queryKey: ["admin/stats"] });
    },
    onError: (error: any) => {
      const message = extractMessage(error);
      toast({
        variant: "destructive",
        title: "Investment Approval Failed",
        description: message,
      });
    },
  });

  const rejectInvestmentMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => adminApi.rejectInvestment(id, reason),
    onSuccess: (response) => {
      // Use server message if available, otherwise use default
      const toastConfig = handleFormSubmissionResponse(response, 'reject');
      toast(toastConfig);
      
      queryClient.invalidateQueries({ queryKey: ["admin/investments/pending"] });
      queryClient.invalidateQueries({ queryKey: ["admin/stats"] });
      setShowRejectDialog(false);
      setRejectReason("");
      setInvestmentToReject(null);
    },
    onError: (error: any) => {
      const message = extractMessage(error);
      toast({
        variant: "destructive",
        title: "Investment Rejection Failed",
        description: message,
      });
    },
  });

  const handleApprove = (investmentId: string) => {
    approveInvestmentMutation.mutate(investmentId);
  };

  const handleReject = (investment: Investment) => {
    setInvestmentToReject(investment);
    setShowRejectDialog(true);
  };

  const confirmReject = () => {
    if (investmentToReject && rejectReason.trim()) {
      rejectInvestmentMutation.mutate({
        id: String(investmentToReject.id || (investmentToReject as any)._id),
        reason: rejectReason.trim()
      });
    }
  };

  const handleViewDetails = (investment: Investment) => {
    setSelectedInvestment(investment);
  };

  const handleViewProof = (investment: Investment) => {
    if (investment.transactionProof) {
      let fullUrl = '';
      if (investment.transactionProof.startsWith('http')) {
        fullUrl = investment.transactionProof;
      } else if (investment.transactionProof.startsWith('/')) {
        fullUrl = (process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000') + investment.transactionProof;
      } else {
        fullUrl = (process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000') + '/uploads/proofs/' + investment.transactionProof;
      }
      window.open(fullUrl, '_blank');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Investment Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Pending Investment Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingInvestments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No pending investments to approve</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Proof</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingInvestments.map((investment) => (
                  <TableRow key={investment.id || investment._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">User ID: {typeof investment.userId === 'object' && investment.userId
                          ? `${investment.userId.fullName} (@${investment.userId.username})`
                          : investment.userId}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      PKR {investment.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>{investment.plan}</TableCell>
                    <TableCell className="capitalize">{investment.status}</TableCell>
                    <TableCell className="capitalize">{investment.paymentMethod === 'usdt_trc20' ? 'USDT (TRC20)' : investment.paymentMethod}</TableCell>
                    <TableCell>
                      {format(new Date(investment.createdAt), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      {investment.transactionProof ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewProof(investment)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      ) : (
                        <span className="text-gray-400">No proof</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleViewDetails(investment)}
                          variant="outline"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(String(investment.id || investment._id))}
                          disabled={approveInvestmentMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleReject(investment)}
                          disabled={rejectInvestmentMutation.isPending}
                          variant="destructive"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Investment Details Dialog */}
      <Dialog open={!!selectedInvestment} onOpenChange={() => setSelectedInvestment(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Investment Details</DialogTitle>
            <DialogDescription>
              Detailed information about the investment request
            </DialogDescription>
          </DialogHeader>
          {selectedInvestment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Amount</Label>
                  <p className="text-lg font-semibold">
                    PKR {selectedInvestment.amount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Plan</Label>
                  <p className="capitalize">{selectedInvestment.plan}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Payment Method</Label>
                  <p className="capitalize">{selectedInvestment.paymentMethod === 'usdt_trc20' ? 'USDT (TRC20)' : selectedInvestment.paymentMethod}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge variant="outline">{selectedInvestment.status}</Badge>
                </div>
              </div>
              
              {selectedInvestment.notes && (
                <div>
                  <Label className="text-sm font-medium">Notes</Label>
                  <p className="text-sm text-gray-600">{selectedInvestment.notes}</p>
                </div>
              )}
              
              {userDetails && (
                <div>
                  <Label className="text-sm font-medium">User Information</Label>
                  <div className="bg-gray-50 p-3 rounded">
                    <p><strong>Name:</strong> {userDetails.fullName}</p>
                    <p><strong>Email:</strong> {userDetails.email}</p>
                    <p><strong>Phone:</strong> {userDetails.phone || 'Not provided'}</p>
                  </div>
                </div>
              )}
              
              <div>
                <Label className="text-sm font-medium">Created At</Label>
                <p>{format(new Date(selectedInvestment.createdAt), "PPP 'at' HH:mm")}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Investment Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Investment</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this investment request. This will be communicated to the user.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reject-reason">Reason for Rejection</Label>
              <Textarea
                id="reject-reason"
                placeholder="Enter the reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowRejectDialog(false);
              setRejectReason("");
              setInvestmentToReject(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmReject}
              disabled={!rejectReason.trim() || rejectInvestmentMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {rejectInvestmentMutation.isPending ? "Rejecting..." : "Reject Investment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
