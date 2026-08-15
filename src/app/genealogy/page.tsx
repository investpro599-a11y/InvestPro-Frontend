"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { usePathname, useRouter } from "next/navigation";
import { Layout } from "@/components/layout";
import { UserGenealogyTree } from "@/components/genealogy/user-genealogy-tree";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Genealogy() {
  const { isAuthenticated, isAdmin } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <div className="py-6 px-2 sm:px-4 lg:px-8 w-full max-w-[98%] xl:max-w-[1700px] mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 glass-panel p-6 rounded-3xl border border-sky-500/25">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white">Genealogy <span className="gradient-text-primary">Tree</span></h1>
            <p className="text-slate-300 mt-1 font-medium text-sm sm:text-base">View your personal referral network and team structure in a responsive view.</p>
          </div>
          {isAdmin && (
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="bg-sky-500/20 text-sky-300 border border-sky-400/30 font-bold px-3 py-1">
                <Shield className="h-3.5 w-3.5 mr-1" />
                Admin Access
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push("/admin/genealogy")}
                className="bg-sky-500/10 border-sky-400/30 text-sky-200 hover:bg-sky-500/30 font-bold flex items-center space-x-2"
              >
                <span>Admin Genealogy</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Commission Levels Quick Reference Bar */}
        <div className="glass-panel p-4 rounded-2xl border border-sky-500/20 bg-[#08182b]/80">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs uppercase tracking-wider font-extrabold text-sky-300 flex items-center gap-2">
              <span className="node-dot" /> Referral Commission Levels Rate Card
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2 text-center text-xs font-semibold">
            <div className="bg-[#0c1e34] p-2 rounded-xl border border-sky-500/20"><span className="text-slate-400 block text-[10px]">Level 1 (Direct)</span><span className="text-emerald-400 font-bold text-sm">5%</span></div>
            <div className="bg-[#0c1e34] p-2 rounded-xl border border-sky-500/20"><span className="text-slate-400 block text-[10px]">Level 2</span><span className="text-sky-300 font-bold text-sm">1%</span></div>
            <div className="bg-[#0c1e34] p-2 rounded-xl border border-sky-500/20"><span className="text-slate-400 block text-[10px]">Level 3</span><span className="text-sky-300 font-bold text-sm">0.5%</span></div>
            <div className="bg-[#0c1e34] p-2 rounded-xl border border-sky-500/20"><span className="text-slate-400 block text-[10px]">Level 4</span><span className="text-sky-300 font-bold text-sm">0.5%</span></div>
            <div className="bg-[#0c1e34] p-2 rounded-xl border border-sky-500/20"><span className="text-slate-400 block text-[10px]">Level 5</span><span className="text-sky-300 font-bold text-sm">0.2%</span></div>
            <div className="bg-[#0c1e34] p-2 rounded-xl border border-sky-500/20"><span className="text-slate-400 block text-[10px]">Level 6</span><span className="text-sky-300 font-bold text-sm">0.2%</span></div>
            <div className="bg-[#0c1e34] p-2 rounded-xl border border-sky-500/20"><span className="text-slate-400 block text-[10px]">Level 7</span><span className="text-sky-300 font-bold text-sm">0.1%</span></div>
            <div className="bg-[#0c1e34] p-2 rounded-xl border border-sky-500/20"><span className="text-slate-400 block text-[10px]">Level 8</span><span className="text-slate-300 font-bold text-sm">0.1%</span></div>
            <div className="bg-[#0c1e34] p-2 rounded-xl border border-sky-500/20"><span className="text-slate-400 block text-[10px]">Level 9</span><span className="text-slate-300 font-bold text-sm">0.1%</span></div>
            <div className="bg-[#0c1e34] p-2 rounded-xl border border-sky-500/20"><span className="text-slate-400 block text-[10px]">Level 10</span><span className="text-slate-300 font-bold text-sm">0.1%</span></div>
          </div>
        </div>

        {/* Full-Width Tree Container */}
        <div className="w-full">
          <UserGenealogyTree />
        </div>
      </div>
    </Layout>
  );
}
