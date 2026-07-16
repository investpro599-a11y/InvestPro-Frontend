'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { CheckCircle, Clock, Gift, Users, Trophy, ArrowRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Reward } from '@/shared/schema';

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
      <div className="max-w-3xl mx-auto px-4 py-8">
        
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Trophy className="text-yellow-500 w-6 h-6" /> 
              My Rewards
            </h1>
            <p className="text-gray-600 mt-1 text-sm">
              Current Dollar Rate: {exchangeRate} PKR
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
            let statusColor = "text-gray-500";
            let btnText = `Claim ${reward.name} Reward`;
            let btnDisabled = !isEligible;
            let btnColor = "bg-blue-500 hover:bg-blue-600";

            if (reward.userStatus === 'approved') {
              statusText = "Claimed & Approved";
              StatusIcon = CheckCircle;
              statusColor = "text-green-600";
              btnText = "Reward Delivered";
              btnDisabled = true;
              btnColor = "bg-green-500";
            } else if (reward.userStatus === 'pending') {
              statusText = "Pending Admin Approval";
              StatusIcon = Clock;
              statusColor = "text-amber-600";
              btnText = "Pending Approval";
              btnDisabled = true;
              btnColor = "bg-amber-500";
            } else if (isEligible) {
              statusText = "Ready to Claim";
              StatusIcon = Gift;
              statusColor = "text-blue-600";
              btnDisabled = false;
            }

            return (
              <Card key={reward.id} className="border-2 border-gray-100 overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 uppercase">{reward.name}</h3>
                    <p className="text-gray-500 text-sm">{formatPKR(totalRequired)} ({pkrToUsdStr(totalRequired)}) Total Required</p>
                  </div>
                  {reward.userStatus === 'approved' && (
                    <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border border-green-200">
                      <CheckCircle className="w-3 h-3" /> Approved
                    </div>
                  )}
                  {reward.userStatus === 'pending' && (
                    <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border border-amber-200">
                      <Clock className="w-3 h-3" /> Pending
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100/50 mb-6 relative overflow-hidden">
                    <p className="text-gray-500 text-sm font-medium mb-1">Reward Value</p>
                    <h2 className="text-3xl font-bold text-blue-600 mb-2 capitalize">{reward.name}</h2>
                    <p className="text-blue-800 font-semibold">{formatPKR(rewardAmount)} <span className="text-blue-600/80 font-normal">({pkrToUsdStr(rewardAmount)})</span></p>
                    {isEligible && !reward.userStatus && (
                      <p className="text-green-600 text-sm mt-2 flex items-center gap-1 font-medium">
                        <CheckCircle className="w-4 h-4" /> This reward is ready to claim!
                      </p>
                    )}
                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-blue-100/50 to-transparent pointer-events-none" />
                  </div>

                  <div className="space-y-5">
                    <h4 className="font-semibold text-gray-700 mb-2 text-sm">Leg Progress</h4>
                    
                    {/* Left Leg Progress */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                            <ArrowRight className="w-3 h-3 text-blue-600" />
                          </div>
                          Left Leg
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatPKR(leftProgress)} <span className="text-gray-500 font-normal">({pkrToUsdStr(leftProgress)})</span> / {formatPKR(reqVolPkr)} <span className="text-gray-500 font-normal">({pkrToUsdStr(reqVolPkr)})</span>
                          {leftPercent >= 100 && <CheckCircle className="w-4 h-4 text-green-500 inline ml-2" />}
                        </span>
                      </div>
                      <Progress value={leftPercent} className="h-2 bg-blue-100 [&>div]:bg-blue-500" />
                    </div>

                    {/* Right Leg Progress */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                            <ArrowRight className="w-3 h-3 text-blue-600" />
                          </div>
                          Right Leg
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatPKR(rightProgress)} <span className="text-gray-500 font-normal">({pkrToUsdStr(rightProgress)})</span> / {formatPKR(reqVolPkr)} <span className="text-gray-500 font-normal">({pkrToUsdStr(reqVolPkr)})</span>
                          {rightPercent >= 100 && <CheckCircle className="w-4 h-4 text-green-500 inline ml-2" />}
                        </span>
                      </div>
                      <Progress value={rightPercent} className="h-2 bg-blue-100 [&>div]:bg-blue-500" />
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-100 space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Status:</span>
                      <span className={`font-medium ${statusColor}`}>{statusText}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Reward Value:</span>
                      <span className="text-sm font-semibold text-blue-600">{formatPKR(rewardAmount)} <span className="font-normal text-blue-600/70">({pkrToUsdStr(rewardAmount)})</span></span>
                    </div>
                    <Button 
                      className={`w-full py-6 text-base font-semibold rounded-xl shadow-sm ${btnColor}`}
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
              <h3 className="text-green-700 font-black text-2xl tracking-wide uppercase mb-6 drop-shadow-sm">Congratulations</h3>
              
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
