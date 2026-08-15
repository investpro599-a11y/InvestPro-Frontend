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
      const res = await apiRequest('GET', '/admin/rewards/pending');
      return await res.json();
    }
  });

  const { data: settings } = useQuery({
    queryKey: ['publicSettings'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/settings/public');
      return await res.json();
    },
  });

  const exchangeRate = settings?.exchangeRate || 278;

  const formatUSD = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const approveMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('PUT', `/admin/rewards/${id}/approve`);
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
      <div className="text-center p-8 bg-white/90 dark:bg-[#091b30] border border-sky-500/20 text-slate-700 dark:text-slate-300 font-medium">
        No pending reward claims found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full">
      <Table>
        <TableHeader className="bg-slate-100/90 dark:bg-[#07172b] border-b border-sky-500/20">
          <TableRow className="border-sky-500/20 hover:bg-transparent">
            <TableHead className="text-slate-800 dark:text-slate-300 font-bold text-xs">User</TableHead>
            <TableHead className="text-slate-800 dark:text-slate-300 font-bold text-xs">Email</TableHead>
            <TableHead className="text-slate-800 dark:text-slate-300 font-bold text-xs">Reward</TableHead>
            <TableHead className="text-slate-800 dark:text-slate-300 font-bold text-xs">Req Volume</TableHead>
            <TableHead className="text-slate-800 dark:text-slate-300 font-bold text-xs">Status</TableHead>
            <TableHead className="text-right text-slate-800 dark:text-slate-300 font-bold text-xs">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-white/95 dark:bg-[#091b30] divide-y divide-slate-200 dark:divide-sky-500/15">
          {claims.map((claim: any) => (
            <TableRow key={claim.id} className="hover:bg-sky-500/10 border-slate-200 dark:border-sky-500/15">
              <TableCell className="font-bold text-slate-900 dark:text-white">{claim.user?.fullName || 'Unknown'}</TableCell>
              <TableCell className="text-slate-700 dark:text-slate-300 font-medium">{claim.user?.email || 'N/A'}</TableCell>
              <TableCell className="font-extrabold text-sky-600 dark:text-sky-300">{claim.reward?.name || 'Unknown'}</TableCell>
              <TableCell className="text-slate-900 dark:text-white font-bold">
                Rs {Number(claim.reward?.requiredVolumePkr || 0).toLocaleString()} 
                <span className="text-slate-600 dark:text-slate-300 text-xs ml-1 font-normal">
                  ({formatUSD(Number(claim.reward?.requiredVolumePkr || 0) / exchangeRate)})
                </span>
              </TableCell>
              <TableCell>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-400/30">
                  {claim.status}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  size="sm" 
                  onClick={() => approveMutation.mutate(claim.id)}
                  disabled={approveMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md"
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
