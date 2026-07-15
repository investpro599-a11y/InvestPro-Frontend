'use client';

import { useQuery } from '@tanstack/react-query';
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { CheckCircle, Clock, Trophy, Lock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function RewardsPage() {
  const { user } = useAuth();
  
  const { data: rewards = [], isLoading } = useQuery({
    queryKey: ['userRewards'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/rewards');
      return await res.json();
    },
    enabled: !!user,
  });

  if (isLoading || !user) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[70vh]">
          <div className="animate-pulse text-xl text-primary font-semibold">Loading Rewards...</div>
        </div>
      </Layout>
    );
  }

  const leftVol = Number(user.leftVolume || "0");
  const rightVol = Number(user.rightVolume || "0");
  const matchedVolume = Math.min(leftVol, rightVol);

  // Sort rewards by required volume ascending
  const sortedRewards = [...rewards].sort((a, b) => Number(a.requiredVolumeUsd) - Number(b.requiredVolumeUsd));

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="text-yellow-500 w-8 h-8" /> 
            Rewards Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Match your Left and Right leg volumes to unlock exclusive rewards. 
            Rewards are automatically claimed once matched volume thresholds are met, pending admin approval.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-blue-900">Left Leg Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700">${leftVol.toLocaleString()} USD</div>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-50 border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-purple-900">Right Leg Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-700">${rightVol.toLocaleString()} USD</div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-green-900">Total Matched Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700">${matchedVolume.toLocaleString()} USD</div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Reward Tiers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedRewards.map((reward, index) => {
              const reqVol = Number(reward.requiredVolumeUsd);
              const isEligible = matchedVolume >= reqVol;
              
              let statusText = "Locked";
              let StatusIcon = Lock;
              let statusColor = "text-gray-500 bg-gray-100";
              let progressVal = Math.min((matchedVolume / reqVol) * 100, 100);

              if (reward.userStatus === 'approved') {
                statusText = "Delivered / Approved";
                StatusIcon = CheckCircle;
                statusColor = "text-green-700 bg-green-100 border-green-200 border";
                progressVal = 100;
              } else if (reward.userStatus === 'pending') {
                statusText = "Pending Admin Approval";
                StatusIcon = Clock;
                statusColor = "text-amber-700 bg-amber-100 border-amber-200 border";
                progressVal = 100;
              }

              return (
                <Card key={reward.id} className={`border-2 transition-all ${isEligible || reward.userStatus ? 'border-primary shadow-md' : 'border-gray-200 opacity-80'}`}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <Badge variant="outline" className="mb-2">Tier {index + 1}</Badge>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${statusColor}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusText}
                      </div>
                    </div>
                    <CardTitle className="text-xl mt-2">{reward.name}</CardTitle>
                    <CardDescription>{reward.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm font-medium mb-1 text-gray-700">
                        <span>Progress</span>
                        <span>{Math.floor(progressVal)}%</span>
                      </div>
                      <Progress value={progressVal} className="h-2 mb-2" />
                      <div className="text-sm text-center font-medium mt-3">
                        Required: <span className="text-primary">${reqVol.toLocaleString()} USD</span> Matched
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
