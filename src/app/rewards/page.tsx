'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { rewardApi, type Reward, type LevelRewards, type UserRewardProgress } from '@/lib/api/reward';
import { Button } from '@/components/ui/button';
import { Layout } from "@/components/layout";
import { RewardCard } from './_components/reward-card';
import { RewardSkeleton } from './_components/reward-skeleton';
import { RewardError } from './_components/reward-error';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Trophy, Lock, CheckCircle, Zap, ArrowRight, ChevronRight, Star, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

// This is a workaround for the JSX transformation issue
const LayoutWrapper = Layout as unknown as React.FC<{ children: React.ReactNode }>;

// Timeline connector component with improved visual feedback
const TimelineConnector = ({ isActive, isCompleted, isLast = false }: { isActive: boolean; isCompleted: boolean; isLast?: boolean }) => (
  <div className="relative flex items-center justify-center h-16 w-8">
    {/* Vertical line */}
    {!isLast && (
      <div className={cn(
        'absolute h-full w-1 transition-all duration-500',
        isCompleted ? 'bg-gradient-to-b from-primary to-primary/80' : 'bg-muted/50',
        isActive && 'from-primary/80 to-primary/50'
      )} />
    )}
    
    {/* Circular indicator */}
    <div className={cn(
      'absolute w-4 h-4 rounded-full z-10 transition-all duration-300 flex items-center justify-center',
      isCompleted 
        ? 'bg-primary scale-110 shadow-lg shadow-primary/30' 
        : isActive 
          ? 'bg-primary/80 ring-4 ring-primary/20 scale-110' 
          : 'bg-muted scale-90',
      isActive && 'animate-pulse'
    )}>
      {isCompleted && (
        <CheckCircle className="w-3 h-3 text-white" />
      )}
    </div>
  </div>
);

// Helper function to group rewards by level and handle empty levels
const groupRewardsByLevel = (rewards: Reward[] = []): LevelRewards[] => {
  const levels: Record<number, LevelRewards> = {};
  const maxLevel = 6; // We have 6 levels in total
  
  // Initialize all levels with default values
  for (let i = 1; i <= maxLevel; i++) {
    levels[i] = {
      level: i,
      rewards: [],
      isLocked: i > 1, // All levels except first are locked by default
      isCompleted: false,
      progress: 0,
      exists: false // Track if this level has any rewards defined
    };
  }
  
  // Process actual rewards
  rewards.forEach(reward => {
    if (reward.level && reward.level <= maxLevel) {
      if (!levels[reward.level].exists) {
        levels[reward.level] = {
          ...levels[reward.level],
          exists: true,
          isLocked: reward.level > 1 // Will be updated based on previous level
        };
      }
      levels[reward.level].rewards.push(reward);
    }
  });
  
  // Sort rewards within each level by orderInLevel
  Object.values(levels).forEach(level => {
    level.rewards.sort((a, b) => (a.orderInLevel || 0) - (b.orderInLevel || 0));
    
    // Update completion status for levels with rewards
    if (level.rewards.length > 0) {
      level.isCompleted = level.rewards.every(r => r.userStatus === 'claimed');
      level.progress = (level.rewards.filter(r => r.userStatus === 'claimed').length / level.rewards.length) * 100;
    }
  });
  
  // Calculate locked status based on previous level completion
  let previousCompleted = true;
  return Object.values(levels).map(level => {
    const isLocked = !level.exists || (level.level > 1 && !previousCompleted);
    if (level.exists) {
      previousCompleted = level.isCompleted;
    }
    return {
      ...level,
      isLocked,
      isActive: !isLocked && level.exists && (level.level === 1 || levels[level.level - 1]?.isCompleted)
    };
  });
};

