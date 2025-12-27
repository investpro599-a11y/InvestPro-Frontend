"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { usePathname, useRouter } from "next/navigation";
import { Layout } from "@/components/layout";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { UserManagement } from "@/components/admin/user-management";
import { InvestmentApproval } from "@/components/admin/investment-approval";
import { WithdrawalApproval } from "@/components/admin/withdrawal-approval";
import { NotificationPanel } from "@/components/notifications/notification-panel";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AdminDashboardPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (!isAdmin) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isAdmin, router]);

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage users, approve investments and withdrawals.</p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Main Admin Content */}
            <div className="xl:col-span-3 space-y-8">
              <AdminDashboard />
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <InvestmentApproval />
                <WithdrawalApproval />
              </div>
            </div>

            {/* Notifications Sidebar */}
            <div className="xl:col-span-1">
              <NotificationPanel />
            </div>
          </div>

          {/* User Management - Full Width */}
          <div className="mt-8">
            <UserManagement />
          </div>
        </div>
      </div>
    </Layout>
  );
}
