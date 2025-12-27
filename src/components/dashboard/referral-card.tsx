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
    <Card className="bg-primary text-white">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <CardTitle className="text-white text-lg sm:text-xl">Referral Link & Code</CardTitle>
          <Share className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-primary-foreground/80 text-xs sm:text-sm">
          Share your unique referral link and code to earn commission on every investment made by your referrals.
        </p>
        <div className="bg-white/10 rounded-lg p-2 sm:p-4 mb-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2 sm:gap-0">
            <span className="font-semibold mr-2">Referral Link:</span>
            <code className="text-xs sm:text-sm text-primary-foreground/90 truncate mr-2 flex-1">
              {referralLink ? referralLink : "Loading..."}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyReferralLink}
              className="bg-white/20 hover:bg-white/30 text-white"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
            <span className="font-semibold mr-2">Referral Code:</span>
            <code className="text-xs sm:text-sm text-primary-foreground/90 truncate mr-2 flex-1">
              {referralCode ? referralCode : "Loading..."}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyReferralCode}
              className="bg-white/20 hover:bg-white/30 text-white"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-center">
          <div>
            <p className="text-lg sm:text-2xl font-bold">{stats?.totalReferrals || 0}</p>
            <p className="text-xs sm:text-sm text-primary-foreground/80">Total Referrals</p>
          </div>
          <div>
            <p className="text-lg sm:text-2xl font-bold">{stats?.activeReferrals || 0}</p>
            <p className="text-xs sm:text-sm text-primary-foreground/80">Active This Month</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
