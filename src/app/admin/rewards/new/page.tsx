'use client';

import { RewardForm } from '../_components/reward-form-fixed';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export default function NewRewardPage() {
  return (
    <>
      <div className="mb-6">
        <Link href="/admin/rewards">
          <Button variant="ghost" className="mb-4 px-0">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Rewards
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Add New Reward</h1>
        <p className="text-gray-600 mt-1">
          Create a new reward that users can earn by reaching milestones
        </p>
      </div>
      
      <Card className="bg-white shadow-sm rounded-lg overflow-hidden">
        <CardHeader className="border-b border-gray-200 px-6 py-4 bg-gray-50">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Reward Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <RewardForm />
        </CardContent>
      </Card>
    </>
  );
}
