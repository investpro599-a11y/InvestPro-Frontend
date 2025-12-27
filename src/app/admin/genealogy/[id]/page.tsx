"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useParams, useRouter } from "next/navigation";
import { Layout } from "@/components/layout";
import { GenealogyTree } from "@/components/genealogy/genealogy-tree";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";

export default function AdminGenealogyView() {
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const { id } = useParams();
  const userId = Array.isArray(id) ? id[0] : id;

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push("/admin/genealogy")}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Genealogy Management</span>
              </Button>
            </div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">User Genealogy Tree</h1>
              <Badge variant="secondary">Admin View</Badge>
            </div>
            <p className="text-gray-600 mt-1">
              Viewing the complete genealogy tree for user ID: {userId}
            </p>
          </div>

          <GenealogyTree selectedUserId={userId} />
        </div>
      </div>
    </Layout>
  );
} 