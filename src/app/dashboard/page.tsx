"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { dashboardApi } from "@/lib";
import { Layout } from "@/components/layout";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { InvestmentChart } from "@/components/dashboard/investment-chart";
import { ReferralCard } from "@/components/dashboard/referral-card";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { Button } from "@/components/ui/button";
import { pdfExporter } from "@/lib/pdf-export";
import { Download, Plus, FileText, Camera } from "lucide-react";
import { toast } from "sonner";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import Link from "next/link";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { UserPortfolio } from '@/components/dashboard/user-portfolio';
import { DailyProfitTracker } from "@/components/dashboard/daily-profit-tracker";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getFileUrl } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";

export default function Dashboard() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ["dashboard/stats"],
    queryFn: dashboardApi.getStats,
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

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("profilePicture", file);
    setIsUploading(true);
    try {
      const res = await apiRequest("POST", "/users/profile-picture", formData);
      const data = await res.json();
      if (data.data && data.data.profilePicture) {
        queryClient.setQueryData(["/auth/me"], (old: any) => ({ 
          ...old, 
          profilePicture: data.data.profilePicture 
        }));
        toast.success("Profile picture updated successfully!");
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err: any) {
      toast.error(err.message || "Could not upload profile picture");
    } finally {
      setIsUploading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <Layout>
      <div className="py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 space-y-6">
          {/* Dashboard Header */}
          <div className="glass-panel p-6 rounded-3xl border border-sky-500/25">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <Avatar className="w-16 h-16 border-2 border-sky-400/40 shadow-lg">
                    <AvatarImage 
                      src={getFileUrl(user.profilePicture)} 
                      crossOrigin="anonymous"
                    />
                    <AvatarFallback className="bg-sky-950 text-sky-200 font-bold text-xl">
                      {user.fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-sky-300" />
                  </div>
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleProfileImageChange}
                  />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
                    Investment <span className="gradient-text-primary">Dashboard</span>
                  </h1>
                  <p className="text-slate-300 mt-1 text-sm sm:text-base font-medium">
                    Welcome back, <span className="text-white font-bold">{user.fullName}</span>. Here&apos;s your portfolio overview.
                  </p>
                </div>
              </div>
              <div className="mt-2 md:mt-0 flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button 
                  variant="outline" 
                  className="bg-sky-500/10 border-sky-400/30 text-sky-200 hover:bg-sky-500/25 font-bold flex items-center space-x-2 w-full sm:w-auto"
                  onClick={handleExportReport}
                >
                  <FileText className="h-4 w-4" />
                  <span>Export PDF Report</span>
                </Button>
                {!isAdmin && (
                  <Button onClick={() => router.push("/investments")} className="bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold shadow-lg shadow-sky-500/25 flex items-center space-x-2 w-full sm:w-auto">
                    <Plus className="h-4 w-4" />
                    <span>New Investment</span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <StatsGrid />

          {/* User Portfolio Section */}
          {!isAdmin && <UserPortfolio />}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-3">
            {/* Investment Chart */}
            <div className="lg:col-span-2">
              <InvestmentChart />
            </div>
            {/* Referral Card */}
            <ReferralCard />
          </div>

          {/* Everyday Profit Tracker */}
          {!isAdmin && <DailyProfitTracker />}

          {/* Recent Activity */}
          <RecentActivity />

          {/* Admin Dashboard (Only for admin users) */}
          {isAdmin && <AdminDashboard />}
        </div>
      </div>
    </Layout>
  );
}
