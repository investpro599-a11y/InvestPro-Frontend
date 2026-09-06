"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi, investmentApi, withdrawalApi } from "@/lib";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Wallet, 
  TrendingUp, 
  Users, 
  HandCoins, 
  ArrowUpRight, 
  ArrowDownLeft,
  Lock, 
  Activity, 
  Coins, 
  CheckCircle2, 
  RefreshCw,
  Clock,
  ArrowUp,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { InvestmentChart } from "@/components/dashboard/investment-chart";
import { ReferralCard } from "@/components/dashboard/referral-card";
import { DailyProfitTracker } from "@/components/dashboard/daily-profit-tracker";
import { UserPortfolio } from "@/components/dashboard/user-portfolio";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";

export function StatsGrid() {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<"dashboard" | "statistics">("dashboard");

  const { data: stats, isLoading: isStatsLoading, refetch, isRefetching } = useQuery({
    queryKey: ["dashboard/stats"],
    queryFn: dashboardApi.getStats,
    refetchInterval: 30000,
    staleTime: 10000,
  });

  const { data: investments = [] } = useQuery({
    queryKey: ["investments"],
    queryFn: investmentApi.getAll,
  });

  const { data: withdrawals = [] } = useQuery({
    queryKey: ["withdrawals"],
    queryFn: withdrawalApi.getAll,
  });

  const { data: dailyProfitsData } = useQuery({
    queryKey: ["dashboard/daily-profits"],
    queryFn: dashboardApi.getDailyProfits,
  });

  if (isStatsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full rounded-2xl bg-slate-800/60" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="glass-card bg-[#0e2238]/90 p-5 rounded-2xl border-sky-500/20">
              <Skeleton className="h-4 w-2/3 mb-3 bg-slate-800" />
              <Skeleton className="h-7 w-1/2 bg-slate-800" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Calculate dynamic stats
  const totalBalance = (stats?.currentBalance ?? stats?.totalBalance ?? 0);
  const totalInvested = (stats?.investmentAmount ?? stats?.totalInvested ?? 0);
  const totalWithdrawn = (stats?.totalWithdrawn ?? 0);
  const totalProfit = (stats?.totalROI ?? ((stats?.paidCommissions || 0) + (stats?.availableROI || 0)));
  const affiliateIncome = (stats?.totalCommissions ?? stats?.directCommissions ?? 0);
  const networkMembers = (stats?.totalReferrals ?? stats?.activeReferrals ?? 0);
  const availableProfits = (stats?.availableROI ?? stats?.currentBalance ?? totalProfit);

  // Combine recent transactions for the "Recent Transactions" section
  const dailyLogs = dailyProfitsData?.dailyLogs || [];
  const recentTransactions = [
    ...dailyLogs.slice(0, 4).map((log: any) => ({
      id: `profit-${log.id || log.timestamp || Math.random()}`,
      type: "profit",
      title: "Profit",
      subtitle: log.planLabel || `${log.plan || 'Daily'} ROI`,
      amount: log.amount,
      isPositive: true,
      date: log.formattedDate || (log.date ? new Date(log.date).toLocaleDateString() : "Today"),
      status: log.status || "completed"
    })),
    ...investments.slice(0, 2).map((inv: any) => ({
      id: `inv-${inv.id || inv._id}`,
      type: "investment",
      title: "Investment",
      subtitle: `${inv.plan || 'Standard'} Plan`,
      amount: inv.amount,
      isPositive: true,
      date: formatDistanceToNow(new Date(inv.createdAt), { addSuffix: true }),
      status: inv.status
    })),
    ...withdrawals.slice(0, 2).map((w: any) => ({
      id: `w-${w.id || w._id}`,
      type: "withdrawal",
      title: "Withdrawal",
      subtitle: `${w.type || 'Standard'} Payout`,
      amount: w.amount,
      isPositive: false,
      date: formatDistanceToNow(new Date(w.createdAt), { addSuffix: true }),
      status: w.status
    }))
  ].slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner: Investment Lock */}
      {!isAdmin && (
        <div className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-amber-950/40 via-[#1c1917]/60 to-amber-950/30 [html.light_&]:from-[#fffbeb] [html.light_&]:via-[#fef3c7] [html.light_&]:to-[#fffbeb] border border-amber-500/30 [html.light_&]:border-amber-300 shadow-xl">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-500/20 [html.light_&]:bg-amber-100 border border-amber-400/40 [html.light_&]:border-amber-300 flex items-center justify-center text-amber-400 [html.light_&]:text-amber-700 shrink-0 shadow-inner">
              <Lock className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] sm:text-xs uppercase font-extrabold tracking-wider text-amber-300/90 [html.light_&]:text-amber-800 block mb-0.5">
                INVESTMENT LOCK
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-display text-amber-100 [html.light_&]:text-amber-950 tracking-tight">
                335 Days Left
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-amber-300/80 [html.light_&]:text-amber-800/90 mt-0.5">
                Withdrawable: <span className="text-emerald-400 [html.light_&]:text-emerald-700 font-extrabold">${availableProfits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> (profits only)
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => refetch()}
              disabled={isRefetching}
              className="text-amber-400 [html.light_&]:text-amber-700 hover:bg-amber-500/20 rounded-full h-9 w-9 shrink-0"
              title="Refresh Stats"
            >
              <RefreshCw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      )}

      {/* Tab Switcher: Dashboard vs Statistics */}
      <div className="flex justify-center my-2">
        <div className="inline-flex bg-[#07182b] [html.light_&]:bg-slate-200/80 p-1.5 rounded-full border border-sky-500/20 [html.light_&]:border-slate-300 shadow-inner">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-7 py-2 rounded-full text-sm font-extrabold transition-all duration-200 ${
              activeTab === "dashboard"
                ? "bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/30 [html.light_&]:bg-white [html.light_&]:text-slate-900"
                : "text-slate-400 [html.light_&]:text-slate-600 hover:text-white [html.light_&]:hover:text-slate-900"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("statistics")}
            className={`px-7 py-2 rounded-full text-sm font-extrabold transition-all duration-200 ${
              activeTab === "statistics"
                ? "bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/30 [html.light_&]:bg-white [html.light_&]:text-slate-900"
                : "text-slate-400 [html.light_&]:text-slate-600 hover:text-white [html.light_&]:hover:text-slate-900"
            }`}
          >
            Statistics
          </button>
        </div>
      </div>

      {/* TAB CONTENT: DASHBOARD */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* 2-Column Stat Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4 md:gap-5">
            {/* Card 1: Total Balance */}
            <Card className="glass-card bg-[#0e2238]/90 [html.light_&]:bg-white/95 border-sky-500/20 [html.light_&]:border-slate-200/80 rounded-2xl shadow-md">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-300 [html.light_&]:text-slate-600 truncate">
                      Total Balance
                    </p>
                    <p className="text-xl sm:text-2xl font-black font-display text-white [html.light_&]:text-slate-900 tracking-tight">
                      ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-500/15 [html.light_&]:bg-teal-50 border border-teal-400/30 [html.light_&]:border-teal-200 text-teal-400 [html.light_&]:text-teal-600 flex items-center justify-center shrink-0">
                    <Wallet className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Total Investment */}
            <Card className="glass-card bg-[#0e2238]/90 [html.light_&]:bg-white/95 border-emerald-500/20 [html.light_&]:border-slate-200/80 rounded-2xl shadow-md">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-300 [html.light_&]:text-slate-600 truncate">
                      Total Investment
                    </p>
                    <p className="text-xl sm:text-2xl font-black font-display text-emerald-400 [html.light_&]:text-emerald-600 tracking-tight">
                      ${totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/15 [html.light_&]:bg-emerald-50 border border-emerald-400/30 [html.light_&]:border-emerald-200 text-emerald-400 [html.light_&]:text-emerald-600 flex items-center justify-center shrink-0">
                    <Coins className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Total Withdraw */}
            <Card className="glass-card bg-[#0e2238]/90 [html.light_&]:bg-white/95 border-rose-500/20 [html.light_&]:border-slate-200/80 rounded-2xl shadow-md">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-300 [html.light_&]:text-slate-600 truncate">
                      Total Withdraw
                    </p>
                    <p className="text-xl sm:text-2xl font-black font-display text-rose-400 [html.light_&]:text-rose-600 tracking-tight">
                      ${totalWithdrawn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-500/15 [html.light_&]:bg-rose-50 border border-rose-400/30 [html.light_&]:border-rose-200 text-rose-400 [html.light_&]:text-rose-600 flex items-center justify-center shrink-0">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 4: Total Profit */}
            <Card className="glass-card bg-[#0e2238]/90 [html.light_&]:bg-white/95 border-emerald-500/20 [html.light_&]:border-slate-200/80 rounded-2xl shadow-md">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-300 [html.light_&]:text-slate-600 truncate">
                      Total Profit
                    </p>
                    <p className="text-xl sm:text-2xl font-black font-display text-emerald-400 [html.light_&]:text-emerald-600 tracking-tight">
                      ${totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/15 [html.light_&]:bg-emerald-50 border border-emerald-400/30 [html.light_&]:border-emerald-200 text-emerald-400 [html.light_&]:text-emerald-600 flex items-center justify-center shrink-0">
                    <Activity className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 5: Affiliate Income */}
            <Card className="glass-card bg-[#0e2238]/90 [html.light_&]:bg-white/95 border-amber-500/20 [html.light_&]:border-slate-200/80 rounded-2xl shadow-md">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-300 [html.light_&]:text-slate-600 truncate">
                      Affiliate Income
                    </p>
                    <p className="text-xl sm:text-2xl font-black font-display text-amber-400 [html.light_&]:text-amber-600 tracking-tight">
                      ${parseFloat(String(affiliateIncome || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/15 [html.light_&]:bg-amber-50 border border-amber-400/30 [html.light_&]:border-amber-200 text-amber-400 [html.light_&]:text-amber-600 flex items-center justify-center shrink-0">
                    <HandCoins className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 6: Network Members */}
            <Card className="glass-card bg-[#0e2238]/90 [html.light_&]:bg-white/95 border-sky-500/20 [html.light_&]:border-slate-200/80 rounded-2xl shadow-md">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-300 [html.light_&]:text-slate-600 truncate">
                      Network Members
                    </p>
                    <p className="text-xl sm:text-2xl font-black font-display text-sky-400 [html.light_&]:text-sky-600 tracking-tight">
                      {networkMembers}
                    </p>
                  </div>
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-sky-500/15 [html.light_&]:bg-sky-50 border border-sky-400/30 [html.light_&]:border-sky-200 text-sky-400 [html.light_&]:text-sky-600 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions Section */}
          <Card className="glass-card bg-[#0e2238]/90 [html.light_&]:bg-white/95 border-sky-500/25 [html.light_&]:border-slate-200/80 rounded-3xl shadow-xl overflow-hidden">
            <CardHeader className="border-b border-sky-500/15 [html.light_&]:border-slate-200/70 px-6 py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg sm:text-xl font-black font-display text-white [html.light_&]:text-slate-900">
                  Recent Transactions
                </CardTitle>
                <Link href="/investments" className="text-xs sm:text-sm font-bold text-sky-400 hover:text-sky-300 transition-colors">
                  View All →
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {recentTransactions.length === 0 ? (
                <div className="text-center py-8 text-slate-400 [html.light_&]:text-slate-500">
                  <Activity className="w-10 h-10 mx-auto mb-2 opacity-50 text-sky-400" />
                  <p className="text-sm font-bold">No recent transactions recorded</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-[#07172b]/80 [html.light_&]:bg-slate-50 border border-sky-500/20 [html.light_&]:border-slate-200/80 hover:border-sky-400/40 transition-all"
                    >
                      <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          tx.type === "profit"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-400/30"
                            : tx.type === "investment"
                            ? "bg-sky-500/15 text-sky-400 border border-sky-400/30"
                            : "bg-rose-500/15 text-rose-400 border border-rose-400/30"
                        }`}>
                          {tx.type === "profit" ? (
                            <Activity className="w-5 h-5" />
                          ) : tx.type === "investment" ? (
                            <Coins className="w-5 h-5" />
                          ) : (
                            <ArrowUp className="w-5 h-5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white [html.light_&]:text-slate-900 truncate">
                            {tx.title}
                          </p>
                          <p className="text-xs text-slate-400 [html.light_&]:text-slate-500 truncate">
                            {tx.subtitle} • {tx.date}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className={`text-sm sm:text-base font-black font-display ${
                          tx.isPositive
                            ? "text-emerald-400 [html.light_&]:text-emerald-600"
                            : "text-rose-400 [html.light_&]:text-rose-600"
                        }`}>
                          {tx.isPositive ? "+" : "-"}${Number(tx.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 border-sky-400/30 text-sky-300 [html.light_&]:text-sky-700 bg-sky-500/10 capitalize mt-0.5"
                        >
                          {tx.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB CONTENT: STATISTICS */}
      {activeTab === "statistics" && (
        <div className="space-y-6">
          {/* Binary Tree Volumes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="glass-card border-sky-500/20 bg-[#0e2238]/90 [html.light_&]:bg-white/95 rounded-2xl">
              <CardContent className="p-5">
                <p className="text-xs font-bold text-slate-300 [html.light_&]:text-slate-600">Left Leg Volume</p>
                <p className="text-xl sm:text-2xl font-black font-display text-sky-300 [html.light_&]:text-sky-600 mt-1">
                  ${(stats?.leftVolume || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-indigo-500/20 bg-[#0e2238]/90 [html.light_&]:bg-white/95 rounded-2xl">
              <CardContent className="p-5">
                <p className="text-xs font-bold text-slate-300 [html.light_&]:text-slate-600">Right Leg Volume</p>
                <p className="text-xl sm:text-2xl font-black font-display text-indigo-300 [html.light_&]:text-indigo-600 mt-1">
                  ${(stats?.rightVolume || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-teal-500/20 bg-[#0e2238]/90 [html.light_&]:bg-white/95 rounded-2xl">
              <CardContent className="p-5">
                <p className="text-xs font-bold text-slate-300 [html.light_&]:text-slate-600">Total Matched Volume</p>
                <p className="text-xl sm:text-2xl font-black font-display text-teal-300 [html.light_&]:text-teal-600 mt-1">
                  ${(stats?.matchedVolume || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Daily ROI Earnings Breakdown */}
          <Card className="glass-card border-sky-500/20 bg-[#0c1c32]/95 [html.light_&]:bg-white/95 rounded-3xl">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <p className="text-lg font-black font-display text-white [html.light_&]:text-slate-900 mb-1">
                    Daily ROI Earnings Breakdown
                  </p>
                  <p className="text-xs text-slate-300 [html.light_&]:text-slate-600 font-medium">
                    Withdrawable ROI = Total Credited – Withdrawn Balance
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full lg:w-auto">
                  <div className="bg-[#09182b] [html.light_&]:bg-emerald-50 border border-emerald-500/30 rounded-2xl p-4 text-center">
                    <span className="text-xs font-bold text-emerald-400 [html.light_&]:text-emerald-700 block mb-1">Total Credited</span>
                    <span className="text-xl font-black font-display text-emerald-300 [html.light_&]:text-emerald-700">
                      ${(stats?.totalCreditedROI || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="bg-[#09182b] [html.light_&]:bg-rose-50 border border-rose-500/30 rounded-2xl p-4 text-center">
                    <span className="text-xs font-bold text-rose-400 [html.light_&]:text-rose-700 block mb-1">Total Withdrawn</span>
                    <span className="text-xl font-black font-display text-rose-300 [html.light_&]:text-rose-700">
                      ${(stats?.roiWithdrawn || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="bg-[#09182b] [html.light_&]:bg-sky-50 border border-sky-500/30 rounded-2xl p-4 text-center">
                    <span className="text-xs font-bold text-sky-400 [html.light_&]:text-sky-700 block mb-1">Withdrawable ROI</span>
                    <span className="text-xl font-black font-display text-sky-300 [html.light_&]:text-sky-700">
                      ${(stats?.availableROI || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Investment Chart & Referral Cards */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <InvestmentChart />
            </div>
            <ReferralCard />
          </div>

          {/* Everyday Profit Tracker */}
          <DailyProfitTracker />
        </div>
      )}
    </div>
  );
}
