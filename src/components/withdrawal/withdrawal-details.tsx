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
import { Eye, ExternalLink, Copy } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Withdrawal } from "@shared/schema";

interface WithdrawalDetailsProps {
  withdrawal: Withdrawal;
}

export function WithdrawalDetails({ withdrawal }: WithdrawalDetailsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-amber-500/15 text-amber-300 border border-amber-500/30";
      case "processing":
        return "bg-sky-500/15 text-sky-300 border border-sky-500/30";
      case "completed":
        return "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40";
      case "rejected":
        return "bg-rose-500/15 text-rose-300 border border-rose-500/30";
      default:
        return "bg-slate-700/50 text-slate-300 border border-slate-600/50";
    }
  };

  const getMethodDisplayName = (method?: string) => {
    if (!method) return "Direct Transfer / Wallet";
    switch (method.toLowerCase()) {
      case "easypaisa":
        return "EasyPaisa";
      case "jazzcash":
        return "JazzCash";
      case "bank_account":
        return "Bank Account";
      case "trc20":
        return "USDT (TRC20)";
      case "others":
        return "Other Platform";
      default:
        return method.toUpperCase();
    }
  };

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard.`,
        duration: 2000,
      });
    } catch {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const renderMethodDetails = () => {
    switch (withdrawal.method) {
      case "easypaisa":
      case "jazzcash":
        return (
          <div>
            <p className="font-medium text-slate-400 text-sm mb-1">Phone Number:</p>
            <p className="text-sm bg-slate-800/60 text-slate-200 border border-slate-700/50 p-2.5 rounded-lg font-mono">{withdrawal.phoneNumber || "N/A"}</p>
          </div>
        );
      
      case "bank_account":
        return (
          <div className="space-y-2">
            <div>
              <p className="font-medium text-slate-400 text-sm mb-1">Bank Name:</p>
              <p className="text-sm bg-slate-800/60 text-slate-200 border border-slate-700/50 p-2.5 rounded-lg">{withdrawal.bankName || "N/A"}</p>
            </div>
            <div>
              <p className="font-medium text-slate-400 text-sm mb-1">Account Number:</p>
              <p className="text-sm bg-slate-800/60 text-slate-200 border border-slate-700/50 p-2.5 rounded-lg font-mono">{withdrawal.accountNumber || "N/A"}</p>
            </div>
          </div>
        );
      
      case "trc20":
        return (
          <div>
            <p className="font-medium text-slate-400 text-sm mb-1">TRC20 ID:</p>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-slate-950/80 text-emerald-400 border border-slate-700/60 p-2.5 rounded-lg block break-all font-mono font-medium flex-1">
                {withdrawal.trcId || withdrawal.walletAddress || "N/A"}
              </code>
              {(withdrawal.trcId || withdrawal.walletAddress) && (
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 shrink-0 h-9 w-9"
                  onClick={() => handleCopy(withdrawal.trcId || withdrawal.walletAddress || "", "TRC20 ID")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        );
      
      case "others":
        return (
          <div className="space-y-2">
            <div>
              <p className="font-medium text-slate-400 text-sm mb-1">Account Name:</p>
              <p className="text-sm bg-slate-800/60 text-slate-200 border border-slate-700/50 p-2.5 rounded-lg">{withdrawal.accountName || "N/A"}</p>
            </div>
            <div>
              <p className="font-medium text-slate-400 text-sm mb-1">Account Number:</p>
              <p className="text-sm bg-slate-800/60 text-slate-200 border border-slate-700/50 p-2.5 rounded-lg font-mono">{withdrawal.accountNumber || "N/A"}</p>
            </div>
            <div>
              <p className="font-medium text-slate-400 text-sm mb-1">Platform:</p>
              <p className="text-sm bg-slate-800/60 text-slate-200 border border-slate-700/50 p-2.5 rounded-lg">{withdrawal.platform || "N/A"}</p>
            </div>
          </div>
        );
      
      default:
        if (withdrawal.walletAddress) {
          return (
            <div>
              <p className="font-medium text-slate-400 text-sm mb-1">Wallet / Account Details:</p>
              <p className="text-sm bg-slate-800/60 text-slate-200 border border-slate-700/50 p-2.5 rounded-lg break-all font-mono">{withdrawal.walletAddress}</p>
            </div>
          );
        }
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800/60">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-slate-900 border border-sky-500/20 text-slate-100 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-white">Withdrawal Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-medium text-slate-400 text-xs">Amount</p>
              <p className="text-lg font-bold text-white mt-0.5">
                {withdrawal.type === "commission"
                  ? `$${parseFloat(String(withdrawal.amount)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : `$${withdrawal.amount.toLocaleString()}`}
              </p>
            </div>
            <div>
              <p className="font-medium text-slate-400 text-xs">Type</p>
              <p className="capitalize text-slate-200 font-semibold mt-0.5">{withdrawal.type || "N/A"}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-medium text-slate-400 text-xs">Method</p>
              <p className="text-slate-200 font-medium text-sm mt-0.5">{getMethodDisplayName(withdrawal.method)}</p>
            </div>
            <div>
              <p className="font-medium text-slate-400 text-xs mb-1">Status</p>
              <Badge className={getStatusColor(withdrawal.status)}>
                {withdrawal.status}
              </Badge>
            </div>
          </div>

          {renderMethodDetails()}

          {withdrawal.txid && (
            <div>
              <p className="font-medium text-slate-400 text-sm mb-1">Transaction ID:</p>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-slate-950/90 text-sky-400 border border-slate-700/80 px-3 py-2.5 rounded-lg block break-all font-mono font-semibold flex-1 selection:bg-sky-500 selection:text-slate-950">
                  {withdrawal.txid}
                </code>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 shrink-0 h-9 w-9"
                  onClick={() => handleCopy(withdrawal.txid || "", "Transaction ID")}
                  aria-label="Copy Transaction ID"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {withdrawal.paymentProof && (
            <div>
              <p className="font-medium text-slate-400 text-sm mb-1">Payment Proof:</p>
              <div className="mt-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.open(withdrawal.paymentProof, '_blank')}
                  className="border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Proof
                </Button>
              </div>
            </div>
          )}

          {withdrawal.notes && (
            <div>
              <p className="font-medium text-slate-400 text-sm mb-1">Notes:</p>
              <p className="text-sm bg-slate-800/60 text-slate-200 border border-slate-700/50 p-2.5 rounded-lg">{withdrawal.notes}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800">
            <div>
              <p className="font-medium text-slate-400 text-xs">Requested</p>
              <p className="text-slate-300 text-sm mt-0.5">{format(new Date(withdrawal.createdAt), "MMM dd, yyyy HH:mm")}</p>
            </div>
            {withdrawal.updatedAt && withdrawal.updatedAt !== withdrawal.createdAt && (
              <div>
                <p className="font-medium text-slate-400 text-xs">Updated</p>
                <p className="text-slate-300 text-sm mt-0.5">{format(new Date(withdrawal.updatedAt), "MMM dd, yyyy HH:mm")}</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 