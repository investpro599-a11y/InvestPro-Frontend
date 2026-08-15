"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib";
import { Layout } from "@/components/layout";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { InvestmentChart } from "@/components/dashboard/investment-chart";
import { ReferralCard } from "@/components/dashboard/referral-card";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { Button } from "@/components/ui/button";
import { pdfExporter } from "@/lib/pdf-export";
import { Download, Plus, FileText } from "lucide-react";
import { toast } from "sonner";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import Link from "next/link";

export default function Dashboard() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { data: stats } = useQuery({
    queryKey: ["dashboard/stats"],
    queryFn: dashboardApi.getStats,
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const handleExportReport = () => {
    if (stats) {
      pdfExporter.exportDashboardReport(stats);
      toast.success("Dashboard report exported successfully");
    } else {
      toast.error("Unable to export report - data not available");
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <Layout>
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Dashboard Header */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-sky-500/25 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between relative z-10">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/15 border border-sky-400/30 text-xs font-bold text-sky-300 tracking-wider uppercase mb-1">
                  <span className="node-dot" /> Real-Time Portfolio Insights
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-white">
                  Investment <span className="gradient-text-primary">Dashboard</span>
                </h1>
                <p className="text-slate-300 text-sm sm:text-base max-w-xl font-medium">
                  Welcome back, <span className="text-white font-bold">{user.fullName}</span>. Here is your portfolio overview and performance breakdown.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  className="flex items-center justify-center space-x-2 bg-[#0c1e34]/90 border-sky-400/40 text-white hover:bg-sky-500/20"
                  onClick={handleExportReport}
                >
                  <FileText className="h-4 w-4 text-sky-400" />
                  <span className="font-semibold text-white">Export PDF Report</span>
                </Button>
                {!isAdmin && (
                  <Button onClick={() => router.push("/investments")} className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold shadow-lg shadow-sky-500/25">
                    <Plus className="h-4 w-4" />
                    <span>New Investment</span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <StatsGrid />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Investment Chart */}
            <div className="lg:col-span-2">
              <InvestmentChart />
            </div>
            {/* Referral Card */}
            <ReferralCard />
          </div>

          {/* Recent Activity */}
          <RecentActivity />

          {/* Admin Dashboard (Only for admin users) */}
          {isAdmin && <AdminDashboard />}
        </div>
      </div>
    </Layout>
  );
}
