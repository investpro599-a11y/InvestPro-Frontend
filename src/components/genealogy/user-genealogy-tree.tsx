"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { genealogyApi } from "@/lib";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Loader2, PrinterCheck, Users, ZoomIn, ZoomOut, Maximize2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import type { GenealogyNode } from "@/../shared/schema";
import { getFileUrl } from "@/lib/utils";

function TreeNodeComponent({ node }: { node: GenealogyNode }) {
  const isNonInvested = !node.investmentAmount || node.investmentAmount <= 0;

  const leftChild = node.children?.find(c => c.placementPosition === 'left');
  const rightChild = node.children?.find(c => c.placementPosition === 'right');

  return (
    <div className="flex flex-col items-center">
      <div className={`rounded-xl border border-sky-500/30 bg-[#0c1e34]/95 backdrop-blur-xl p-3 text-center w-48 sm:w-52 text-white shadow-xl transition-all duration-300 hover:border-sky-400/60 hover:bg-[#0f243f] ${isNonInvested ? 'opacity-70' : ''}`}>
        <div className="flex justify-center mb-1.5">
          <Avatar className="w-10 h-10 border-2 border-sky-400/40 shadow-md">
            <AvatarImage src={getFileUrl(node.profilePicture)} />
            <AvatarFallback className="bg-sky-950 text-sky-200 font-bold text-xs">
              {node.fullName.split(" ").map(n => n[0]).join("").toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        <p className="font-extrabold font-display text-white text-sm truncate">{node.fullName}</p>
        <p className="text-[11px] text-sky-300 font-semibold truncate">@{node.username}</p>
        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/15 border border-sky-400/30 text-[10px] font-bold text-sky-200 my-1">
          <span className="node-dot" /> Level {node.level}
        </div>
        <div className="mt-1.5 space-y-0.5 text-left bg-[#07172b] p-2 rounded-lg border border-sky-500/20 text-[10px]">
          <div className="flex justify-between">
            <span className="text-slate-300 font-medium">Balance:</span>
            <span className="font-bold text-white">${node.balance?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-300 font-medium">Total Invest:</span>
            <span className="font-bold text-sky-300">${node.investmentAmount?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-300 font-medium">Commission:</span>
            <span className="font-bold text-indigo-300">${node.commissionAmount?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-300 font-medium">Left Vol:</span>
            <span className="font-bold text-teal-300">${(node.leftVolume ?? 0).toLocaleString()} USD</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-300 font-medium">Right Vol:</span>
            <span className="font-bold text-teal-300">${(node.rightVolume ?? 0).toLocaleString()} USD</span>
          </div>
        </div>

        { (node.investmentAmount ?? 0) > 0 && (
          <div className="mt-1.5 p-1.5 rounded-lg bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold">
            Monthly ROI: ${((node.investmentAmount ?? 0) * 0.15).toLocaleString()} USD
          </div>
        )}

        {node.commissionForRoot > 0 && (
          <div className="mt-2 p-2 rounded-lg bg-[#051120] border border-emerald-500/30 text-left">
            <p className="text-[10px] font-bold text-emerald-400">Total earned: ${node.commissionForRoot.toLocaleString()}</p>
          </div>
        )}
      </div>

      <div className="h-4 w-px bg-sky-400/40 my-0.5"></div>
      <div className="flex space-x-2 sm:space-x-4">
        <div className="flex flex-col items-center">
          <Badge variant="outline" className="mb-1 bg-[#091a2e] text-sky-300 border-sky-400/30 font-bold text-[10px] px-2 py-0">Left</Badge>
          {leftChild ? (
            <TreeNodeComponent node={leftChild} />
          ) : (
            <div className="border border-dashed border-sky-500/30 rounded-xl p-2 text-center w-40 text-slate-400 flex items-center justify-center min-h-[70px] bg-[#07172b]/60 text-[11px] font-bold">
              Empty Spot
            </div>
          )}
        </div>
        <div className="flex flex-col items-center">
          <Badge variant="outline" className="mb-1 bg-[#091a2e] text-indigo-300 border-indigo-400/30 font-bold text-[10px] px-2 py-0">Right</Badge>
          {rightChild ? (
            <TreeNodeComponent node={rightChild} />
          ) : (
            <div className="border border-dashed border-sky-500/30 rounded-xl p-2 text-center w-40 text-slate-400 flex items-center justify-center min-h-[70px] bg-[#07172b]/60 text-[11px] font-bold">
              Empty Spot
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function UserGenealogyTree() {
  const { user } = useAuth();
  const [isLoadingTree, setIsLoadingTree] = useState(false);
  const [zoomScale, setZoomScale] = useState(0.8); // Default 80% to fit screen
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { data: treeData, isLoading, refetch, error } = useQuery({
    queryKey: ["genealogy"],
    queryFn: () => genealogyApi.getTree(),
    enabled: !!user,
  });

  useEffect(() => {
    if (treeData && scrollContainerRef.current) {
      const el = scrollContainerRef.current;
      setTimeout(() => {
        el.scrollLeft = Math.max(0, (el.scrollWidth - el.clientWidth) / 2);
      }, 100);
    }
  }, [treeData, zoomScale]);

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

  const handleZoomIn = () => setZoomScale(prev => Math.min(prev + 0.1, 1.3));
  const handleZoomOut = () => setZoomScale(prev => Math.max(prev - 0.1, 0.4));
  const handleFitScreen = () => setZoomScale(0.75);
  const handleResetZoom = () => setZoomScale(1.0);

  if (error) {
    return (
      <Card className="glass-card border-rose-500/30 bg-[#0e2238]/90 text-white">
        <CardContent className="text-center py-8">
          <div className="text-rose-400 mb-4 font-bold">
            <p>Failed to load genealogy data</p>
            <p className="text-xs text-slate-400">Please try again later</p>
          </div>
          <Button onClick={() => refetch()} variant="outline" className="border-rose-400/30 text-rose-300">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-sky-500/25 bg-[#0e2238]/90 text-white overflow-hidden shadow-2xl">
      <CardHeader className="border-b border-sky-500/20 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-xl font-extrabold font-display text-white">Your Genealogy Tree</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-[#07172b] p-1 rounded-xl border border-sky-500/20 space-x-1">
              <Button onClick={handleZoomOut} variant="ghost" size="icon" className="h-7 w-7 text-sky-300 hover:bg-sky-500/20" title="Zoom Out">
                <ZoomOut className="h-3.5 w-3.5" />
              </Button>
              <span className="text-xs font-bold text-sky-300 px-1">{Math.round(zoomScale * 100)}%</span>
              <Button onClick={handleZoomIn} variant="ghost" size="icon" className="h-7 w-7 text-sky-300 hover:bg-sky-500/20" title="Zoom In">
                <ZoomIn className="h-3.5 w-3.5" />
              </Button>
              <Button onClick={handleFitScreen} variant="ghost" size="sm" className="h-7 px-2 text-xs font-bold text-sky-300 hover:bg-sky-500/20">
                Fit
              </Button>
            </div>
            <Button onClick={handleLoadTree} variant="outline" size="sm" className="bg-sky-500/10 border-sky-400/30 text-sky-300 hover:bg-sky-500/20 h-8 text-xs font-bold">
              <RefreshCw className="h-3.5 w-3.5 mr-1" /> Reload
            </Button>
          </div>
        </div>
        
        <div className="text-xs text-slate-300 mt-2 font-medium">
          Currently viewing: <span className="font-bold text-white">{user?.fullName || "Your Tree"}</span>
          <span className="ml-2 text-sky-300 font-semibold">
            (Your personal referral network)
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 bg-[#061424] relative min-h-[500px]">
        {isLoading || isLoadingTree ? (
          <div className="flex justify-center py-16">
            <div className="flex flex-col items-center space-y-4">
              <Skeleton className="h-32 w-48 bg-sky-900/30" />
              <Skeleton className="h-4 w-32 bg-sky-900/30" />
            </div>
          </div>
        ) : treeData && treeData.user ? (
          <div 
            ref={scrollContainerRef}
            className="overflow-auto max-h-[calc(100vh-220px)] p-8 text-center"
          >
            <div 
              className="inline-block transition-transform duration-200 origin-top min-w-max p-4 text-left"
              style={{ transform: `scale(${zoomScale})` }}
            >
              <TreeNodeComponent node={treeData.user} />
            </div>
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50 text-sky-400" />
            <p className="text-base font-bold text-white">No genealogy data available</p>
            <p className="text-xs text-slate-400 mt-1">You must have at least one approved investment to view your genealogy tree.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 