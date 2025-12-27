'use client';

import { useQuery } from '@tanstack/react-query';
import { rewardApi } from '@/lib/api/reward';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

export function ClaimsTable() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin/rewards-with-claims'],
    queryFn: async () => {
      const result = await rewardApi.admin.getRewardsWithClaims();
      return result.rewards || [];
    }
  });

  // Flatten all claims from all rewards
  const allClaims = data?.flatMap(reward => 
    (reward.claims || []).map(claim => ({
      ...claim,
      rewardName: reward.name,
      rewardLevel: reward.level,
      rewardValue: reward.value,
    }))
  ) || [];

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
            <Skeleton className="h-4 w-4 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <div className="text-red-600 font-medium mb-2">Failed to load claims</div>
        <p className="text-red-500 text-sm">{error.message}</p>
      </div>
    );
  }

  if (allClaims.length === 0) {
    return (
      <div className="text-center p-6 border rounded-lg bg-gray-50">
        <div className="text-gray-500">No reward claims found</div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden border rounded-lg">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="w-[200px]">User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Reward</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Claimed On</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allClaims.map((claim, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{claim.username}</TableCell>
              <TableCell>{claim.email}</TableCell>
              <TableCell>{claim.rewardName}</TableCell>
              <TableCell>Level {claim.rewardLevel}</TableCell>
              <TableCell>${claim.rewardValue?.toLocaleString()}</TableCell>
              <TableCell>
                {claim.claimedAt ? new Date(claim.claimedAt).toLocaleDateString() : 'N/A'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
