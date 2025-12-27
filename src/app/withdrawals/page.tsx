"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { usePathname, useRouter } from "next/navigation";
import { Layout } from "@/components/layout";
import { WithdrawalForm } from "@/components/withdrawal/withdrawal-form";
import { WithdrawalTable } from "@/components/withdrawal/withdrawal-table";

export default function Withdrawals() {
  const { isAuthenticated, isAdmin } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (isAdmin) {
      router.push("/admin");
    }
  }, [isAuthenticated, isAdmin, router]);

  if (!isAuthenticated || isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Withdrawals</h1>
            <p className="text-gray-600 mt-1">Request withdrawals for your ROI and commission earnings.</p>
          </div>

          <div className="space-y-8">
            <WithdrawalForm />
            <WithdrawalTable />
          </div>
        </div>
      </div>
    </Layout>
  );
}
