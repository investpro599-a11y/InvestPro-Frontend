"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/layout";
import { ProfileForm } from "@/components/profile/profile-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Shield, User, Lock, Database, FileText, Bell } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <Layout>
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header */}
          <div className="glass-panel p-6 rounded-3xl border border-sky-500/25">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center shadow-lg shadow-sky-500/30">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white">
                  Account <span className="gradient-text-primary">Settings</span>
                </h1>
                <p className="text-slate-600 dark:text-slate-300 mt-0.5 text-sm sm:text-base font-medium">
                  Manage your personal information, security, and application preferences.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts for Admin */}
          {isAdmin && (
            <Card className="glass-card border-purple-500/30 bg-white/90 dark:bg-[#0e2238]/90 overflow-hidden shadow-xl">
              <CardHeader className="border-b border-purple-500/20 px-6 py-4 bg-purple-500/10">
                <div className="flex items-center space-x-2 text-purple-700 dark:text-purple-300">
                  <Shield className="w-5 h-5" />
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-white">Admin System Tools</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link href="/admin/database-config">
                  <Button variant="outline" className="w-full justify-start space-x-3 bg-white/50 dark:bg-sky-500/10 border-sky-400/30 hover:bg-sky-500/20 text-slate-900 dark:text-slate-100 font-bold">
                    <Database className="w-4 h-4 text-sky-500" />
                    <span>Database Config</span>
                  </Button>
                </Link>
                <Link href="/admin/logs">
                  <Button variant="outline" className="w-full justify-start space-x-3 bg-white/50 dark:bg-sky-500/10 border-sky-400/30 hover:bg-sky-500/20 text-slate-900 dark:text-slate-100 font-bold">
                    <FileText className="w-4 h-4 text-amber-500" />
                    <span>System Logs</span>
                  </Button>
                </Link>
                <Link href="/admin/users">
                  <Button variant="outline" className="w-full justify-start space-x-3 bg-white/50 dark:bg-sky-500/10 border-sky-400/30 hover:bg-sky-500/20 text-slate-900 dark:text-slate-100 font-bold">
                    <User className="w-4 h-4 text-purple-500" />
                    <span>User Management</span>
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Profile & Security Form Section */}
          <ProfileForm />
        </div>
      </div>
    </Layout>
  );
}
