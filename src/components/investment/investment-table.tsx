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
    <Card>
      <CardHeader>
        <CardTitle>Your Investments</CardTitle>
      </CardHeader>
      <CardContent>
          {filteredInvestments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
              <p>
                {data.length === 0
                  ? "No investments found"
                  : "No investments match your search criteria"}
              </p>
              <p className="text-sm">
                {data.length === 0
                  ? "Create your first investment to get started"
                  : "Try adjusting your search or filters"}
              </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Amount</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>ROI Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {filteredInvestments.map((investment) => (
                <TableRow key={investment.id || investment._id}>
                  <TableCell className="font-medium">
                    ${investment.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>{investment.plan}</TableCell>
                  <TableCell>{format(new Date(investment.createdAt), "MMM dd, yyyy")}</TableCell>
                  <TableCell>{investment.roiRate}%</TableCell>
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
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Cancel Investment</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to cancel this investment? This action cannot be undone.
                                  <br />
                                  <br />
                                  <strong>Investment Details:</strong>
                                  <br />
                                  Amount: ${investment.amount.toLocaleString()}
                                  <br />
                                  Plan: {investment.plan === "6months" ? "6 Months" : 
                                         investment.plan === "12months" ? "12 Months" : "18 Months"}
                                  <br />
                                  ID: {investment.id || investment._id}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>No, keep it</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleCancelInvestment(String(investment.id || investment._id))}
                                  className="bg-red-600 hover:bg-red-700"
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
        )}
      </CardContent>
    </Card>
    </div>
  );
}
