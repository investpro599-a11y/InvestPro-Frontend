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
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
          {/* Dashboard Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <Avatar className="w-16 h-16 border-2 border-primary/10">
                    <AvatarImage 
                      src={getFileUrl(user.profilePicture)} 
                      crossOrigin="anonymous"
                    />
                    <AvatarFallback className="text-xl">
                      {user.fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Investment Dashboard</h1>
                  <p className="text-gray-600 mt-1 text-sm sm:text-base">
                    Welcome back, {user.fullName}. Here&apos;s your portfolio overview.
                  </p>
                </div>
              </div>
              <div className="mt-2 md:mt-0 flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button 
                  variant="outline" 
                  className="flex items-center space-x-2 w-full sm:w-auto"
                  onClick={handleExportReport}
                >
                  <FileText className="h-4 w-4" />
                  <span>Export PDF Report</span>
                </Button>
                {!isAdmin && (
                  <Button onClick={() => router.push("/investments")} className="flex items-center space-x-2 w-full sm:w-auto">
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
          <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-3 mb-8">
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

          <p className="mt-4 text-center text-xs sm:text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}
