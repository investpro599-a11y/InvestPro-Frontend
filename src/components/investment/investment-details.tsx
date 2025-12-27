"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Eye, Download, ExternalLink, Calendar, DollarSign, TrendingUp, FileText, User, Clock } from "lucide-react";
import type { Investment } from "@shared/schema";
import { getFileUrl } from "@/lib/utils";

interface InvestmentDetailsProps {
  investment: Investment;
  trigger?: React.ReactNode;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "active":
      return "bg-green-100 text-green-800";
    case "completed":
      return "bg-green-100 text-green-800";
    case "maturing":
      return "bg-blue-100 text-blue-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending":
      return <Clock className="h-4 w-4" />;
    case "active":
      return <TrendingUp className="h-4 w-4" />;
    case "completed":
      return <DollarSign className="h-4 w-4" />;
    case "maturing":
      return <Calendar className="h-4 w-4" />;
    case "cancelled":
      return <FileText className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

export function InvestmentDetails({ investment, trigger }: InvestmentDetailsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const calculateROI = () => {
    const amount = investment.amount;
    const roiRate = investment.roiRate;
    return (amount * roiRate) / 100;
  };

  const calculateMaturityDate = () => {
    if (!investment.maturityDate) {
      const createdDate = new Date(investment.createdAt);
      const months = investment.plan === "6months" ? 6 : investment.plan === "12months" ? 12 : 18;
      return new Date(createdDate.getTime() + months * 30 * 24 * 60 * 60 * 1000);
    }
    return new Date(investment.maturityDate);
  };

  const getDaysRemaining = () => {
    const maturityDate = calculateMaturityDate();
    const now = new Date();
    const diffTime = maturityDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const handleDownloadProof = () => {
    const url = getFileUrl(investment.transactionProof);
    if (url) window.open(url, '_blank');
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <Eye className="h-4 w-4" />
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Investment Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Investment Overview */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Investment Overview</CardTitle>
                <Badge className={getStatusColor(investment.status)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(investment.status)}
                    {investment.status}
                  </div>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Investment Amount</p>
                  <p className="text-2xl font-bold text-green-600">
                    PKR {investment.amount.toLocaleString()}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">ROI Rate</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {investment.roiRate}%
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Expected ROI</p>
                  <p className="text-xl font-semibold text-purple-600">
                    PKR {calculateROI().toLocaleString()}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Investment Plan</p>
                  <p className="text-lg font-semibold">
                    {investment.plan === "6months" ? "6 Months" : 
                     investment.plan === "12months" ? "12 Months" : "18 Months"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline & Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline & Important Dates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Investment Date</span>
                  <span className="text-sm">
                    {format(new Date(investment.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Maturity Date</span>
                  <span className="text-sm">
                    {format(calculateMaturityDate(), "MMM dd, yyyy")}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Days Remaining</span>
                  <span className={`text-sm font-semibold ${getDaysRemaining() > 30 ? 'text-green-600' : getDaysRemaining() > 7 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {getDaysRemaining()} days
                  </span>
                </div>
                {investment.approvedAt && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Approved Date</span>
                      <span className="text-sm">
                        {format(new Date(investment.approvedAt), "MMM dd, yyyy 'at' h:mm a")}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Payment Method</p>
                  <p className="text-sm font-semibold capitalize">{investment.paymentMethod === 'usdt_trc20' ? 'USDT (TRC20)' : investment.paymentMethod}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Transaction Proof</p>
                  {investment.transactionProof ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadProof}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download Proof
                    </Button>
                  ) : (
                    <span className="text-sm text-gray-500">No proof uploaded</span>
                  )}
                </div>
              </div>
              {investment.notes && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">Notes</p>
                    <p className="text-sm bg-gray-50 p-3 rounded-md">{investment.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Admin Information */}
          {investment.approvedBy && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Admin Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Approved By</span>
                  <span className="text-sm">Admin ID: {investment.approvedBy}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 