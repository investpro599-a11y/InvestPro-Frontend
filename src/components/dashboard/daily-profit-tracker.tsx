"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, TrendingUp, Layers, CheckCircle2, DollarSign, Calendar } from "lucide-react";

export interface DailyProfitLog {
  id: string;
  investmentId: number;
  plan: string;
  planLabel: string;
  accountLabel: string;
  date: string;
  formattedDate: string;
  timestamp: number;
  amount: number;
  status: string;
}

export interface AccountProfitSummary {
  investmentId: number;
  plan: string;
  planLabel: string;
  accountLabel: string;
  amount: number;
  roiRate: number;
  dailyRoi: number;
  totalEarnedRoi: number;
  daysActive: number;
  startDate: string;
  status: string;
}

export interface DailyProfitsResponse {
  totalDailyProfit: number;
  accounts: AccountProfitSummary[];
  dailyLogs: DailyProfitLog[];
}

export function DailyProfitTracker() {
  const [selectedAccount, setSelectedAccount] = useState<string>("all");

  const { data, isLoading } = useQuery<DailyProfitsResponse>({
    queryKey: ["dashboard/daily-profits"],
    queryFn: dashboardApi.getDailyProfits,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Card className="glass-card border-sky-500/25 bg-[#0e2238]/90 p-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-48 bg-slate-800" />
          <Skeleton className="h-20 w-full bg-slate-800" />
          <Skeleton className="h-20 w-full bg-slate-800" />
          <Skeleton className="h-20 w-full bg-slate-800" />
        </div>
      </Card>
    );
  }

  const accounts = data?.accounts || [];
  const dailyLogs = data?.dailyLogs || [];

  // Filter logs by selected account
  const filteredLogs = selectedAccount === "all"
    ? dailyLogs
    : dailyLogs.filter(log => String(log.investmentId) === selectedAccount);

  const selectedAccountSummary = accounts.find(a => String(a.investmentId) === selectedAccount);

  return (
    <div className="space-y-6">
      {/* Account Overview Cards */}
      {accounts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Everyday Profit Card */}
          <div className="glass-card border-emerald-500/30 bg-gradient-to-br from-[#0c2626] to-[#071921] p-5 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Total Everyday Profit</p>
                <p className="text-2xl font-extrabold font-display text-emerald-300 mt-1">
                  +${(data?.totalDailyProfit || 0).toFixed(2)} <span className="text-xs font-medium text-emerald-400/70">/ day</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3 font-medium">
              Combined daily ROI yield across {accounts.length} active {accounts.length === 1 ? 'account' : 'accounts'}
            </p>
          </div>

          {/* Active Accounts Summary */}
          {accounts.slice(0, 2).map((acc) => (
            <div 
              key={acc.investmentId}
              onClick={() => setSelectedAccount(String(acc.investmentId))}
              className={`glass-card cursor-pointer p-5 rounded-2xl transition-all border ${
                selectedAccount === String(acc.investmentId)
                  ? 'border-sky-400 bg-sky-500/10 shadow-lg shadow-sky-500/10'
                  : 'border-sky-500/20 bg-[#0e2238]/90 hover:border-sky-400/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-sky-400 uppercase tracking-wider">{acc.planLabel}</p>
                  <p className="text-xl font-extrabold text-white mt-1">
                    +${acc.dailyRoi.toFixed(2)} <span className="text-xs font-medium text-slate-400">/ day</span>
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300">
                  <Layers className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-300 font-medium pt-2 border-t border-sky-500/10">
                <span>Account #${acc.investmentId} (${acc.amount.toLocaleString()})</span>
                <span className="text-emerald-400 font-bold">Total: +${acc.totalEarnedRoi.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Transactions Container (Designed matching the uploaded screenshot) */}
      <Card className="glass-card border-sky-500/25 bg-[#0e2238]/95 shadow-2xl rounded-3xl overflow-hidden">
        <CardHeader className="border-b border-sky-500/20 pb-5 pt-6 px-6 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-extrabold font-display text-white tracking-tight">
                Recent Transactions
              </CardTitle>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Real-time per-day ROI profit credits for your investment accounts
              </p>
            </div>

            {/* Account Selector Tabs */}
            {accounts.length > 0 && (
              <div className="flex items-center gap-1.5 bg-[#07172b] p-1.5 rounded-2xl border border-sky-500/20 overflow-x-auto max-w-full">
                <Button
                  variant={selectedAccount === "all" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedAccount("all")}
                  className={`text-xs font-bold rounded-xl px-3 py-1.5 transition-all ${
                    selectedAccount === "all"
                      ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow"
                      : "text-slate-300 hover:text-white hover:bg-sky-500/10"
                  }`}
                >
                  All Accounts ({accounts.length})
                </Button>
                {accounts.map((acc) => (
                  <Button
                    key={acc.investmentId}
                    variant={selectedAccount === String(acc.investmentId) ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedAccount(String(acc.investmentId))}
                    className={`text-xs font-bold rounded-xl px-3 py-1.5 transition-all whitespace-nowrap ${
                      selectedAccount === String(acc.investmentId)
                        ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow"
                        : "text-slate-300 hover:text-white hover:bg-sky-500/10"
                    }`}
                  >
                    #{acc.investmentId} ({acc.planLabel})
                  </Button>
                ))}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6 sm:p-8">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 bg-[#07172b]/50 rounded-2xl border border-dashed border-sky-500/20">
              <Activity className="h-12 w-12 mx-auto mb-3 text-sky-400 opacity-60 animate-pulse" />
              <p className="text-base font-extrabold text-white">No profit transactions yet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Once an investment account is approved, everyday profits will be credited and logged right here daily.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-4 sm:p-5 bg-[#091b30] hover:bg-[#0c233e] border border-sky-500/20 hover:border-sky-400/40 rounded-2xl transition-all duration-200 group shadow-sm"
                >
                  {/* Left: Icon + Title + Date */}
                  <div className="flex items-center space-x-4">
                    {/* Blue squircle badge matching screenshot */}
                    <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform">
                      <Activity className="h-6 w-6 stroke-[2.5]" />
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-white font-display tracking-wide">
                        Profit
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs sm:text-sm font-medium text-slate-400">
                          {log.formattedDate}
                        </span>
                        {selectedAccount === "all" && accounts.length > 1 && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-400/20 text-sky-300">
                            {log.accountLabel.split(' ')[0]} {log.accountLabel.split(' ')[1]}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Green Amount + Green Status (Matching screenshot layout) */}
                  <div className="text-right space-y-0.5">
                    <p className="text-base sm:text-lg font-extrabold text-emerald-400 font-display tracking-tight">
                      +${log.amount.toFixed(2)}
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-emerald-400/90 flex items-center justify-end gap-1">
                      {log.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
