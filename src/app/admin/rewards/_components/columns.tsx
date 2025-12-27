import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { Reward } from '@/lib/api/reward';
import { DeleteRewardDialog } from './delete-reward-dialog';

type ColumnHelper<T> = {
  column: {
    toggleSorting: (ascending: boolean) => void;
    getIsSorted: () => 'asc' | 'desc' | false;
  };
  row: {
    original: T;
    getValue: (key: string) => unknown;
  };
};

export const columns: ColumnDef<Reward>[] = [
  {
    accessorKey: "name",
    header: ({ column }: { column: ColumnHelper<Reward>['column'] }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }: { row: { getValue: (key: string) => unknown } }) => (
      <div className="font-medium">{row.getValue("name") as string}</div>
    ),
  },
  {
    accessorKey: "value",
    header: "Value (PKR)",
    cell: ({ row }: { row: { getValue: (key: string) => unknown } }) => {
      const value = Number(row.getValue("value"));
      const formatted = new Intl.NumberFormat("en-PK", {
        style: "currency",
        currency: "PKR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);

      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "requirements",
    header: "Requirements",
    cell: ({ row }: { row: { original: Reward } }) => (
      <div className="text-sm">
        Left: {row.original.requirements.leftLegRequired} | Right: {row.original.requirements.rightLegRequired}
      </div>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }: { row: { getValue: (key: string) => unknown } }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }: { row: { getValue: (key: string) => unknown } }) => {
      const date = new Date(row.getValue("createdAt") as string);
      return (
        <div className="text-sm text-muted-foreground">
          {date.toLocaleDateString()}
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }: { row: { original: Reward } }) => {
      const reward = row.original;
      const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
      
      // Debug: Log the reward object to check its structure
      console.log('Reward object in actions column:', reward);

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Link 
                href={(reward?._id || reward?.id) ? `/admin/rewards/${reward._id || reward.id}/edit` : '#'}
                onClick={(e) => {
                  if (!reward?._id && !reward?.id) {
                    e.preventDefault();
                    console.error('Cannot edit: Invalid reward ID', reward);
                  }
                }}
              >
                <DropdownMenuItem className="cursor-pointer">
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem 
                className="text-destructive cursor-pointer"
                onSelect={(e) => {
                  e.preventDefault();
                  setIsDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {reward?._id || reward?.id ? (
            <DeleteRewardDialog
              rewardId={(reward._id || reward.id) as string}
              rewardName={reward.name}
              open={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
            />
          ) : (
            console.error('Invalid reward object, missing ID:', reward)
          )}
        </>
      );
    },
  },
];
