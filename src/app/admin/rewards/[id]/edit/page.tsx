'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RewardForm } from '../../_components/reward-form-fixed';
import { rewardApi } from '@/lib/api/reward';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Reward } from '@/lib/api/reward';

export default function EditRewardPage({ params }: { params: { id: string } }) {
  const [reward, setReward] = useState<Reward | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadReward = async () => {
      if (!params?.id) {
        console.error('No reward ID provided in URL');
        toast.error('Invalid reward ID');
        router.push('/admin/rewards');
        return;
      }

      console.log('Loading reward with ID:', params.id);
      
      try {
        const data = await rewardApi.admin.getReward(params.id);
        console.log('Received reward data:', data);
        
        if (!data) {
          throw new Error('Reward not found');
        }
        
        // Log the data before setting it to state
        console.log('Setting reward state with:', data);
        
        // Make sure we're setting the reward data directly, not nested under 'reward'
        setReward({
          ...data,
          // Ensure all required fields are present
          name: data.name || '',
          description: data.description || '',
          value: data.value || 0,
          level: data.level || 1,
          orderInLevel: data.orderInLevel || 1,
          isActive: data.isActive ?? true,
          imageUrl: data.imageUrl || '',
          requirements: {
            leftLegRequired: data.requirements?.leftLegRequired || 0,
            rightLegRequired: data.requirements?.rightLegRequired || 0
          }
        });
      } catch (error) {
        console.error('Failed to load reward:', error);
        toast.error('Failed to load reward. It may have been deleted or you may not have permission.');
        router.push('/admin/rewards');
      } finally {
        setLoading(false);
      }
    };

    loadReward();
  }, [params?.id, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!reward) {
    return null; // Redirecting in useEffect
  }

  return (
    <>
      <div className="mb-6">
        <Link href="/admin/rewards">
          <Button variant="ghost" className="mb-4 px-0">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Rewards
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Reward</h1>
        <p className="text-gray-600 mt-1">
          Update the details of this reward
        </p>
      </div>
      
      <div className="space-y-6">
        <RewardForm reward={reward} />
      </div>
    </>
  );
}
