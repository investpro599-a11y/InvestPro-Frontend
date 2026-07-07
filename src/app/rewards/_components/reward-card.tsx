'use client';

import React, { useState } from 'react';
import { Reward, type RewardProgress, type RewardRequirements, RewardStatus } from '@/lib/api/reward';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CheckCircle, Gift, Lock, Loader2, ChevronRight, Award, Trophy } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cva } from "class-variance-authority";

const progressIndicatorVariants = cva(
  "h-2 w-full flex-1 bg-primary transition-all",
  {
    variants: {
      variant: {
        default: "bg-blue-500",
        completed: "bg-green-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface RewardCardProps {
  reward: Reward;
  onClaimReward: (rewardId: string) => Promise<void>;
  isLocked: boolean;
  isLevelCompleted: boolean;
  level: number;
}

export function RewardCard({ 
  reward, 
  onClaimReward, 
  isLocked, 
  isLevelCompleted,
  level
}: RewardCardProps) {
  const [isClaiming, setIsClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // If reward is not provided, return null to prevent rendering
  if (!reward) {
    console.error('Reward is undefined or null');
    return null;
  }

  // Safely extract progress and requirements with proper type checking
  const safeReward: Reward = {
    _id: reward._id || '',
    id: reward.id || '',
    name: reward.name || 'Unnamed Reward',
    description: reward.description || null,
    value: reward.value || 0,
    level: reward.level || 1,
    orderInLevel: reward.orderInLevel || 0,
    imageUrl: reward.imageUrl || null,
    isActive: reward.isActive !== false, // default to true if not set
    requirements: reward.requirements || { leftLegRequired: 0, rightLegRequired: 0 },
    userProgress: reward.userProgress || {
      leftLegCompleted: 0,
      rightLegCompleted: 0,
      isClaimed: false,
      status: RewardStatus.LOCKED
    },
    isClaimed: reward.isClaimed || false,
    userStatus: reward.userStatus || RewardStatus.LOCKED,
    unlockedAt: reward.unlockedAt,
    claimedAt: reward.claimedAt,
    isLocked: reward.isLocked,
    isUnlocked: reward.isUnlocked,
    progressPercentage: reward.progressPercentage,
    createdAt: reward.createdAt || new Date().toISOString(),
    updatedAt: reward.updatedAt || new Date().toISOString(),
  };
  
  // Calculate reward status
  const rewardIsCompleted = safeReward.userStatus === RewardStatus.CLAIMED || safeReward.isClaimed;
  const isRewardUnlocked = safeReward.userStatus === RewardStatus.UNLOCKED || 
                    (safeReward.userProgress?.status === 'unlocked' && !rewardIsCompleted);

  // Ensure userProgress has all required fields with defaults
  const safeUserProgress: RewardProgress = {
    leftLegCompleted: safeReward.userProgress?.leftLegCompleted ?? 0,
    rightLegCompleted: safeReward.userProgress?.rightLegCompleted ?? 0,
    isClaimed: safeReward.userProgress?.isClaimed ?? false,
    status: safeReward.userProgress?.status ?? RewardStatus.LOCKED,
  };

  // Ensure requirements has all required fields with defaults
  const safeRequirements: RewardRequirements = {
    leftLegRequired: safeReward.requirements?.leftLegRequired ?? 0,
    rightLegRequired: safeReward.requirements?.rightLegRequired ?? 0,
  };
  
  // Determine if the reward can be claimed
  const canClaim = isRewardUnlocked && !rewardIsCompleted && !isLocked;
  
  // Format numbers with USD formatting
  const formatNumber = (num: number): string => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      currencyDisplay: 'symbol',
    });
    
    if (num >= 1000000000) {
      return `$${(num / 1000000000).toFixed(1)}B`;  // $1.5B
    }
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;     // $1.2M
    }
    if (num >= 1000) {
      return `$${(num / 1000).toFixed(1)}K`;        // $1.5K
    }
    return formatter.format(num);  // $500
  };

  // Handle claim button click
  const handleClaim = async () => {
    if (!safeReward?._id) {
      console.error('Cannot claim: Reward ID is missing');
      setError('Cannot claim this reward: Invalid reward ID');
      return;
    }
    
    if (isClaiming) return; // Prevent double-clicking
    
    setIsClaiming(true);
    setError(null);
    
    try {
      console.log('Claiming reward:', safeReward._id);
      await onClaimReward(safeReward._id);
      // Update local state to reflect the claimed status
      safeReward.userStatus = RewardStatus.CLAIMED;
      safeReward.isClaimed = true;
      safeReward.claimedAt = new Date().toISOString();
    } catch (err) {
      console.error('Error claiming reward:', err);
      setError(err instanceof Error ? err.message : 'Failed to claim reward');
    } finally {
      setIsClaiming(false);
    }
  };

  // Calculate progress percentages for each leg
  const leftLegProgress = safeRequirements.leftLegRequired > 0
    ? Math.min(100, (safeUserProgress.leftLegCompleted / safeRequirements.leftLegRequired) * 100)
    : 0;
    
  const rightLegProgress = safeRequirements.rightLegRequired > 0
    ? Math.min(100, (safeUserProgress.rightLegCompleted / safeRequirements.rightLegRequired) * 100)
    : 0;
  
  const totalRequired = safeRequirements.leftLegRequired + safeRequirements.rightLegRequired;
  const totalCompleted = safeUserProgress.leftLegCompleted + safeUserProgress.rightLegCompleted;
  
  const overallProgress = totalRequired > 0
    ? Math.min(100, Math.max(0, (totalCompleted / totalRequired) * 100))
    : 0;
    
  // Check if the reward is completed
  const isClaimed = safeReward.userStatus === RewardStatus.CLAIMED || safeReward.isClaimed || safeUserProgress.isClaimed;
  const isUnlocked = safeUserProgress.status === RewardStatus.UNLOCKED || (overallProgress >= 100 && !isLocked && !isClaimed);
  const isCompleted = isClaimed || (isUnlocked && !isLocked);
  const canUserClaim = isUnlocked && !isClaimed && !isLocked;

  return (
    <div 
      className={cn(
        'relative border rounded-xl overflow-hidden bg-white text-card-foreground shadow-sm transition-all duration-200',
        'group h-full flex flex-col w-full max-w-[320px] mx-auto',
        isLocked 
          ? 'opacity-70 border-gray-200' 
          : isCompleted 
            ? 'border-primary shadow-md ring-1 ring-primary/20' 
            : 'border-gray-200 hover:border-primary/50',
      )}
    >
      {/* Level Header */}
      <div className={cn(
        'py-2 px-4 font-bold text-sm flex items-center justify-between',
        isLocked ? 'bg-gray-100 text-gray-500' : 'bg-primary/5 text-primary',
      )}>
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4" />
          <span>Level {level}</span>
        </div>
        {isCompleted && (
          <div className="flex items-center text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </div>
        )}
      </div>

      {/* Reward Content */}
      <div className="p-4 space-y-4">
        {/* Reward Title and Description */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-center text-gray-900">
            {safeReward.name}
          </h3>
          {safeReward.description && (
            <p className="text-sm text-gray-600 text-center">
              {safeReward.description}
            </p>
          )}
        </div>

        {/* Reward Value */}
        <div className="text-center py-2 bg-primary/5 rounded-lg border border-primary/10">
          <div className="text-2xl font-bold text-primary">
            {formatNumber(safeReward.value)}
          </div>
          <div className="text-sm font-medium text-primary/80">
            Reward Value
          </div>
        </div>

        {/* Progress Bars */}
        <div className="space-y-3">
          {/* Left Leg */}
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Left Leg: {safeUserProgress.leftLegCompleted} / {safeRequirements.leftLegRequired}</span>
              <span>{Math.round(leftLegProgress)}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div 
                className={cn(
                  progressIndicatorVariants({
                    variant: leftLegProgress >= 100 ? 'completed' : 'default',
                  }),
                  'h-full',
                )}
                style={{
                  width: `${leftLegProgress}%`,
                  transition: 'width 0.6s ease',
                }}
              />
            </div>
          </div>

          {/* Right Leg */}
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Right Leg: {safeUserProgress.rightLegCompleted} / {safeRequirements.rightLegRequired}</span>
              <span>{Math.round(rightLegProgress)}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div 
                className={cn(
                  progressIndicatorVariants({
                    variant: rightLegProgress >= 100 ? 'completed' : 'default',
                  }),
                  'h-full',
                )}
                style={{
                  width: `${rightLegProgress}%`,
                  transition: 'width 0.6s ease',
                }}
              />
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-100">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Requirements to Unlock</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Left Leg:</span>
              <span className="font-medium">{formatNumber(safeRequirements.leftLegRequired)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Right Leg:</span>
              <span className="font-medium">{formatNumber(safeRequirements.rightLegRequired)}</span>
            </div>
          </div>
          <div className="pt-3 mt-2 border-t border-gray-200">
            <div className="flex items-center justify-between font-semibold">
              <span className="text-gray-800">Total Required:</span>
              <span className="text-primary">{formatNumber(safeRequirements.leftLegRequired + safeRequirements.rightLegRequired)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {/* Action Button */}
        <Button
          onClick={handleClaim}
          disabled={!canUserClaim || isClaiming}
          className={cn(
            'w-full mt-4 py-2 text-sm font-medium rounded-lg transition-all',
            isLocked 
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : isCompleted
                ? 'bg-green-100 text-green-700 hover:bg-green-100 cursor-default'
                : canUserClaim
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600'
                  : 'bg-gray-100 text-gray-500 cursor-not-allowed',
            isClaiming && 'opacity-70 cursor-wait'
          )}
        >
          {isClaiming ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : isCompleted ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Reward Claimed
            </>
          ) : isLocked ? (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Complete Level {level - 1} First
            </>
          ) : canUserClaim ? (
            <>
              <Gift className="mr-2 h-4 w-4" />
              Claim Your Reward
            </>
          ) : (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              In Progress
            </>
          )}
        </Button>

        {error && (
          <div className="mt-2 p-2 text-xs text-red-600 bg-red-50 rounded-md">
            {error}
          </div>
        )}
      </div>

      {/* Level Completion Indicator */}
      {isLevelCompleted && !isLocked && (
        <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          <span>Level {level} Completed</span>
        </div>
      )}
    </div>
  );
}
