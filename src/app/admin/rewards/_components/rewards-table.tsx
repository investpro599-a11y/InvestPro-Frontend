'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { rewardApi, type Reward, type UserClaim } from '@/lib/api/reward';
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
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { columns } from './columns';

export function RewardsTable() {
  const { data, isLoading, error, refetch } = useQuery<Reward[], Error>({
    queryKey: ['admin/rewards'],
    queryFn: async () => {
      try {
        console.log('Fetching admin rewards...');
        const result = await rewardApi.admin.getRewards();
        console.log('Admin rewards result:', result);
        return result || [];
      } catch (err) {
        console.error('Error fetching rewards:', err);
        throw err;
      }
    }
  });

  const rewards = data || [];

  // Add a refresh button to manually refresh the data
  const handleRefresh = () => {
    console.log('Manually refreshing rewards...');
    refetch();
  };

  // Log when data changes
  useEffect(() => {
    console.log('Rewards data changed:', rewards);
  }, [rewards]);

  // Log errors
  useEffect(() => {
    if (error) {
      console.error('Error loading rewards:', error);
    }
  }, [error]);

  // Format user claims for display
  const formatClaims = (claims: UserClaim[] = []) => {
    if (claims.length === 0) return 'No claims yet';
    return (
      <div className="space-y-1">
        {claims.map((claim, index) => (
          <div key={index} className="text-xs text-muted-foreground">
            <span className="font-medium">{claim.username}</span> ({claim.email}) - 
            {claim.claimedAt ? new Date(claim.claimedAt).toLocaleDateString() : 'N/A'}
          </div>
        ))}
      </div>
    );
  };

  const table = useReactTable({
    data: rewards,
    columns: [
      ...columns,
      {
        id: 'claims',
        header: 'Claimed By',
        cell: ({ row }) => {
          const claims = row.original.claims || [];
          return formatClaims(claims);
        },
      },
    ],
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="space-y-3 p-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-9 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 font-medium mb-2">Failed to load rewards</div>
        <p className="text-red-500 text-sm">{error.message}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (rewards.length === 0) {
    return (
      <div className="text-center p-12">
        <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v1.5c0 1.24-1.01 2.25-2.25 2.25H5.25c-1.24 0-2.25-1.01-2.25-2.25v-1.5m12.5-7.5l-3.75-3.75L12 4.5l-3.75 3.75M12 4.5v12m0 0l3.75-3.75M12 18.75l-3.75-3.75" />
          </svg>
        </div>
        <h3 className="mt-2 text-lg font-medium text-gray-900">No rewards</h3>
        <p className="mt-1 text-gray-500">Get started by creating a new reward.</p>
        <div className="mt-6">
          <Link href="/admin/rewards/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Reward
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead 
                  key={header.id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody className="bg-white divide-y divide-gray-200">
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              className="hover:bg-gray-50 transition-colors"
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell 
                  key={cell.id}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
