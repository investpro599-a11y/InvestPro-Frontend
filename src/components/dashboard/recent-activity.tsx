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

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "active":
      return "bg-green-100 text-green-800";
    case "completed":
      return "bg-green-100 text-green-800";
    case "processing":
      return "bg-blue-100 text-blue-800";
    case "maturing":
      return "bg-blue-100 text-blue-800";
    case "cancelled":
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export function RecentActivity() {
  const { isAdmin } = useAuth();
  const { data: investments } = useQuery<{ docs: Investment[] }>({
    queryKey: ["investments"],
    queryFn: investmentApi.getAll,
  });

  const { data: withdrawals } = useQuery<{ docs: Withdrawal[] }>({
    queryKey: ["withdrawals"],
    queryFn: withdrawalApi.getAll,
  });

  const recentInvestments = (investments?.docs || []).slice(0, 3);
  const recentWithdrawals = (withdrawals?.docs || []).slice(0, 3);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Recent Investments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Investments</CardTitle>
            {!isAdmin && (
              <Link href="/investments">
                <Button variant="link" className="text-primary hover:text-primary/80">
                  View All
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentInvestments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Coins className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No investments yet</p>
                {!isAdmin && (
                  <Link href="/investments">
                    <Button className="mt-2">Create First Investment</Button>
                  </Link>
                )}
              </div>
            ) : (
              recentInvestments.map((investment) => (
                <div key={investment._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Coins className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">PKR {investment.amount.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">{investment.plan} plan</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(investment.status)}>
                      {investment.status}
                    </Badge>
                    <p className="text-sm text-gray-500 mt-1">
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Withdrawals</CardTitle>
            {!isAdmin && (
              <Link href="/withdrawals">
                <Button variant="link" className="text-primary hover:text-primary/80">
                  View All
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentWithdrawals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ArrowUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No withdrawals yet</p>
                {!isAdmin && (
                  <Link href="/withdrawals">
                    <Button className="mt-2">Request Withdrawal</Button>
                  </Link>
                )}
              </div>
            ) : (
              recentWithdrawals.map((withdrawal) => (
                <div key={withdrawal._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                      <ArrowUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">PKR {withdrawal.amount.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">{withdrawal.type} Withdrawal</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(withdrawal.status)}>
                      {withdrawal.status}
                    </Badge>
                    <p className="text-sm text-gray-500 mt-1">
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
