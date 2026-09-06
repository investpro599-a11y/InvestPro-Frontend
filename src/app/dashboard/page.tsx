"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { dashboardApi } from "@/lib";
import { Layout } from "@/components/layout";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { Button } from "@/components/ui/button";
import { pdfExporter } from "@/lib/pdf-export";
import { Plus, FileText, Camera } from "lucide-react";
import { toast } from "sonner";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
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
      <div className="py-5 sm:py-7">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 md:px-6 lg:px-8 space-y-6">
          {/* Dashboard Header */}
          <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-sky-500/25">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <Avatar className="w-14 h-14 sm:w-16 sm:h-16 border-2 border-sky-400/40 shadow-lg">
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
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-black font-display text-white [html.light_&]:text-slate-900">
                    Investment <span className="gradient-text-primary">Dashboard</span>
                  </h1>
                  <p className="text-slate-300 [html.light_&]:text-slate-600 mt-0.5 text-xs sm:text-sm font-medium">
                    Welcome back, <span className="text-white [html.light_&]:text-slate-900 font-bold">{user.fullName}</span>. Here&apos;s your portfolio overview.
                  </p>
                </div>
              </div>

              <div className="mt-1 md:mt-0 flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button 
                  variant="outline" 
                  className="bg-sky-500/10 border-sky-400/30 text-sky-200 [html.light_&]:text-sky-800 [html.light_&]:bg-sky-50 hover:bg-sky-500/25 font-bold flex items-center space-x-2 w-full sm:w-auto rounded-xl"
                  onClick={handleExportReport}
                >
                  <FileText className="h-4 w-4" />
                  <span>Export PDF Report</span>
                </Button>
                {!isAdmin && (
                  <Button onClick={() => router.push("/investments")} className="bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold shadow-lg shadow-sky-500/25 flex items-center space-x-2 w-full sm:w-auto rounded-xl">
                    <Plus className="h-4 w-4" />
                    <span>New Investment</span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Main Stats Grid & Tabbed View */}
          <StatsGrid />

          {/* Admin Dashboard (Only for admin users) */}
          {isAdmin && <AdminDashboard />}
        </div>
      </div>
    </Layout>
  );
}
