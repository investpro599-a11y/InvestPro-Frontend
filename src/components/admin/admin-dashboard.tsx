"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Investment, Withdrawal } from "@shared/schema";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export function AdminDashboard() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();

  const { data: adminStats, isLoading: statsLoading, refetch: refetchStats, isRefetching: isRefetchingStats } = useQuery({
    queryKey: ["admin/stats"],
    queryFn: adminApi.getStats,
    enabled: isAdmin,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  const { data: allInvestments = [], isLoading: investmentsLoading, refetch: refetchInvestments } = useQuery<Investment[]>({
    queryKey: ["admin/investments"],
    queryFn: adminApi.getAllInvestments,
    enabled: isAdmin,
    refetchInterval: 30000,
    staleTime: 10000,
  });

  const { data: allWithdrawals = [], isLoading: withdrawalsLoading, refetch: refetchWithdrawals } = useQuery<Withdrawal[]>({
    queryKey: ["admin/withdrawals"],
    queryFn: adminApi.getAllWithdrawals,
    enabled: isAdmin,
    refetchInterval: 30000,
    staleTime: 10000,
  });

  const handleRefreshAll = () => {
    refetchStats();
    refetchInvestments();
    refetchWithdrawals();
  };

  if (!isAdmin) return null;

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-red-600" />
            </div>
            <CardTitle>Admin Dashboard</CardTitle>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshAll}
              disabled={isRefetchingStats}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefetchingStats ? 'animate-spin' : ''}`} />
              <span>{isRefetchingStats ? 'Refreshing...' : 'Refresh'}</span>
            </Button>
            <Badge variant="destructive">Admin Access</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {statsLoading ? "..." : adminStats?.users?.total || 0}
            </p>
            <p className="text-sm text-blue-700">Total Users</p>
            <p className="text-xs text-blue-600 mt-1">
              {adminStats && adminStats.users?.total > 0 ? Math.round((adminStats.users.active / adminStats.users.total) * 100) : 0}% active
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {statsLoading ? "..." : adminStats?.investments?.total || 0}
            </p>
            <p className="text-sm text-green-700">Total Investments</p>
            <p className="text-xs text-green-600 mt-1">
              {adminStats?.investments?.pending || 0} pending
            </p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {statsLoading ? "..." : adminStats?.withdrawals?.pending || 0}
            </p>
            <p className="text-sm text-yellow-700">Pending Withdrawals</p>
            <p className="text-xs text-yellow-600 mt-1">
              {adminStats?.withdrawals?.total || 0} total
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">
              PKR {statsLoading ? "..." : (adminStats?.commissions?.total || 0).toLocaleString()}
            </p>
            <p className="text-sm text-purple-700">Total Commissions</p>
            <p className="text-xs text-purple-600 mt-1">
              PKR {(adminStats?.revenue?.total || 0).toLocaleString()} revenue
            </p>
          </div>
        </div>

        {/* Growth Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-indigo-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-indigo-700 mb-2">System Overview</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-indigo-600">Active Users:</span>
                <span className="text-sm font-medium text-indigo-700">
                  {adminStats?.users?.active || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-indigo-600">Total Investments:</span>
                <span className="text-sm font-medium text-indigo-700">
                  {adminStats?.investments?.total || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-indigo-600">Pending Investments:</span>
                <span className="text-sm font-medium text-indigo-700">
                  {adminStats?.investments?.pending || 0}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-emerald-700 mb-2">Financial Overview</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-emerald-600">Total Commissions:</span>
                <span className="text-sm font-medium text-emerald-700">
                  PKR {(adminStats?.commissions?.total || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-emerald-600">System Revenue:</span>
                <span className="text-sm font-medium text-emerald-700">
                  PKR {(adminStats?.revenue?.total || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-emerald-600">Pending Withdrawals:</span>
                <span className="text-sm font-medium text-emerald-700">
                  {adminStats?.withdrawals?.pending || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* All Investments Table */}
        <div>
          <h2 className="text-xl font-semibold mb-2">All Investments</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Payment Method</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                </tr>
              </thead>
              <tbody>
                {investmentsLoading ? (
                  <tr><td colSpan={6} className="text-center py-4">Loading...</td></tr>
                ) : allInvestments.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-4 text-gray-500">No investments found</td></tr>
                ) : (
                  allInvestments.map((inv: Investment) => (
                    <tr key={inv._id} className="border-b">
                      <td className="px-4 py-2">
                        {typeof inv.userId === 'object' && inv.userId ? 
                          `${inv.userId.fullName} (@${inv.userId.username})` : 
                          inv.userId || 'Unknown User'
                        }
                      </td>
                      <td className="px-4 py-2">PKR {parseFloat(String(inv.amount)).toLocaleString()}</td>
                      <td className="px-4 py-2">{inv.plan}</td>
                      <td className="px-4 py-2">
                        <span className="capitalize px-2 py-1 rounded text-xs font-medium bg-gray-100">
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {inv.paymentMethod === 'usdt_trc20' ? 'USDT (TRC20)' : inv.paymentMethod}
                      </td>
                      <td className="px-4 py-2">{format(new Date(inv.createdAt), "MMM dd, yyyy")}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* All Withdrawals Table */}
        <div>
          <h2 className="text-xl font-semibold mb-2">All Withdrawals</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Payment Method</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                </tr>
              </thead>
              <tbody>
                {withdrawalsLoading ? (
                  <tr><td colSpan={5} className="text-center py-4">Loading...</td></tr>
                ) : allWithdrawals.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-4 text-gray-500">No withdrawals found</td></tr>
                ) : (
                  allWithdrawals.map((withdrawal: Withdrawal) => (
                    <tr key={withdrawal._id} className="border-b">
                      <td className="px-4 py-2">
                        {typeof withdrawal.userId === 'object' && withdrawal.userId ? 
                          `${(withdrawal.userId as any).fullName} (@${(withdrawal.userId as any).username})` : 
                          withdrawal.userId || 'Unknown User'
                        }
                      </td>
                      <td className="px-4 py-2">PKR {parseFloat(String(withdrawal.amount)).toLocaleString()}</td>
                      <td className="px-4 py-2">
                        <span className="capitalize px-2 py-1 rounded text-xs font-medium bg-gray-100">
                          {withdrawal.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">{withdrawal.method}</td>
                      <td className="px-4 py-2">{format(new Date(withdrawal.createdAt), "MMM dd, yyyy")}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CommissionRatesAdmin() {
  const staticCommissionRates = {
    1: 7,
    2: 1,
    3: 1,
    4: 1,
    5: 0.5,
    6: 0.5,
    7: 0.25,
    8: 0.25,
    9: 0.25,
    10: 0.25
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Commission Rates (Static)</CardTitle>
        <p className="text-sm text-gray-500">These are the current commission rates for each referral level. Editing is disabled while the API is unavailable.</p>
      </CardHeader>
      <CardContent>
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Commission (%)</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(staticCommissionRates).map(([level, rate]) => (
              <tr key={level}>
                <td className="px-4 py-2">{level}</td>
                <td className="px-4 py-2">{rate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
