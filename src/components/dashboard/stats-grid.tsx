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
    <div className="space-y-4 mb-8">
      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefetching}
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
          <span>{isRefetching ? 'Refreshing...' : 'Refresh Stats'}</span>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 md:gap-6 mb-8">
        {/* Total Investments Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 flex items-center gap-1">
                  Total Investments
                  <span className="relative group">
                    <Info className="h-4 w-4 text-gray-400" />
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                      Sum of all investments you have made (regardless of maturity).
                    </span>
                  </span>
                </p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2">PKR {stats?.totalInvested?.toLocaleString() || "0"}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-lg bg-blue-100">
                <Wallet className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Total Commissions Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 flex items-center gap-1">
                  Total Commissions (Referral Earnings)
                  <span className="relative group">
                    <Info className="h-4 w-4 text-gray-400" />
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                      All referral commissions you have earned minus withdrawn commissions.
                    </span>
                  </span>
                </p>
                <p className="text-lg sm:text-2xl font-bold text-purple-900 mt-1 sm:mt-2">PKR {stats?.totalCommissions?.toLocaleString() || "0"}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-lg bg-purple-100">
                <ArrowUp className="h-6 w-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Daily ROI Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 flex items-center gap-1">
                  Daily ROI (Your Daily Investment Return)
                  <span className="relative group">
                    <Info className="h-4 w-4 text-gray-400" />
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                      This is your daily earning from all active investments (monthly ROI divided by 30).
                    </span>
                  </span>
                </p>
                <p className="text-lg sm:text-2xl font-bold text-green-900 mt-1 sm:mt-2">PKR {stats?.dailyROI?.toLocaleString() || "0"}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-lg bg-green-100">
                <TrendingUp className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Current Balance Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 flex items-center gap-1">
                  Current Balance
                  <span className="relative group">
                    <Info className="h-4 w-4 text-gray-400" />
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                      Your withdrawable balance: matured principal, all profits, and commissions, minus withdrawals.
                    </span>
                  </span>
                </p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2">PKR {stats?.currentBalance?.toLocaleString() || "0"}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-lg bg-yellow-100">
                <HandCoins className="h-6 w-6 text-yellow-700" />
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Daily ROI Summary Block - NEW */}
        <Card className="hover:shadow-lg transition-shadow col-span-1 md:col-span-2 lg:col-span-4">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="mb-2 md:mb-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 flex items-center gap-1 mb-1">
                  Daily ROI Summary
                  <span className="relative group">
                    <Info className="h-4 w-4 text-gray-400" />
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                      Total daily ROI earned so far, total withdrawn, and your withdrawable ROI balance.
                    </span>
                  </span>
                </p>
                <p className="text-xs text-gray-500">Withdrawable ROI = Total Daily ROI Earned – Total Withdrawn</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <div className="bg-green-50 rounded-lg p-3 flex flex-col items-center w-full min-w-[120px]">
                  <span className="text-xs text-gray-500 mb-1">Total Earned</span>
                  <span className="text-lg font-bold text-green-700">PKR {stats?.totalCreditedROI?.toLocaleString() ?? '0'}</span>
                </div>
                <div className="bg-red-50 rounded-lg p-3 flex flex-col items-center w-full min-w-[120px]">
                  <span className="text-xs text-gray-500 mb-1">Withdrawn</span>
                  <span className="text-lg font-bold text-red-700">PKR {stats?.roiWithdrawn?.toLocaleString() ?? '0'}</span>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 flex flex-col items-center w-full min-w-[120px]">
                  <span className="text-xs text-gray-500 mb-1">Withdrawable</span>
                  <span className="text-lg font-bold text-blue-700">PKR {stats?.availableROI?.toLocaleString() ?? '0'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Total Profits Summary */}
      <div className="mt-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 flex items-center gap-1">
                  Total Profits (Summary)
                  <span className="relative group">
                    <Info className="h-4 w-4 text-gray-400" />
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                      This is the sum of your withdrawable commissions and accumulated ROI earned so far.
                    </span>
                  </span>
                </p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2">PKR {totalProfits.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-lg bg-green-100">
                <TrendingUp className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
