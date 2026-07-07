"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { genealogyApi } from "@/lib";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Loader2, PrinterCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import type { GenealogyNode } from "@/../shared/schema";
import { getFileUrl } from "@/lib/utils";

function TreeNodeComponent({ node }: { node: GenealogyNode }) {
  const levelColors = [
    "bg-blue-800 border-blue-900 text-white",      // Level 1 (root)
    "bg-green-800 border-green-900 text-white",    // Level 2
    "bg-purple-800 border-purple-900 text-white",  // Level 3
    "bg-orange-800 border-orange-900 text-white",  // Level 4
    "bg-pink-800 border-pink-900 text-white",      // Level 5
    "bg-yellow-700 border-yellow-900 text-black",  // Level 6
    "bg-red-800 border-red-900 text-white",        // Level 7
    "bg-cyan-800 border-cyan-900 text-white",      // Level 8
    "bg-gray-800 border-gray-900 text-white",      // Level 9
    "bg-lime-800 border-lime-900 text-white",      // Level 10
  ];

  const colorClass = levelColors[node.level - 1] || "bg-gray-900 border-gray-900 text-white";

  return (
    <div className="flex flex-col items-center">
      <div className={`rounded-xl border-2 p-4 text-center min-w-[200px] ${colorClass}`}>
        <Avatar className="w-12 h-12 mx-auto mb-2">
          <AvatarImage src={getFileUrl(node.profilePicture)} />
          <AvatarFallback>
            {node.fullName.split(" ").map(n => n[0]).join("").toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <p className="font-semibold">{node.fullName}</p>
        <p className="text-sm opacity-80">@{node.username}</p>
        <p className="text-xs opacity-60">Level {node.level}</p>
        <p className="text-xs mt-1">Balance: ${node.balance?.toLocaleString()}</p>
        <p className="text-xs mt-1">Total Investment: ${node.investmentAmount?.toLocaleString()}</p>
        <p className="text-xs mt-1">Total Commission Earned: ${node.commissionAmount?.toLocaleString()}</p>
        { (node.investmentAmount ?? 0) > 0 && (
          <p className="text-xs mt-1" title="This is your fixed monthly return (15%) on your own investment. Not a commission.">
            Monthly ROI: ${((node.investmentAmount ?? 0) * 0.15).toLocaleString()}
            <span className="ml-1 text-gray-400" title="This is your fixed monthly return (15%) on your own investment. Not a commission.">ⓘ</span>
          </p>
        )}
        <p className="text-[10px] text-gray-400 mt-1">Commission is from your downline's investments. ROI is your own investment return.</p>
        {node.commissionForRoot > 0 && (
          <div className="mt-2 text-left">
            <p className="text-xs font-semibold text-green-700">You earn from this member:</p>
            <ul className="text-xs ml-2">
              {node.commissionForRootDetails.map((detail, idx) => (
                <li key={idx} className="mb-1">
                  <span>• Investment: ${detail.investmentAmount.toLocaleString()} on {new Date(detail.date).toLocaleDateString()}<br/></span>
                  <span>  Rate: {detail.rate}% → <span className="font-bold">${detail.commissionAmount.toLocaleString()}</span></span>
                  <span className="ml-2 inline-block px-2 py-0.5 rounded bg-green-100 text-green-800 text-[10px] font-bold align-middle">One-time commission paid</span>
                </li>
              ))}
            </ul>
            <p className="text-xs font-bold text-green-800 mt-1">Total from this member: ${node.commissionForRoot.toLocaleString()}</p>
          </div>
        )}
      </div>

      {node.children && node.children.length > 0 && (
        <>
          <div className="h-8 w-px bg-gray-300 my-2"></div>
          <div className="flex space-x-8">
            {node.children.map((child) => (
              <TreeNodeComponent key={child.id || child._id} node={child} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function UserGenealogyTree() {
  const { user } = useAuth();
  const [isLoadingTree, setIsLoadingTree] = useState(false);

  const { data: treeData, isLoading, refetch } = useQuery({
    queryKey: ["genealogy"],
    queryFn: () => genealogyApi.getTree(),
    enabled: !!user,
  });

  const handleLoadTree = async () => {
    setIsLoadingTree(true);
    try {
      await refetch();
      toast.success("Genealogy tree loaded successfully");
    } catch (error) {
      toast.error("Failed to load genealogy tree");
    } finally {
      setIsLoadingTree(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CardTitle>My Genealogy Tree</CardTitle>
            <Badge variant="secondary" className="text-xs">
              Personal View
            </Badge>
          </div>
          <div className="flex space-x-3">
            <Button 
              onClick={handleLoadTree} 
              disabled={isLoadingTree}
              variant="default"
            >
              {isLoadingTree ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Load Tree
            </Button>
            
            <Button onClick={handlePrint} variant="outline">
              <PrinterCheck className="h-4 w-4 mr-2" />
              Print Tree
            </Button>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Currently viewing: <span className="font-medium">{user?.fullName || "Your Tree"}</span>
          <span className="ml-2 text-blue-600">
            (Your personal referral network)
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading || isLoadingTree ? (
          <div className="flex justify-center py-8">
            <div className="flex flex-col items-center space-y-4">
              <Skeleton className="h-32 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        ) : treeData && treeData.user ? (
          <div className="overflow-x-auto">
            <div className="min-w-full p-8">
              <TreeNodeComponent node={treeData.user} />
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No genealogy data available</p>
            <p className="text-sm">You must have at least one approved investment to view your genealogy tree.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 