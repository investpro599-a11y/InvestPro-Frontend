"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet, TrendingUp, Users, HandCoins, ArrowUp, Clock, RefreshCw, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export function StatsGrid() {
  const { data: stats, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["dashboard/stats"],
    queryFn: dashboardApi.getStats,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalProfits = (stats?.paidCommissions || 0) + (stats?.availableROI || 0);

  return (
    <div className="space-y-6 mb-8">
      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefetching}
          className="flex items-center space-x-2 rounded-xl border-white/10 bg-slate-900/40 text-slate-300 hover:text-white"
        >
          <RefreshCw className={`h-4 w-4 text-blue-400 ${isRefetching ? 'animate-spin' : ''}`} />
          <span>{isRefetching ? 'Refreshing...' : 'Refresh Stats'}</span>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 md:gap-6">
        {/* Total Investments Card */}
        <Card className="glass-card border-sky-500/25 bg-[#0e2238]/90">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-bold text-slate-300 flex items-center gap-1.5">
                  Total Investments
                  <span className="node-dot-blue ml-1" />
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight">
                  ${(stats?.investmentAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-sky-500/15 border border-sky-400/30 text-sky-400">
                <Wallet className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Commissions Card */}
        <Card className="glass-card border-indigo-500/25 bg-[#0e2238]/90">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-bold text-slate-300 flex items-center gap-1.5">
                  Total Commissions
                  <span className="node-dot ml-1" />
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold font-display text-indigo-300 tracking-tight">
                  ${parseFloat(String(stats?.totalCommissions || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-indigo-500/15 border border-indigo-400/30 text-indigo-400">
                <ArrowUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily ROI Card */}
        <Card className="glass-card border-emerald-500/25 bg-[#0e2238]/90">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-bold text-slate-300 flex items-center gap-1.5">
                  Daily ROI Rate
                  <span className="node-dot ml-1" />
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold font-display text-emerald-400 tracking-tight">
                  ${(stats?.dailyROI || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-400">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Balance Card */}
        <Card className="glass-card border-amber-500/25 bg-[#0e2238]/90">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-bold text-slate-300 flex items-center gap-1.5">
                  Current Balance
                  <span className="node-dot-blue ml-1" />
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold font-display text-amber-300 tracking-tight">
                  ${(stats?.currentBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-400/30 text-amber-400">
                <HandCoins className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Binary Tree Volumes */}
        <Card className="glass-card border-sky-500/20 bg-[#0e2238]/90">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-300">
                  Left Leg Volume
                </p>
                <p className="text-xl sm:text-2xl font-extrabold font-display text-sky-300 mt-1">
                  ${(stats?.leftVolume || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-sky-500/15 border border-sky-400/30 text-sky-400">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-indigo-500/20 bg-[#0e2238]/90">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-300">
                  Right Leg Volume
                </p>
                <p className="text-xl sm:text-2xl font-extrabold font-display text-indigo-300 mt-1">
                  ${(stats?.rightVolume || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-indigo-500/15 border border-indigo-400/30 text-indigo-400">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-teal-500/20 bg-[#0e2238]/90 col-span-1 md:col-span-2 lg:col-span-2">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-300 flex items-center gap-1.5">
                  Total Matched Volume
                  <span className="node-dot ml-1" />
                </p>
                <p className="text-xl sm:text-2xl font-extrabold font-display text-teal-300 mt-1">
                  ${(stats?.matchedVolume || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-teal-500/15 border border-teal-400/30 text-teal-400">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily ROI Summary Block */}
        <Card className="glass-card border-sky-500/20 bg-[#0c1c32]/95 col-span-1 md:col-span-2 lg:col-span-4">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <p className="text-lg font-extrabold font-display text-white flex items-center gap-2 mb-1">
                  Daily ROI Earnings Breakdown
                </p>
                <p className="text-xs text-slate-300 font-medium">Withdrawable ROI = Total Credited – Withdrawn Balance</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full lg:w-auto">
                <div className="bg-[#09182b] border border-emerald-500/30 rounded-2xl p-4 text-center">
                  <span className="text-xs font-bold text-emerald-400 block mb-1">Total Credited</span>
                  <span className="text-xl font-extrabold font-display text-emerald-300">
                    ${(stats?.totalCreditedROI || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="bg-[#09182b] border border-rose-500/30 rounded-2xl p-4 text-center">
                  <span className="text-xs font-bold text-rose-400 block mb-1">Total Withdrawn</span>
                  <span className="text-xl font-extrabold font-display text-rose-300">
                    ${(stats?.roiWithdrawn || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="bg-[#09182b] border border-sky-500/30 rounded-2xl p-4 text-center">
                  <span className="text-xs font-bold text-sky-400 block mb-1">Withdrawable ROI</span>
                  <span className="text-xl font-extrabold font-display text-sky-300">
                    ${(stats?.availableROI || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Total Profits Summary */}
      <Card className="glass-card border-sky-400/30 bg-gradient-to-r from-[#091b30] via-[#0d2542] to-[#0a1e38]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-200 flex items-center gap-2">
                Total Cumulative Profits
                <span className="node-dot ml-1" />
              </p>
              <p className="text-3xl font-extrabold font-display text-emerald-400">
                ${totalProfits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400">
              <TrendingUp className="h-7 w-7" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
