import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { RewardsTable } from "./_components/rewards-table";
import { ClaimsTable } from "./_components/claims-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function RewardsPage() {
  return (
    <>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Rewards Management</h1>
            <p className="text-gray-600 mt-1">
              Manage rewards that users can earn and claim
            </p>
          </div>
          <Link href="/admin/rewards/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Reward
            </Button>
          </Link>
        </div>
      </div>
      
<div className="space-y-6">
        <Card className="bg-white shadow-sm rounded-lg overflow-hidden">
          <CardHeader className="border-b border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">Reward Claims</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              View all reward claims by users
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <ClaimsTable />
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm rounded-lg overflow-hidden">
          <CardHeader className="border-b border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">All Rewards</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Manage available rewards and their details
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <RewardsTable />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
