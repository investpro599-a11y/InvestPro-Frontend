"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { Withdrawal } from "@shared/schema";

interface WithdrawalDetailsProps {
  withdrawal: Withdrawal;
}

export function WithdrawalDetails({ withdrawal }: WithdrawalDetailsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const renderMethodDetails = () => {
    switch (withdrawal.method) {
      case 'easypaisa':
      case 'jazzcash':
        return (
          <div>
            <p className="font-medium text-gray-600">Phone Number:</p>
            <p className="text-sm bg-gray-50 p-2 rounded">{withdrawal.phoneNumber}</p>
          </div>
        );
      
      case 'bank_account':
        return (
          <div className="space-y-2">
            <div>
              <p className="font-medium text-gray-600">Bank Name:</p>
              <p className="text-sm bg-gray-50 p-2 rounded">{withdrawal.bankName}</p>
            </div>
            <div>
              <p className="font-medium text-gray-600">Account Number:</p>
              <p className="text-sm bg-gray-50 p-2 rounded">{withdrawal.accountNumber}</p>
            </div>
          </div>
        );
      
      case 'trc20':
        return (
          <div>
            <p className="font-medium text-gray-600">TRC20 ID:</p>
            <code className="text-xs bg-gray-100 px-2 py-1 rounded block break-all">
              {withdrawal.trcId}
            </code>
          </div>
        );
      
      case 'others':
        return (
          <div className="space-y-2">
            <div>
              <p className="font-medium text-gray-600">Account Name:</p>
              <p className="text-sm bg-gray-50 p-2 rounded">{withdrawal.accountName}</p>
            </div>
            <div>
              <p className="font-medium text-gray-600">Account Number:</p>
              <p className="text-sm bg-gray-50 p-2 rounded">{withdrawal.accountNumber}</p>
            </div>
            <div>
              <p className="font-medium text-gray-600">Platform:</p>
              <p className="text-sm bg-gray-50 p-2 rounded">{withdrawal.platform}</p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Withdrawal Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-medium text-gray-600">Amount:</p>
              <p className="text-lg font-semibold">
                {withdrawal.type === "commission"
                  ? `$${parseFloat(String(withdrawal.amount)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : `$${withdrawal.amount.toLocaleString()}`}
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-600">Type:</p>
              <p className="capitalize">{withdrawal.type}</p>
            </div>
          </div>
          
          <div>
            <p className="font-medium text-gray-600">Method:</p>
            <p className="capitalize">{getMethodDisplayName(withdrawal.method)}</p>
          </div>
          
          <div>
            <p className="font-medium text-gray-600">Status:</p>
            <Badge className={getStatusColor(withdrawal.status)}>
              {withdrawal.status}
            </Badge>
          </div>

          {renderMethodDetails()}

          {withdrawal.txid && (
            <div>
              <p className="font-medium text-gray-600">Transaction ID:</p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded block break-all">
                {withdrawal.txid}
              </code>
            </div>
          )}

          {withdrawal.paymentProof && (
            <div>
              <p className="font-medium text-gray-600">Payment Proof:</p>
              <div className="mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.open(withdrawal.paymentProof, '_blank')}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Proof
                </Button>
              </div>
            </div>
          )}

          {withdrawal.notes && (
            <div>
              <p className="font-medium text-gray-600">Notes:</p>
              <p className="text-sm bg-gray-50 p-2 rounded">{withdrawal.notes}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-medium text-gray-600">Requested:</p>
              <p>{format(new Date(withdrawal.createdAt), "MMM dd, yyyy HH:mm")}</p>
            </div>
            {withdrawal.updatedAt && withdrawal.updatedAt !== withdrawal.createdAt && (
              <div>
                <p className="font-medium text-gray-600">Updated:</p>
                <p>{format(new Date(withdrawal.updatedAt), "MMM dd, yyyy HH:mm")}</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 