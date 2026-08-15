"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Layout } from "@/components/layout";
import { UserManagement } from "@/components/admin/user-management";
import { usePathname, useRouter } from "next/navigation";

export default function AdminUsers() {
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
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white">User <span className="gradient-text-primary">Management</span></h1>
            <p className="text-slate-300 mt-1 font-medium">View and manage all registered users in the system.</p>
          </div>

          <UserManagement />
        </div>
      </div>
    </Layout>
  );
}
