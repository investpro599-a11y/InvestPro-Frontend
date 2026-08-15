"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { usePathname, useRouter } from "next/navigation";
import { Layout } from "@/components/layout";
import { NotificationPanel } from "@/components/notifications/notification-panel";

export default function AdminRewardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

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
      <div className="py-8 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Main Content */}
          <div className="flex-1 min-w-0 w-full overflow-hidden space-y-6">
            {children}
          </div>
          
          {/* Notifications Sidebar */}
          <div className="lg:w-80 w-full flex-shrink-0">
            <div className="sticky top-24">
              <NotificationPanel />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
