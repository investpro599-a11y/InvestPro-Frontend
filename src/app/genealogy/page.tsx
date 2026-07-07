"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { usePathname, useRouter } from "next/navigation";
import { Layout } from "@/components/layout";
import { UserGenealogyTree } from "@/components/genealogy/user-genealogy-tree";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Genealogy() {
  const { isAuthenticated, isAdmin } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Genealogy Tree</h1>
                <p className="text-gray-600 mt-1">View your personal referral network and team structure.</p>
              </div>
              {isAdmin && (
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <Shield className="h-3 w-3" />
                    <span>Admin Access</span>
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push("/admin/genealogy")}
                    className="flex items-center space-x-2"
                  >
                    <span>Admin Genealogy</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Commission Levels Card */}
            <div className="md:w-1/4 w-full">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="text-lg">Referral Commission Levels</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex justify-between text-sm"><span>Direct (Level 1)</span><span className="font-semibold">5%</span></li>
                    <li className="flex justify-between text-sm"><span>Level 2</span><span className="font-semibold">1%</span></li>
                    <li className="flex justify-between text-sm"><span>Level 3</span><span className="font-semibold">0.5%</span></li>
                    <li className="flex justify-between text-sm"><span>Level 4</span><span className="font-semibold">0.5%</span></li>
                    <li className="flex justify-between text-sm"><span>Level 5</span><span className="font-semibold">0.2%</span></li>
                    <li className="flex justify-between text-sm"><span>Level 6</span><span className="font-semibold">0.2%</span></li>
                    <li className="flex justify-between text-sm"><span>Level 7</span><span className="font-semibold">0.1%</span></li>
                    <li className="flex justify-between text-sm"><span>Level 8</span><span className="font-semibold">0.1%</span></li>
                    <li className="flex justify-between text-sm"><span>Level 9</span><span className="font-semibold">0.1%</span></li>
                    <li className="flex justify-between text-sm"><span>Level 10</span><span className="font-semibold">0.1%</span></li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            <div className="flex-1">
          <UserGenealogyTree />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
