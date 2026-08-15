"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Share, Copy } from "lucide-react";

export function ReferralCard() {
  const { toast } = useToast();
  const { data: stats } = useQuery({
    queryKey: ["dashboard/stats"],
    queryFn: dashboardApi.getStats,
  });

  const referralLink = stats?.referralLink;
  const referralCode = stats?.referralCode;

  const copyReferralLink = async () => {
    if (referralLink) {
      try {
        await navigator.clipboard.writeText(referralLink);
        toast({
          title: "Copied!",
          description: "Referral link copied to clipboard",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to copy referral link",
        });
      }
    }
  };
  const copyReferralCode = async () => {
    if (referralCode) {
      try {
        await navigator.clipboard.writeText(referralCode);
        toast({
          title: "Copied!",
          description: "Referral code copied to clipboard",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to copy referral code",
        });
      }
    }
  };

  return (
    <Card className="glass-card border-sky-500/30 bg-[#0e2238]/90 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
      <CardHeader className="border-b border-sky-500/20 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-extrabold font-display text-white">Referral Network</CardTitle>
          <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-400/30">
            <Share className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <p className="text-slate-200 text-xs sm:text-sm font-medium leading-relaxed">
          Share your unique referral link or code to earn automated commission bonuses on every network deposit.
        </p>

        <div className="bg-[#07172b] backdrop-blur-md rounded-2xl p-4 border border-sky-500/25 space-y-3.5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Link:</span>
            <code className="text-xs font-mono font-bold text-sky-300 bg-[#051120] px-3 py-1.5 rounded-lg border border-sky-500/25 truncate flex-1 max-w-[200px] sm:max-w-none">
              {referralLink ? referralLink : "Loading..."}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyReferralLink}
              className="bg-sky-500/20 hover:bg-sky-500/40 text-sky-300 border border-sky-400/30 rounded-xl font-bold"
            >
              <Copy className="h-3.5 w-3.5 mr-1" /> Copy
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Code:</span>
            <code className="text-xs font-mono font-bold text-indigo-300 bg-[#051120] px-3 py-1.5 rounded-lg border border-sky-500/25 truncate flex-1 max-w-[200px] sm:max-w-none">
              {referralCode ? referralCode : "Loading..."}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyReferralCode}
              className="bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 border border-indigo-400/30 rounded-xl font-bold"
            >
              <Copy className="h-3.5 w-3.5 mr-1" /> Copy
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-[#07172b] border border-sky-500/25 rounded-2xl p-3.5">
            <p className="text-2xl font-extrabold font-display text-white">{stats?.totalReferrals || 0}</p>
            <p className="text-xs font-bold text-slate-300">Total Referrals</p>
          </div>
          <div className="bg-[#07172b] border border-sky-500/25 rounded-2xl p-3.5">
            <p className="text-2xl font-extrabold font-display text-emerald-400">{stats?.activeReferrals || 0}</p>
            <p className="text-xs font-bold text-slate-300">Active This Month</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
