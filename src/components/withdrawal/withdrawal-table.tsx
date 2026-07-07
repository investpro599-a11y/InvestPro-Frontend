"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { withdrawalApi, investmentApi } from "@/lib";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { pdfExporter } from "@/lib/pdf-export";
import { format } from "date-fns";
import { ExternalLink, Download, FileText } from "lucide-react";
import { Withdrawal, Investment, PaginatedResponse } from "@shared/schema";
import { WithdrawalDetails } from "./withdrawal-details";

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

export function WithdrawalTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const { data: withdrawals = [], isLoading } = useQuery<Withdrawal[]>({
    queryKey: ["withdrawals"],
    queryFn: withdrawalApi.getAll,
  });

  const { data: investments = [] } = useQuery<Investment[]>({
    queryKey: ["investments"],
    queryFn: investmentApi.getAll,
  });
  const hasMaturedPrincipal = investments.some((inv) => inv.status === 'completed');

  const filteredWithdrawals = useMemo(() => {
    let filtered = withdrawals;

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (withdrawal) =>
          withdrawal.type.toLowerCase().includes(query) ||
          withdrawal.status.toLowerCase().includes(query) ||
          withdrawal.amount.toString().includes(query) ||
          (withdrawal.walletAddress && withdrawal.walletAddress.toLowerCase().includes(query)) ||
          (withdrawal.txid && withdrawal.txid.toLowerCase().includes(query))
      );
    }

    // Apply filters
    if (filters.status) {
      filtered = filtered.filter((withdrawal) => withdrawal.status === filters.status);
    }

    if (filters.type) {
      filtered = filtered.filter((withdrawal) => withdrawal.type === filters.type);
    }

    return filtered;
  }, [withdrawals, searchQuery, filters]);

  const filterOptions = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "pending", label: "Pending" },
        { value: "processing", label: "Processing" },
        { value: "completed", label: "Completed" },
        { value: "rejected", label: "Rejected" },
      ],
    },
    {
      key: "type",
      label: "Type",
      options: [
        { value: "roi", label: "ROI" },
        { value: "commission", label: "Commission" },
        { value: "mixed", label: "Mixed" },
      ],
    },
  ];

  const handleExportCSV = () => {
    const csvContent = [
      ["Amount", "Type", "Method", "Date", "Status", "TXID"],
      ...filteredWithdrawals.map((withdrawal) => [
        withdrawal.type === "commission"
          ? `$${parseFloat(String(withdrawal.amount)).toFixed(2)}`
          : `$${parseFloat(String(withdrawal.amount)).toLocaleString()}`,
        withdrawal.type,
        getMethodDisplayName(withdrawal.method),
        format(new Date(withdrawal.createdAt), "MMM dd, yyyy"),
        withdrawal.status,
        withdrawal.txid || "",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `withdrawals-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    pdfExporter.exportWithdrawals(filteredWithdrawals);
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
          <CardTitle>Your Withdrawals</CardTitle>
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
        placeholder="Search withdrawals by type, status, amount..."
        filters={filterOptions}
      />

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {filteredWithdrawals.length} of {withdrawals.length} withdrawals
        </div>
        {filteredWithdrawals.length > 0 && (
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

      {/* Withdrawal Table */}
    <Card>
      <CardHeader>
        <CardTitle>Your Withdrawals</CardTitle>
        {!hasMaturedPrincipal && (
          <div className="text-xs text-red-600 mt-2">
            You cannot withdraw your principal until your investment matures (6, 12, or 18 months).
          </div>
        )}
      </CardHeader>
      <CardContent>
          {filteredWithdrawals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
              <p>
                {withdrawals.length === 0
                  ? "No withdrawals found"
                  : "No withdrawals match your search criteria"}
              </p>
              <p className="text-sm">
                {withdrawals.length === 0
                  ? "Request your first withdrawal to get started"
                  : "Try adjusting your search or filters"}
              </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>TXID</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {filteredWithdrawals.map((withdrawal) => (
                <TableRow key={withdrawal.id || withdrawal._id}>
                  <TableCell className="font-medium">
                    {withdrawal.type === "commission"
                      ? `$${parseFloat(String(withdrawal.amount)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : `$${parseFloat(String(withdrawal.amount)).toLocaleString()}`}
                  </TableCell>
                  <TableCell className="capitalize">{withdrawal.type}</TableCell>
                  <TableCell>
                    {format(new Date(withdrawal.createdAt), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{getMethodDisplayName(withdrawal.method)}</div>
                      <div className="text-xs text-gray-500">
                        {getMethodDetails(withdrawal)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(withdrawal.status)}>
                      {withdrawal.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {withdrawal.txid ? (
                      <Button variant="link" size="sm" className="h-auto p-0">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <WithdrawalDetails withdrawal={withdrawal} />
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
