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
    <Card className="glass-card border border-sky-500/20 shadow-2xl">
      <CardHeader className="border-b border-white/10 pb-5">
        <CardTitle className="text-xl font-bold text-white">Your Withdrawals</CardTitle>
        {!hasMaturedPrincipal && (
          <div className="text-xs text-amber-400/90 mt-1 font-medium">
            Note: You cannot withdraw your principal until your investment matures (6, 12, or 18 months).
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-6">
          {filteredWithdrawals.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
              <p className="text-base font-medium text-slate-300">
                {withdrawals.length === 0
                  ? "No withdrawals found"
                  : "No withdrawals match your search criteria"}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {withdrawals.length === 0
                  ? "Request your first withdrawal to get started"
                  : "Try adjusting your search or filters"}
              </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-300 font-semibold">Amount</TableHead>
                  <TableHead className="text-slate-300 font-semibold">Type</TableHead>
                  <TableHead className="text-slate-300 font-semibold">Date</TableHead>
                  <TableHead className="text-slate-300 font-semibold">Method</TableHead>
                  <TableHead className="text-slate-300 font-semibold">Status</TableHead>
                  <TableHead className="text-slate-300 font-semibold">TXID</TableHead>
                  <TableHead className="text-slate-300 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                  {filteredWithdrawals.map((withdrawal) => (
                  <TableRow key={withdrawal.id || withdrawal._id} className="border-slate-800/80 hover:bg-slate-800/30">
                    <TableCell className="font-semibold text-slate-100">
                      {withdrawal.type === "commission"
                        ? `$${parseFloat(String(withdrawal.amount)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : `$${parseFloat(String(withdrawal.amount)).toLocaleString()}`}
                    </TableCell>
                    <TableCell className="capitalize text-slate-200 font-medium">{withdrawal.type}</TableCell>
                    <TableCell className="text-slate-300">
                      {format(new Date(withdrawal.createdAt), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="font-medium text-slate-200 text-sm">{getMethodDisplayName(withdrawal.method)}</div>
                        <div className="text-xs text-slate-400 font-mono">
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
                        <span className="text-xs font-mono text-sky-400 bg-sky-500/10 px-2 py-1 rounded border border-sky-500/20">
                          {withdrawal.txid.length > 12 ? `${withdrawal.txid.slice(0, 10)}...` : withdrawal.txid}
                        </span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <WithdrawalDetails withdrawal={withdrawal} />
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
