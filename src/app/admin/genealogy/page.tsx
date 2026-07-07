"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Layout } from "@/components/layout";
import { GenealogyManagement } from "@/components/genealogy/genealogy-management";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Network } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function AdminGenealogy() {
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
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:space-x-3 mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Genealogy Management</h1>
              <Badge variant="destructive" className="text-xs sm:text-sm">Admin Access</Badge>
            </div>
            <p className="text-gray-600 mt-1 text-xs sm:text-base">
              View and manage genealogy trees for all users in the system. 
              Search through users and view their complete referral networks.
            </p>
          </div>

          {/* Admin Info Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2 sm:pb-3">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  <CardTitle className="text-base sm:text-lg">All Users</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs sm:text-sm text-gray-600">
                  Browse all users in the system with search functionality. View their profiles and access their genealogy trees.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 sm:pb-3">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Network className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  <CardTitle className="text-base sm:text-lg">Network Analysis</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs sm:text-sm text-gray-600">
                  Analyze referral patterns, team structures, and commission distribution across the entire network.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 sm:pb-3">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                  <CardTitle className="text-base sm:text-lg">Admin Controls</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs sm:text-sm text-gray-600">
                  Full administrative access to view, analyze, and manage all genealogy data with enhanced controls.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-6 md:flex-row md:gap-8">
            {/* Commission Levels Card */}
            <div className="md:w-1/4 w-full">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Referral Commission Levels</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 sm:space-y-2">
                    <li className="flex justify-between text-xs sm:text-sm"><span>Direct (Level 1)</span><span className="font-semibold">5%</span></li>
                    <li className="flex justify-between text-xs sm:text-sm"><span>Level 2</span><span className="font-semibold">1%</span></li>
                    <li className="flex justify-between text-xs sm:text-sm"><span>Level 3</span><span className="font-semibold">0.5%</span></li>
                    <li className="flex justify-between text-xs sm:text-sm"><span>Level 4</span><span className="font-semibold">0.5%</span></li>
                    <li className="flex justify-between text-xs sm:text-sm"><span>Level 5</span><span className="font-semibold">0.2%</span></li>
                    <li className="flex justify-between text-xs sm:text-sm"><span>Level 6</span><span className="font-semibold">0.2%</span></li>
                    <li className="flex justify-between text-xs sm:text-sm"><span>Level 7</span><span className="font-semibold">0.1%</span></li>
                    <li className="flex justify-between text-xs sm:text-sm"><span>Level 8</span><span className="font-semibold">0.1%</span></li>
                    <li className="flex justify-between text-xs sm:text-sm"><span>Level 9</span><span className="font-semibold">0.1%</span></li>
                    <li className="flex justify-between text-xs sm:text-sm"><span>Level 10</span><span className="font-semibold">0.1%</span></li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            <div className="flex-1">
              <GenealogyManagement />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 