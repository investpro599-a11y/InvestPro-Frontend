'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Check } from 'lucide-react';

export function ClaimsTable() {
  const queryClient = useQueryClient();

  const { data: claims = [], isLoading, error } = useQuery({
    queryKey: ['admin/rewards-pending'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/rewards/pending');
      return await res.json();
    }
  });

  const approveMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('PUT', `/api/admin/rewards/${id}/approve`);
      return await res.json();
    },
    onSuccess: () => {
      toast.success("Reward claim approved successfully!");
      queryClient.invalidateQueries({ queryKey: ['admin/rewards-pending'] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to approve reward claim");
    }
  });

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
        <div className="text-red-600 font-medium mb-2">Failed to load pending claims</div>
        <p className="text-red-500 text-sm">{(error as any).message}</p>
      </div>
    );
  }

  if (claims.length === 0) {
    return (
      <div className="text-center p-6 border rounded-lg bg-gray-50">
        <div className="text-gray-500">No pending reward claims found</div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border rounded-lg">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Reward</TableHead>
            <TableHead>Req Volume</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {claims.map((claim: any) => (
            <TableRow key={claim.id}>
              <TableCell className="font-medium">{claim.user?.fullName || 'Unknown'}</TableCell>
              <TableCell>{claim.user?.email || 'N/A'}</TableCell>
              <TableCell className="font-semibold text-primary">{claim.reward?.name || 'Unknown'}</TableCell>
              <TableCell>${claim.reward?.requiredVolumeUsd?.toLocaleString() || 0} USD</TableCell>
              <TableCell>
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                  {claim.status}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  size="sm" 
                  onClick={() => approveMutation.mutate(claim.id)}
                  disabled={approveMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Approve
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
