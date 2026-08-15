"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { usePathname, useRouter } from "next/navigation";
import { Layout } from "@/components/layout";
import { InvestmentApproval } from "@/components/admin/investment-approval";

export default function AdminInvestmentApprovals() {
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
    <Layout>
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white">Investment <span className="gradient-text-primary">Approvals</span></h1>
            <p className="text-slate-300 mt-1 font-medium">Review and approve pending investment requests.</p>
          </div>

          <InvestmentApproval />
        </div>
      </div>
    </Layout>
  );
}
