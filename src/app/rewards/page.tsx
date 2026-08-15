'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { CheckCircle, Clock, Gift, Users, Trophy, ArrowRight, User } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Reward } from '@shared/schema';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getFileUrl } from "@/lib/utils";

// Helper to format PKR
const formatPKR = (val: string | number) => {
  return "Rs " + Number(val).toLocaleString();
};

export default function RewardsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedReward, setSelectedReward] = useState<any>(null);
  
  const { data: settings } = useQuery({
    queryKey: ['publicSettings'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/settings/public');
      return await res.json();
    },
  });

  const exchangeRate = settings?.exchangeRate || 278;

  const { data: rewards = [], isLoading } = useQuery({
    queryKey: ['userRewards'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/rewards');
      return await res.json();
    },
    enabled: !!user,
  });

  const claimMutation = useMutation({
    mutationFn: async (rewardId: number) => {
      const res = await apiRequest('POST', `/rewards/${rewardId}/claim`);
      return await res.json();
    },
    onSuccess: () => {
      toast.success("Claim submitted successfully! Pending admin approval.");
      queryClient.invalidateQueries({ queryKey: ['userRewards'] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to claim reward");
    }
  });

  useEffect(() => {
    if (rewards.length > 0) {
      for (const reward of rewards) {
        if (reward.userStatus === 'approved') {
          const popupKey = `reward_popup_seen_${reward.id}`;
          if (!localStorage.getItem(popupKey)) {
            setSelectedReward(reward);
            localStorage.setItem(popupKey, 'true');
            break; // Show one at a time
          }
        }
      }
    }
  }, [rewards]);

  if (isLoading || !user) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[70vh]">
          <div className="animate-pulse text-xl text-primary font-semibold">Loading Rewards...</div>
        </div>
      </Layout>
    );
  }

  // Calculate PKR volumes
  const leftVolUsd = Number(user.leftVolume || "0");
  const rightVolUsd = Number(user.rightVolume || "0");
  const leftVolPkr = leftVolUsd * exchangeRate;
  const rightVolPkr = rightVolUsd * exchangeRate;
  
  const formatPKR = (val: string | number) => {
    return "Rs " + Number(val).toLocaleString();
  };

  const formatUSD = (val: string | number) => {
    return "$" + Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const pkrToUsdStr = (pkr: number) => {
    return formatUSD(pkr / exchangeRate);
  };

  // Sort rewards by required volume ascending
  const sortedRewards = [...rewards].sort((a, b) => Number(a.requiredVolumePkr) - Number(b.requiredVolumePkr));

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        <div className="mb-8 flex items-center justify-between glass-panel p-6 rounded-3xl border border-sky-500/25">
          <div>
            <h1 className="text-3xl font-extrabold font-display text-white flex items-center gap-3">
              <Trophy className="text-amber-400 w-8 h-8" /> 
              My <span className="gradient-text-primary">Rewards</span>
            </h1>
            <p className="text-slate-300 mt-1 text-sm font-medium">
              Current Dollar Rate: <span className="text-sky-300 font-bold">{exchangeRate} PKR</span>
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {sortedRewards.map((reward: any, index) => {
            const reqVolPkr = Number(reward.requiredVolumePkr);
            const totalRequired = reqVolPkr * 2;
            const rewardAmount = Number(reward.rewardAmountPkr);
            
            const leftProgress = Math.min(leftVolPkr, reqVolPkr);
            const rightProgress = Math.min(rightVolPkr, reqVolPkr);
            
            const leftPercent = (leftProgress / reqVolPkr) * 100;
            const rightPercent = (rightProgress / reqVolPkr) * 100;
            
            const isEligible = leftVolPkr >= reqVolPkr && rightVolPkr >= reqVolPkr;
            
            let statusText = "In Progress";
            let StatusIcon = Clock;
            let statusColor = "text-slate-300";
            let btnText = `Claim ${reward.name} Reward`;
            let btnDisabled = !isEligible;
            let btnColor = "bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold shadow-lg shadow-sky-500/25";

            if (reward.userStatus === 'approved') {
              statusText = "Claimed & Approved";
              StatusIcon = CheckCircle;
              statusColor = "text-emerald-400";
              btnText = "Reward Delivered";
              btnDisabled = true;
              btnColor = "bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold";
            } else if (reward.userStatus === 'pending') {
              statusText = "Pending Admin Approval";
              StatusIcon = Clock;
              statusColor = "text-amber-400";
              btnText = "Pending Approval";
              btnDisabled = true;
              btnColor = "bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold";
            } else if (isEligible) {
              statusText = "Ready to Claim";
              StatusIcon = Gift;
              statusColor = "text-sky-300 font-bold";
              btnDisabled = false;
            }

            return (
              <Card key={reward.id} className="glass-card border-sky-500/25 bg-[#0e2238]/90 overflow-hidden shadow-xl">
                <div className="p-5 border-b border-sky-500/20 bg-[#07172b] flex justify-between items-center">
                  <div>
                    <h3 className="font-extrabold font-display text-xl text-white uppercase tracking-wide">{reward.name}</h3>
                    <p className="text-slate-300 text-sm font-medium">{formatPKR(totalRequired)} ({pkrToUsdStr(totalRequired)}) Total Required</p>
                  </div>
                  {reward.userStatus === 'approved' && (
                    <div className="bg-emerald-500/20 text-emerald-300 px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-emerald-400/30">
                      <CheckCircle className="w-4 h-4" /> Approved
                    </div>
                  )}
                  {reward.userStatus === 'pending' && (
                    <div className="bg-amber-500/20 text-amber-300 px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-amber-400/30">
                      <Clock className="w-4 h-4" /> Pending
                    </div>
                  )}
                </div>

                <div className="p-6 space-y-6">
                  <div className="bg-[#07172b] rounded-2xl p-5 border border-sky-500/25 relative overflow-hidden">
                    <p className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-1">Reward Value</p>
                    <h2 className="text-3xl font-extrabold font-display text-sky-300 mb-2 capitalize">{reward.name}</h2>
                    <p className="text-amber-300 font-extrabold text-xl">{formatPKR(rewardAmount)} <span className="text-slate-300 font-medium text-sm">({pkrToUsdStr(rewardAmount)})</span></p>
                    {isEligible && !reward.userStatus && (
                      <p className="text-emerald-400 text-sm mt-2 flex items-center gap-1.5 font-bold">
                        <CheckCircle className="w-4 h-4" /> This reward is ready to claim!
                      </p>
                    )}
                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-sky-500/10 to-transparent pointer-events-none" />
                  </div>

                  <div className="space-y-5">
                    <h4 className="font-extrabold font-display text-white text-sm">Leg Progress</h4>
                    
                    {/* Left Leg Progress */}
                    <div className="bg-[#07172b] p-4 rounded-xl border border-sky-500/20">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-slate-200 flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-sky-500/20 border border-sky-400/30 flex items-center justify-center">
                            <ArrowRight className="w-3 h-3 text-sky-300" />
                          </div>
                          Left Leg
                        </span>
                        <span className="text-sm font-bold text-white">
                          {formatPKR(leftProgress)} <span className="text-slate-300 font-medium">({pkrToUsdStr(leftProgress)})</span> / {formatPKR(reqVolPkr)} <span className="text-slate-300 font-medium">({pkrToUsdStr(reqVolPkr)})</span>
                          {leftPercent >= 100 && <CheckCircle className="w-4 h-4 text-emerald-400 inline ml-2" />}
                        </span>
                      </div>
                      <Progress value={leftPercent} className="h-2.5 bg-slate-900 [&>div]:bg-sky-400" />
                    </div>

                    {/* Right Leg Progress */}
                    <div className="bg-[#07172b] p-4 rounded-xl border border-sky-500/20">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-slate-200 flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
                            <ArrowRight className="w-3 h-3 text-indigo-300" />
                          </div>
                          Right Leg
                        </span>
                        <span className="text-sm font-bold text-white">
                          {formatPKR(rightProgress)} <span className="text-slate-300 font-medium">({pkrToUsdStr(rightProgress)})</span> / {formatPKR(reqVolPkr)} <span className="text-slate-300 font-medium">({pkrToUsdStr(reqVolPkr)})</span>
                          {rightPercent >= 100 && <CheckCircle className="w-4 h-4 text-emerald-400 inline ml-2" />}
                        </span>
                      </div>
                      <Progress value={rightPercent} className="h-2.5 bg-slate-900 [&>div]:bg-indigo-400" />
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-sky-500/20 space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300 font-medium">Status:</span>
                      <span className={`font-bold ${statusColor}`}>{statusText}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-300 font-medium">Reward Value:</span>
                      <span className="text-sm font-extrabold text-amber-300">{formatPKR(rewardAmount)} <span className="font-medium text-slate-300">({pkrToUsdStr(rewardAmount)})</span></span>
                    </div>
                    <Button 
                      className={`w-full py-6 text-base font-extrabold rounded-xl shadow-lg ${btnColor}`}
                      disabled={btnDisabled}
                      onClick={() => {
                        claimMutation.mutate(reward.id);
                      }}
                    >
                      {btnText}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {selectedReward && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
          <div className="bg-gray-100 w-full max-w-sm rounded-[32px] overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-300">
            
            <div className="bg-green-600 pt-12 pb-24 px-6 text-center relative overflow-hidden">
              <div className="absolute top-4 left-4 text-3xl animate-bounce" style={{animationDelay: '0.1s'}}>🎊</div>
              <div className="absolute top-10 right-4 text-3xl animate-bounce" style={{animationDelay: '0.4s'}}>🎉</div>
              <div className="absolute top-20 left-10 text-2xl animate-bounce" style={{animationDelay: '0.2s'}}>✨</div>
              <div className="absolute top-24 right-12 text-2xl animate-bounce" style={{animationDelay: '0.5s'}}>🎈</div>
              
              <div className="bg-blue-600 text-white rounded-2xl py-4 px-6 shadow-lg inline-block relative z-10 border-b-4 border-blue-700 w-4/5">
                <h2 className="text-3xl font-black uppercase tracking-tight leading-none truncate">{selectedReward.name}</h2>
              </div>
              
              <div className="mt-[-12px] relative z-20">
                <span className="bg-white text-green-700 font-black px-5 py-1.5 rounded-full text-sm uppercase shadow-md border-b-2 border-gray-200 tracking-wider">
                  Winner
                </span>
              </div>
            </div>
            
            <div className="bg-gray-100 pt-16 pb-8 px-6 text-center relative">
              <div className="absolute left-1/2 -top-12 -translate-x-1/2 z-30">
                <Avatar className="w-24 h-24 border-4 border-white shadow-xl bg-gray-100">
                  <AvatarImage 
                    src={getFileUrl(user?.profilePicture)} 
                    crossOrigin="anonymous"
                  />
                  <AvatarFallback className="text-gray-400">
                    <User className="w-12 h-12" />
                  </AvatarFallback>
                </Avatar>
              </div>
              <h3 className="text-green-700 font-black text-2xl tracking-wide uppercase mb-6 drop-shadow-sm mt-4">Congratulations</h3>
              
              <Button 
                onClick={() => {
                  setSelectedReward(null);
                }} 
                className="bg-green-600 hover:bg-green-700 text-white w-full py-6 text-lg rounded-xl font-bold shadow-md transition-all active:scale-95"
              >
                Awesome!
              </Button>
            </div>
            
          </div>
        </div>
      )}

    </Layout>
  );
}
