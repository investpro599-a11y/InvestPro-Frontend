"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { usePathname, useRouter } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { WithdrawalApproval } from "@/components/admin/withdrawal-approval";

export default function AdminWithdrawalApprovals() {
  const { isAuthenticated, isAdmin } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (!isAdmin) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isAdmin, router]);

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Withdrawal Approvals</h1>
          <p className="text-gray-600 mt-1">Review and process pending withdrawal requests.</p>
        </div>

        <WithdrawalApproval />
      </div>
    </div>
  );
}
