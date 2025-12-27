'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { rewardApi } from '@/lib/api/reward';

interface DeleteRewardDialogProps {
  rewardId: string | undefined; // Allow undefined since it might be missing
  rewardName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteRewardDialog({
  rewardId,
  rewardName,
  open,
  onOpenChange,
  onSuccess,
}: DeleteRewardDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  
  // Debug: Log when the component receives new props
  console.log('DeleteRewardDialog props:', { rewardId, rewardName, open });

  const handleDelete = async () => {
    try {
      console.log('Deleting reward with ID:', rewardId);
      
      if (!rewardId) {
        console.error('No reward ID provided for deletion');
        toast.error('Error: No reward ID provided. Please try again.');
        return;
      }
      
      setIsDeleting(true);
      console.log('Calling deleteReward API with ID:', rewardId);
      
      try {
        await rewardApi.admin.deleteReward(rewardId);
        toast.success('Reward deleted successfully');
        onOpenChange(false);
      } catch (error) {
        console.error('API Error deleting reward:', error);
        throw error; // Re-throw to be caught by the outer catch
      }
      
      // Refresh the page to update the rewards list
      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error('Error deleting reward:', error);
      toast.error('Failed to delete reward. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Reward</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the reward "{rewardName}"? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