export default function RewardsPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [activeLevel, setActiveLevel] = useState<number>(1);

  // Fetch user's rewards with progress
  const {
    data: rewards = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Reward[]>({
    queryKey: ['userRewards'],
    queryFn: async () => {
      try {
        const response = await rewardApi.getRewards();
        // Ensure each reward has the required fields with defaults
        return response.map(reward => ({
          ...reward,
          requirements: {
            leftLegRequired: reward.requirements?.leftLegRequired || 0,
            rightLegRequired: reward.requirements?.rightLegRequired || 0,
          },
          userProgress: {
            leftLegCompleted: reward.userProgress?.leftLegCompleted || 0,
            rightLegCompleted: reward.userProgress?.rightLegCompleted || 0,
            isClaimed: reward.userProgress?.isClaimed || false,
            status: reward.userProgress?.status || 'locked',
          },
          isClaimed: reward.isClaimed || false,
          level: reward.level || 1,
          orderInLevel: reward.orderInLevel || 0,
        }));
      } catch (error) {
        console.error('Error fetching rewards:', error);
        return [];
      }
    },
  });
  
  // Group rewards by level
  const levelRewards = useMemo(() => groupRewardsByLevel(rewards), [rewards]);

  // Update active level when levelRewards changes
  useEffect(() => {
    const active = levelRewards.find(level => level.isActive);
    if (active) {
      setActiveLevel(active.level);
    }
  }, [levelRewards]);

  // Calculate completion stats
  const completedLevels = levelRewards.filter(level => level.isCompleted).length;
  const totalLevels = 6;

  // Mutation for claiming a reward
  const claimRewardMutation = useMutation({
    mutationFn: (rewardId: string) => rewardApi.claimReward(rewardId),
    onSuccess: () => {
      toast.success('Reward claimed successfully!');
      queryClient.invalidateQueries({ queryKey: ['userRewards'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to claim reward');
    },
  });

  const handleClaimReward = async (rewardId: string) => {
    try {
      await claimRewardMutation.mutateAsync(rewardId);
    } catch (error) {
      console.error('Error claiming reward:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value).replace('PKR', 'PKR ');
  };

  // Sort rewards by level and orderInLevel
  const rewardsList = [...(rewards || [])].sort((a, b) => {
    if (a.level !== b.level) return (a.level || 0) - (b.level || 0);
    return (a.orderInLevel || 0) - (b.orderInLevel || 0);
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="flex flex-col items-center mb-12 text-center">
            <h1 className="text-3xl font-bold mb-2">Your Rewards Journey</h1>
            <p className="text-muted-foreground max-w-2xl">
              Complete levels to unlock exclusive rewards and benefits
            </p>
          </div>
          
          {/* Progress Header with improved visual hierarchy */}
          <div className="mb-12 px-4">
            <div className="max-w-4xl mx-auto bg-background/50 p-6 rounded-xl border border-border shadow-sm">
              <div className="flex flex-col items-center text-center mb-6">
                <h2 className="text-2xl font-bold mb-2 flex items-center">
                  <Trophy className="w-6 h-6 mr-2 text-amber-500" />
                  Your Rewards Progress
                </h2>
                <p className="text-muted-foreground text-sm max-w-lg">
                  Complete levels to unlock exclusive rewards and level up your benefits
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-muted-foreground">
                    Level {completedLevels} of {totalLevels}
                  </span>
                  <span className="font-semibold text-primary">
                    {completedLevels === totalLevels ? (
                      <span className="flex items-center">
                        <span className="mr-1">🎉</span> All Levels Completed!
                      </span>
                    ) : (
                      `${Math.round((completedLevels / totalLevels) * 100)}% Complete`
                    )}
                  </span>
                </div>
                
                <div className="relative">
                  <div className="h-3 bg-muted/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${(completedLevels / totalLevels) * 100}%` }}
                    ></div>
                  </div>
                  
                  {/* Level indicators */}
                  <div className="flex justify-between mt-2">
                    {[1, 2, 3, 4, 5, 6].map((level) => {
                      const isCompleted = level <= completedLevels;
                      const isCurrent = level === completedLevels + 1;
                      return (
                        <div 
                          key={level}
                          className={cn(
                            'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                            isCompleted 
                              ? 'bg-primary text-white scale-110' 
                              : isCurrent
                                ? 'bg-primary/20 text-primary ring-2 ring-primary/50 scale-110'
                                : 'bg-muted/50 text-muted-foreground scale-90',
                            isCompleted && 'shadow-md shadow-primary/30'
                          )}
                        >
                          {isCompleted ? '✓' : level}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Loading Skeleton */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <RewardSkeleton key={i} />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="flex flex-col items-center mb-12 text-center">
            <h1 className="text-3xl font-bold mb-2">Your Rewards Journey</h1>
            <p className="text-muted-foreground max-w-2xl">
              Complete levels to unlock exclusive rewards and benefits
            </p>
          </div>
          <RewardError 
            error={error} 
            onRetry={() => refetch()} 
          />
        </div>
      </Layout>
    );
  }

  if (!rewards || rewards.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="flex flex-col items-center mb-12 text-center">
            <h1 className="text-3xl font-bold mb-2">Your Rewards Journey</h1>
            <p className="text-muted-foreground max-w-2xl">
              Complete levels to unlock exclusive rewards and benefits
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-2xl mb-6">
              <Trophy className="h-12 w-12 text-primary mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-2">No Rewards Available</h1>
              <p className="text-muted-foreground mb-6">
                Complete more actions to unlock rewards and progress through the levels.
              </p>
              <Button onClick={() => router.push('/dashboard')} className="gap-2">
                <Zap className="h-4 w-4" />
                Start Earning Rewards
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="flex flex-col items-center mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Your Rewards Journey
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Complete levels to unlock exclusive rewards and benefits. Each level brings you closer to greater rewards!
          </p>
        </div>
        
        {/* Progress Header */}
        <div className="mb-12 px-4">
          <div className="flex flex-col items-center">
            <div className="w-full max-w-4xl space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                  Level {completedLevels} of {totalLevels}
                </span>
                <span className="text-sm font-medium text-primary whitespace-nowrap">
                  {Math.round((completedLevels / totalLevels) * 100)}% Complete
                </span>
              </div>
              
              <div className="relative">
                <Progress value={(completedLevels / totalLevels) * 100} className="h-2.5" />
                <div className="absolute inset-0 flex items-center justify-between px-1">
                  {[1, 2, 3, 4, 5, 6].map((level) => {
                    const isCompleted = level <= completedLevels;
                    const isCurrent = level === activeLevel;
                    return (
                      <div key={level} className="relative flex flex-col items-center">
                        <div 
                          className={cn(
                            'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                            isCompleted 
                              ? 'bg-primary text-primary-foreground scale-110' 
                              : 'bg-muted text-muted-foreground',
                            isCurrent && 'ring-4 ring-primary/30',
                            isCurrent && 'animate-pulse'
                          )}
                        >
                          {isCompleted ? <CheckCircle className="h-3.5 w-3.5" /> : level}
                        </div>
                        {isCurrent && (
                          <div className="absolute top-7 text-[10px] leading-tight font-medium text-primary text-center whitespace-nowrap">
                            Current
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Timeline with Rewards */}
        <div className="space-y-8 md:space-y-12 px-2">
          {levelRewards.map((level, index) => {
            const isLast = index === levelRewards.length - 1;
            const isActive = level.level === activeLevel;
            const isCompleted = level.isCompleted;
            const isLocked = level.isLocked;
            
            return (
              <div key={level.level} className="relative flex group">
                {/* Timeline Track */}
                <div className="flex flex-col items-center mr-6">
                  <div className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mb-2',
                    isLocked 
                      ? 'bg-muted text-muted-foreground' 
                      : isCompleted 
                        ? 'bg-primary text-primary-foreground' 
                        : isActive
                          ? 'bg-primary text-primary-foreground ring-4 ring-primary/30'
                          : 'bg-muted/50 text-muted-foreground',
                    isActive && 'animate-pulse'
                  )}>
                    {isCompleted ? <CheckCircle className="h-6 w-6" /> : level.level}
                  </div>
                  
                  {!isLast && (
                    <div className={cn(
                      'w-0.5 h-full',
                      isCompleted ? 'bg-primary' : 'bg-muted',
                      isActive && 'bg-gradient-to-b from-primary to-muted'
                    )} />
                  )}
                </div>
                
                {/* Reward Card */}
                <div className={cn(
                  'flex-1 pb-12 transition-all duration-300',
                  isActive ? 'scale-105' : 'opacity-80 hover:opacity-100',
                  isLocked && 'opacity-60 hover:opacity-70'
                )}>
                  <RewardCard
                    reward={level.rewards[0]} // One reward per level
                    onClaimReward={handleClaimReward}
                    isLocked={isLocked}
                    isLevelCompleted={isCompleted}
                    level={level.level}
                  />
                </div>
                
                {/* Level Badge with improved visual feedback */}
                <div className={cn(
                  'absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 px-3 py-1.5 rounded-full text-xs font-bold flex items-center transition-all',
                  isLocked 
                    ? 'bg-muted/50 text-muted-foreground' 
                    : isCompleted 
                      ? 'bg-green-500/10 text-green-700 dark:text-green-400' 
                      : isActive
                        ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground shadow-md'
                        : 'bg-background text-foreground/60 border border-border',
                  isActive && 'ring-2 ring-primary/50 scale-105',
                  'group-hover:scale-105 transition-transform duration-200'
                )}>
                  {isCompleted ? (
                    <span className="flex items-center">
                      <CheckCircle className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                      <span>Level {level.level}</span>
                    </span>
                  ) : isLocked ? (
                    <span className="flex items-center">
                      <Lock className="w-3 h-3 mr-1.5 flex-shrink-0" />
                      <span>Level {level.level}</span>
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Zap className={cn(
                        'w-3 h-3 mr-1.5 flex-shrink-0',
                        isActive && 'text-yellow-500 fill-yellow-500 animate-pulse'
                      )} />
                      <span>Level {level.level}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Completion Message */}
        {completedLevels === totalLevels && (
          <div className="mt-12 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full text-green-600">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Congratulations! 🎉</h3>
                <p className="text-muted-foreground text-sm">You've completed all reward levels. Check back later for more!</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="ml-4">
              View All Rewards
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
