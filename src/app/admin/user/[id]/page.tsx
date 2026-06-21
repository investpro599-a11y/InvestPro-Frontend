"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, commissionApi, investmentApi, withdrawalApi } from "@/lib";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Power, PowerOff, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { getFileUrl } from "@/lib/utils";
import type { User } from "@shared/schema";

export default function AdminViewUser() {
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const { id } = useParams();
  const userId = String(id);
  const [referrer, setReferrer] = useState<User | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (!isAdmin) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isAdmin, router]);

  const { data: user, isLoading } = useQuery({
    queryKey: ["admin/users", userId],
    queryFn: () => adminApi.getUserById(userId),
    enabled: !!userId,
  });

  const { data: commissionStats } = useQuery({
    queryKey: ['commissions', userId],
    queryFn: () => commissionApi.getAll(),
    enabled: !!userId,
  });

  const { data: allInvestments } = useQuery({
    queryKey: ['admin/investments'],
    queryFn: adminApi.getAllInvestments,
    enabled: !!userId,
  });

  const { data: allWithdrawals } = useQuery({
    queryKey: ['admin/withdrawals'],
    queryFn: adminApi.getAllWithdrawals,
    enabled: !!userId,
  });

  const { data: allLogs } = useQuery({
    queryKey: ['admin/logs', userId],
    queryFn: () => adminApi.getLogs(`userId=${userId}`),
    enabled: !!userId,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const toggleUserStatusMutation = useMutation({
    mutationFn: adminApi.toggleUserStatus,
    onSuccess: (data) => {
      toast({
        title: "User Status Updated",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["admin/users", userId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user status.",
        variant: "destructive",
      });
    },
  });

  const handleToggleUserStatus = () => {
    if (user) {
      toggleUserStatusMutation.mutate(user._id);
    }
  };

  useEffect(() => {
    if (user && user.referredBy) {
      adminApi.getUserById(user.referredBy).then(setReferrer);
    }
  }, [user]);

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p>User not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
              onClick={() => router.push("/admin/users")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
        </div>

        <Card>
          <CardHeader className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={getFileUrl(user.profilePicture)} />
              <AvatarFallback className="text-3xl">
                {user.fullName.split(" ").map(n => n[0]).join("").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl">{user.fullName}</CardTitle>
            <p className="text-gray-500">@{user.username}</p>
            <div className="mt-4">
              <Button 
                variant={user.isActive ? "outline" : "default"}
                className={user.isActive ? "text-orange-600 border-orange-600 hover:bg-orange-50" : ""}
                onClick={handleToggleUserStatus}
                disabled={toggleUserStatusMutation.isPending}
              >
                {user.isActive ? (
                  <>
                    <PowerOff className="h-4 w-4 mr-2" />
                    Deactivate User
                  </>
                ) : (
                  <>
                    <Power className="h-4 w-4 mr-2" />
                    Activate User
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <p className="font-medium text-gray-800">Email</p>
                <p>{user.email}</p>
              </div>
              <div>
                <p className="font-medium text-gray-800">Phone</p>
                <p>{user.phone || "-"}</p>
              </div>
              <div>
                <p className="font-medium text-gray-800">Wallet Address</p>
                <p>{user.walletAddress || "-"}</p>
              </div>
              <div>
                <span className="font-medium text-gray-800">Role</span>
                <span>
                  <Badge variant={user.role === "admin" ? "destructive" : "default"}>
                    {user.role}
                  </Badge>
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-800">Status</span>
                <span>
                  <Badge variant={user.isActive ? "default" : "secondary"}>
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-800">Email Verified</span>
                <span>{user.emailVerified ? "Yes" : "No"}</span>
              </div>
              <div>
                <span className="font-medium text-gray-800">Phone Verified</span>
                <span>{user.phoneVerified ? "Yes" : "No"}</span>
              </div>
              <div>
                <span className="font-medium text-gray-800">2FA Enabled</span>
                <span>{user.twoFactorEnabled ? "Yes" : "No"}</span>
              </div>
              <div>
                <span className="font-medium text-gray-800">Last Login</span>
                <span>{user.lastLogin ? format(new Date(user.lastLogin), "MMMM dd, yyyy 'at' h:mm a") : "-"}</span>
              </div>
              <div>
                <p className="font-medium text-gray-800">Referral Code</p>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">{user.referralCode}</code>
              </div>
              <div>
                <p className="font-medium text-gray-800">Referred By</p>
                <p>{referrer ? `${referrer.fullName} (@${referrer.username})` : "-"}</p>
              </div>
              <div>
                <span className="font-medium text-gray-800">Created At</span>
                <span>{format(new Date(user.createdAt), "MMMM dd, yyyy 'at' h:mm a")}</span>
              </div>
              <div>
                <span className="font-medium text-gray-800">Updated At</span>
                <span>{format(new Date(user.updatedAt), "MMMM dd, yyyy 'at' h:mm a")}</span>
              </div>
            </div>
            <div className="mt-8">
              <h3 className="font-semibold mb-2">Investments</h3>
              {allInvestments ? (
                <table className="min-w-full divide-y divide-gray-200 mb-4">
                  <thead>
                    <tr>
                      <th className="px-4 py-2">Amount</th>
                      <th className="px-4 py-2">Plan</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">ROI Rate</th>
                      <th className="px-4 py-2">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allInvestments.filter((inv: any) => inv.userId === user._id).map((inv: any) => (
                      <tr key={inv._id}>
                        <td className="px-4 py-2">PKR {inv.amount.toLocaleString()}</td>
                        <td className="px-4 py-2">{inv.plan}</td>
                        <td className="px-4 py-2">{inv.status}</td>
                        <td className="px-4 py-2">{inv.roiRate}%</td>
                        <td className="px-4 py-2">{format(new Date(inv.createdAt), 'MMM dd, yyyy')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <div className="text-gray-500">No investments found</div>}
            </div>
            <div className="mt-8">
              <h3 className="font-semibold mb-2">Withdrawals</h3>
              {allWithdrawals ? (
                <table className="min-w-full divide-y divide-gray-200 mb-4">
                  <thead>
                    <tr>
                      <th className="px-4 py-2">Amount</th>
                      <th className="px-4 py-2">Type</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Wallet</th>
                      <th className="px-4 py-2">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allWithdrawals.filter((w: any) => w.userId === user._id).map((w: any) => (
                      <tr key={w._id}>
                        <td className="px-4 py-2">PKR {w.amount.toLocaleString()}</td>
                        <td className="px-4 py-2">{w.type}</td>
                        <td className="px-4 py-2">{w.status}</td>
                        <td className="px-4 py-2">{w.walletAddress}</td>
                        <td className="px-4 py-2">{format(new Date(w.createdAt), 'MMM dd, yyyy')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <div className="text-gray-500">No withdrawals found</div>}
            </div>
            <div className="mt-8">
              <h3 className="font-semibold mb-2">Activity Logs</h3>
              {allLogs ? (
                <table className="min-w-full divide-y divide-gray-200 mb-4">
                  <thead>
                    <tr>
                      <th className="px-4 py-2">Action</th>
                      <th className="px-4 py-2">Details</th>
                      <th className="px-4 py-2">IP</th>
                      <th className="px-4 py-2">User Agent</th>
                      <th className="px-4 py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allLogs.filter((log: any) => log.userId === user._id).map((log: any) => (
                      <tr key={log._id}>
                        <td className="px-4 py-2">{log.action}</td>
                        <td className="px-4 py-2">{log.details || '-'}</td>
                        <td className="px-4 py-2">{log.ipAddress || '-'}</td>
                        <td className="px-4 py-2">{log.userAgent || '-'}</td>
                        <td className="px-4 py-2">{format(new Date(log.createdAt), 'MMM dd, yyyy')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <div className="text-gray-500">No logs found</div>}
            </div>
            <div className="mt-8">
              <h3 className="font-semibold mb-2">Commission Breakdown</h3>
              {commissionStats && commissionStats.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200 mb-4">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => {
                      const total = commissionStats
                        .filter((c: any) => c.level === level)
                        .reduce((sum: number, c: any) => sum + c.amount, 0);
                      return (
                        <tr key={level}>
                          <td className="px-4 py-2">{level === 1 ? 'Direct' : `Level ${level}`}</td>
                          <td className="px-4 py-2">PKR {total.toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="text-gray-500">No commissions yet</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 