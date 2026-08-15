"use client";

import { useQuery } from "@tanstack/react-query";
import { investmentApi, withdrawalApi } from "@/lib";
import { Investment, Withdrawal, PaginatedResponse } from "../../../shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Coins, ArrowUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/use-auth";

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "pending":
    case "processing":
    case "maturing":
      return "warning";
    case "active":
    case "completed":
      return "success";
    case "cancelled":
    case "rejected":
      return "destructive";
    default:
      return "secondary";
  }
};

export function RecentActivity() {
  const { isAdmin } = useAuth();
  const { data: investments = [] } = useQuery<Investment[]>({
    queryKey: ["investments"],
    queryFn: investmentApi.getAll,
  });

  const { data: withdrawals = [] } = useQuery<Withdrawal[]>({
    queryKey: ["withdrawals"],
    queryFn: withdrawalApi.getAll,
  });

  const recentInvestments = investments.slice(0, 3);
  const recentWithdrawals = withdrawals.slice(0, 3);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Recent Investments */}
      <Card className="glass-card border-sky-500/25 bg-[#0e2238]/90">
        <CardHeader className="border-b border-sky-500/20 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-extrabold font-display text-white">Recent Investments</CardTitle>
            {!isAdmin && (
              <Link href="/investments">
                <Button variant="link" className="text-sky-400 hover:text-sky-300 font-bold">
                  View All →
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3.5">
            {recentInvestments.length === 0 ? (
              <div className="text-center py-10 text-slate-300">
                <Coins className="h-12 w-12 mx-auto mb-3 opacity-60 text-sky-400" />
                <p className="text-sm font-bold">No recent investments recorded</p>
                {!isAdmin && (
                  <Link href="/investments">
                    <Button variant="glass" size="sm" className="mt-3 bg-sky-500/20 text-sky-300 border-sky-400/30">Create First Investment</Button>
                  </Link>
                )}
              </div>
            ) : (
              recentInvestments.map((investment) => (
                <div key={investment.id || investment._id} className="flex items-center justify-between p-4 bg-[#07172b] border border-sky-500/25 rounded-2xl hover:border-sky-400/40 transition-all">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-11 h-11 bg-sky-500/20 border border-sky-400/30 rounded-xl flex items-center justify-center text-sky-300">
                      <Coins className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-extrabold font-display text-white">${investment.amount.toLocaleString()}</p>
                      <p className="text-xs text-slate-300 font-medium capitalize">{investment.plan} Plan</p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant={getStatusBadgeVariant(investment.status)}>
                      {investment.status}
                    </Badge>
                    <p className="text-xs text-slate-400 font-medium">
                      {formatDistanceToNow(new Date(investment.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Withdrawals */}
      <Card className="glass-card border-sky-500/25 bg-[#0e2238]/90">
        <CardHeader className="border-b border-sky-500/20 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-extrabold font-display text-white">Recent Withdrawals</CardTitle>
            {!isAdmin && (
              <Link href="/withdrawals">
                <Button variant="link" className="text-sky-400 hover:text-sky-300 font-bold">
                  View All →
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3.5">
            {recentWithdrawals.length === 0 ? (
              <div className="text-center py-10 text-slate-300">
                <ArrowUp className="h-12 w-12 mx-auto mb-3 opacity-60 text-emerald-400" />
                <p className="text-sm font-bold">No recent payouts requested</p>
                {!isAdmin && (
                  <Link href="/withdrawals">
                    <Button variant="glass" size="sm" className="mt-3 bg-emerald-500/20 text-emerald-300 border-emerald-400/30">Request Withdrawal</Button>
                  </Link>
                )}
              </div>
            ) : (
              recentWithdrawals.map((withdrawal) => (
                <div key={withdrawal.id || withdrawal._id} className="flex items-center justify-between p-4 bg-[#07172b] border border-sky-500/25 rounded-2xl hover:border-sky-400/40 transition-all">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-11 h-11 bg-emerald-500/20 border border-emerald-400/30 rounded-xl flex items-center justify-center text-emerald-400">
                      <ArrowUp className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-extrabold font-display text-white">${withdrawal.amount.toLocaleString()}</p>
                      <p className="text-xs text-slate-300 font-medium capitalize">{withdrawal.type} Payout</p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant={getStatusBadgeVariant(withdrawal.status)}>
                      {withdrawal.status}
                    </Badge>
                    <p className="text-xs text-slate-400 font-medium">
                      {formatDistanceToNow(new Date(withdrawal.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
