"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { investmentApi } from "@/lib";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchFilter } from "@/components/ui/search-filter";
import { InvestmentDetails } from "@/components/investment/investment-details";
import { pdfExporter } from "@/lib/pdf-export";
import { format } from "date-fns";
import { Eye, X, Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Investment } from "@shared/schema";

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "bg-amber-500/15 text-amber-300 border border-amber-500/30";
    case "active":
    case "completed":
      return "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40";
    case "maturing":
      return "bg-blue-500/15 text-blue-300 border border-blue-500/30";
    case "cancelled":
      return "bg-rose-500/15 text-rose-300 border border-rose-500/30";
    default:
      return "bg-slate-700/50 text-slate-300 border border-slate-600/50";
  }
};

export function InvestmentTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: investments = [], isLoading } = useQuery<Investment[]>({
    queryKey: ["investments"],
    queryFn: investmentApi.getAll,
  });

  // Use investments array directly
  const data = investments;

  // Cancel investment mutation
  const cancelInvestmentMutation = useMutation({
    mutationFn: (id: string) => investmentApi.delete(id),
    onSuccess: () => {
      toast({
        title: "Investment Cancelled",
        description: "Your investment has been cancelled successfully.",
      });
      // Invalidate and refetch investments
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      setCancellingId(null);
    },
    onError: (error: any) => {
      console.error('Cancel investment error:', error);
      let errorMessage = "Failed to cancel investment. Please try again.";
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.status === 404) {
        errorMessage = "Investment not found. It may have been already deleted or doesn't exist.";
      } else if (error.status === 403) {
        errorMessage = "You can only cancel your own investments.";
      } else if (error.status === 400) {
        errorMessage = "Only pending investments can be cancelled.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setCancellingId(null);
    },
  });

  const handleCancelInvestment = async (id: string) => {
    setCancellingId(id);
    try {
      await cancelInvestmentMutation.mutateAsync(id);
    } catch (error) {
      // Error is handled in onError callback
    }
  };

  // Filter and search investments
  const filteredInvestments = useMemo(() => {
    let filtered = data;

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (investment) =>
          investment.plan.toLowerCase().includes(query) ||
          investment.status.toLowerCase().includes(query) ||
          investment.amount.toString().includes(query) ||
          investment.roiRate.toString().includes(query)
      );
    }

    // Apply filters
    if (filters.status) {
      filtered = filtered.filter((investment) => investment.status === filters.status);
    }

    if (filters.plan) {
      filtered = filtered.filter((investment) => investment.plan === filters.plan);
    }

    return filtered;
  }, [data, searchQuery, filters]);

  const filterOptions = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "pending", label: "Pending" },
        { value: "active", label: "Active" },
        { value: "completed", label: "Completed" },
        { value: "maturing", label: "Maturing" },
        { value: "cancelled", label: "Cancelled" },
      ],
    },
    {
      key: "plan",
      label: "Plan",
      options: [
        { value: "6months", label: "6 Months" },
        { value: "12months", label: "12 Months" },
        { value: "18months", label: "18 Months" },
      ],
    },
  ];

  const handleExportCSV = () => {
    const csvContent = [
      ["Amount", "Plan", "Date", "ROI Rate", "Status", "Payment Method"],
      ...filteredInvestments.map((investment) => [
        `$${investment.amount.toLocaleString()}`,
        investment.plan,
        format(new Date(investment.createdAt), "MMM dd, yyyy"),
        `${investment.roiRate}%`,
        investment.status,
        investment.paymentMethod === 'usdt_trc20' ? 'USDT (TRC20)' : investment.paymentMethod,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `investments-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    pdfExporter.exportInvestments(filteredInvestments);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Investments</CardTitle>
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
    <div className="space-y-6">
      {/* Search and Filter */}
      <SearchFilter
        onSearch={setSearchQuery}
        onFilter={setFilters}
        onClear={() => {
          setSearchQuery("");
          setFilters({});
        }}
        placeholder="Search investments by plan, status, amount..."
        filters={filterOptions}
      />

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {filteredInvestments.length} of {investments.length} investments
        </div>
        {filteredInvestments.length > 0 && (
          <div className="flex space-x-2">
            <Button onClick={handleExportCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={handleExportPDF} variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        )}
      </div>

      {/* Investment Table */}
    <Card className="glass-card border border-sky-500/20 shadow-2xl">
      <CardHeader className="border-b border-white/10 pb-5">
        <CardTitle className="text-xl font-bold text-white">Your Investments</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
          {filteredInvestments.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
              <p className="text-base font-medium text-slate-300">
                {data.length === 0
                  ? "No investments found"
                  : "No investments match your search criteria"}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {data.length === 0
                  ? "Create your first investment to get started"
                  : "Try adjusting your search or filters"}
              </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-300 font-semibold">Amount</TableHead>
                  <TableHead className="text-slate-300 font-semibold">Plan</TableHead>
                  <TableHead className="text-slate-300 font-semibold">Date</TableHead>
                  <TableHead className="text-slate-300 font-semibold">ROI Rate</TableHead>
                  <TableHead className="text-slate-300 font-semibold">Status</TableHead>
                  <TableHead className="text-slate-300 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                  {filteredInvestments.map((investment) => (
                  <TableRow key={investment.id || investment._id} className="border-slate-800/80 hover:bg-slate-800/30">
                    <TableCell className="font-semibold text-slate-100">
                      ${investment.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="capitalize text-slate-200 font-medium">
                      {investment.plan === "6months" ? "6 Months" : investment.plan === "12months" ? "12 Months" : "18 Months"}
                    </TableCell>
                    <TableCell className="text-slate-300">{format(new Date(investment.createdAt), "MMM dd, yyyy")}</TableCell>
                    <TableCell className="text-emerald-400 font-semibold">{investment.roiRate}%</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(investment.status)}>
                        {investment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                          <InvestmentDetails investment={investment} />
                          {investment.status === "pending" && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  disabled={cancellingId === String(investment.id || investment._id)}
                                  className="h-8 w-8 p-0"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-slate-900 border border-slate-700 text-slate-100">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-white">Cancel Investment</AlertDialogTitle>
                                  <AlertDialogDescription className="text-slate-300">
                                    Are you sure you want to cancel this investment? This action cannot be undone.
                                    <br />
                                    <br />
                                    <span className="text-slate-200 font-semibold">Investment Details:</span>
                                    <br />
                                    Amount: ${investment.amount.toLocaleString()}
                                    <br />
                                    Plan: {investment.plan === "6months" ? "6 Months" : 
                                           investment.plan === "12months" ? "12 Months" : "18 Months"}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700">No, keep it</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleCancelInvestment(String(investment.id || investment._id))}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                  >
                                    {cancellingId === String(investment.id || investment._id) ? "Cancelling..." : "Yes, cancel investment"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
    </div>
  );
}
