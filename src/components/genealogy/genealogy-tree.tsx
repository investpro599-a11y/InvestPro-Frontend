"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { genealogyApi } from "@/lib";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { PrinterCheck, Users, RefreshCw, Loader2, Search, X, ZoomIn, ZoomOut } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import type { GenealogyNode, User } from "@/../shared/schema";
import { getFileUrl } from "@/lib/utils";

// Safe function to get initials from fullName
const getInitials = (fullName: string | null | undefined) => {
  if (!fullName) return "U";
  return fullName.split(" ").map(n => n[0]).join("").toUpperCase() || "U";
};

function TreeNodeComponent({ node }: { node: GenealogyNode }) {
  if (!node) return null;

  const isNonInvested = !node.investmentAmount || node.investmentAmount <= 0;

  return (
    <div className="flex flex-col items-center">
      <div
        className={`rounded-xl border border-sky-500/30 bg-[#0c1e34]/95 backdrop-blur-xl p-3 text-center w-48 sm:w-52 text-white shadow-xl transition-all duration-300 hover:border-sky-400/60 hover:bg-[#0f243f] ${isNonInvested ? 'opacity-70' : ''}`}
        tabIndex={0}
        aria-label={`Genealogy card for ${node.fullName || 'Unknown User'}`}
      >
        <Avatar className="w-10 h-10 mx-auto mb-1.5 border-2 border-sky-400/40 shadow-md">
          <AvatarImage src={getFileUrl(node.profilePicture)} />
          <AvatarFallback className="bg-sky-950 text-sky-200 font-bold text-xs">
            {getInitials(node.fullName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-center space-y-0.5">
          <span className="font-extrabold font-display text-white text-sm truncate max-w-[150px] block" title={node.fullName || 'Unknown User'}>
            {node.fullName || "Unknown User"}
          </span>
          <span className="text-[11px] text-sky-300 font-semibold truncate max-w-[130px] block" title={node.username || 'unknown'}>
            @{node.username || "unknown"}
          </span>
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/15 border border-sky-400/30 text-[10px] font-bold text-sky-200 my-1">
            <span className="node-dot" /> Level {node.level}
          </div>
          {isNonInvested && (
            <Badge variant="outline" className="text-[10px] py-0 border-amber-400/40 bg-amber-500/10 text-amber-300">Not Invested</Badge>
          )}
        </div>
        <div className="mt-1.5 space-y-0.5 text-left bg-[#07172b] p-2 rounded-lg border border-sky-500/20 text-[10px]">
          <div className="flex justify-between">
            <span className="text-slate-300 font-medium">Balance:</span>
            <span className="font-bold text-white">${node.balance?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-300 font-medium">Investment:</span>
            <span className="font-bold text-sky-300">${node.investmentAmount?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-300 font-medium">Commission:</span>
            <span className="font-bold text-indigo-300">${node.commissionAmount?.toLocaleString()}</span>
          </div>
        </div>
        {node.commissionForRoot > 0 && (
          <div className="mt-1.5 p-2 rounded-lg bg-[#051120] border border-emerald-500/30 text-left">
            <p className="text-[10px] font-bold text-emerald-400">Total from member: ${node.commissionForRoot.toLocaleString()}</p>
          </div>
        )}
      </div>

      {node.children && node.children.length > 0 && (
        <>
          <div className="h-4 w-px bg-sky-400/40 my-0.5"></div>
          <div className="flex space-x-4 sm:space-x-6 overflow-x-auto pb-1">
            {node.children.map((child) => (
              <TreeNodeComponent key={child.id || child._id} node={child} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function GenealogyTree({ selectedUserId: initialSelectedUserId }: { selectedUserId?: string }) {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<string>(initialSelectedUserId || "myself");
  const [isLoadingTree, setIsLoadingTree] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [zoomScale, setZoomScale] = useState(0.8);

  const isValidUserId = (id: string | undefined) => {
    if (!id) return false;
    if (id === 'myself') return true;
    return /^[a-fA-F0-9]{24}$/.test(id);
  };

  useEffect(() => {
    if (initialSelectedUserId && isValidUserId(initialSelectedUserId)) {
      setSelectedUserId(initialSelectedUserId);
    } else {
      setSelectedUserId('myself');
    }
  }, [initialSelectedUserId]);

  const handleSelectUser = (id: string) => {
    if (isValidUserId(id)) {
      setSelectedUserId(id);
    } else {
      setSelectedUserId('myself');
    }
  };

  const { data: treeData, isLoading, refetch, error } = useQuery({
    queryKey: ["genealogy", isValidUserId(selectedUserId) && selectedUserId !== "myself" ? selectedUserId : undefined],
    queryFn: () => genealogyApi.getTree(isValidUserId(selectedUserId) && selectedUserId !== "myself" ? selectedUserId : undefined),
    enabled: !!selectedUserId && isValidUserId(selectedUserId),
    retry: 1,
  });

  const { data: teamMembers = [], isLoading: loadingTeamMembers, refetch: refetchTeamMembers } = useQuery({
    queryKey: ["genealogy/team-members"],
    queryFn: genealogyApi.getTeamMembers,
    retry: 1,
  });

  const filteredTeamMembers = teamMembers.filter((member: User) =>
    member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLoadTree = async () => {
    if (!selectedUserId) {
      toast.error("Please select a team member first");
      return;
    }

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

  const handleSearchClear = () => {
    setSearchQuery("");
  };

  const handleZoomIn = () => setZoomScale(prev => Math.min(prev + 0.1, 1.3));
  const handleZoomOut = () => setZoomScale(prev => Math.max(prev - 0.1, 0.4));
  const handleFitScreen = () => setZoomScale(0.75);

  const getSelectedMemberName = () => {
    if (selectedUserId === "myself") {
      return user?.fullName || "Myself";
    }
    const member = teamMembers.find((m: User) => String(m.id || m._id) === selectedUserId);
    return member?.fullName || "Select Member";
  };

  const showSelectionControls = !initialSelectedUserId || isAdmin;

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (treeData && scrollContainerRef.current) {
      const el = scrollContainerRef.current;
      setTimeout(() => {
        el.scrollLeft = Math.max(0, (el.scrollWidth - el.clientWidth) / 2);
      }, 100);
    }
  }, [treeData, zoomScale]);

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
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <CardTitle className="text-xl font-extrabold font-display text-white">Genealogy Tree</CardTitle>
            {isAdmin && (
              <Badge variant="secondary" className="bg-sky-500/20 text-sky-300 border border-sky-400/30 font-bold text-xs">
                Admin View
              </Badge>
            )}
          </div>
          {showSelectionControls && (
            <div className="flex flex-wrap items-center gap-2">
              {isAdmin && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-8 w-44 sm:w-56 h-8 text-xs bg-[#07172b] border-sky-500/20 text-white"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSearchClear}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-5 w-5 p-0 text-slate-400"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}
              <Select value={selectedUserId} onValueChange={handleSelectUser}>
                <SelectTrigger className="w-44 h-8 text-xs bg-[#07172b] border-sky-500/20 text-white">
                  <SelectValue placeholder="Select Member" />
                </SelectTrigger>
                <SelectContent className="bg-[#0c1e34] border-sky-500/30 text-white">
                  <SelectItem value="myself">
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-4 h-4">
                        <AvatarImage src={getFileUrl(user?.profilePicture)} />
                        <AvatarFallback className="text-xs">
                          {getInitials(user?.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <span>Myself</span>
                    </div>
                  </SelectItem>
                  {filteredTeamMembers.map((member: User) => (
                    <SelectItem key={member.id || member._id} value={String(member.id || member._id)}>
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-4 h-4">
                          <AvatarImage src={getFileUrl(member.profilePicture)} />
                          <AvatarFallback className="text-xs">
                            {getInitials(member.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{member.fullName || "Unknown User"}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Zoom Controls */}
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

              <Button 
                onClick={handleLoadTree} 
                disabled={isLoadingTree || !selectedUserId}
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold h-8 text-xs shadow-md"
              >
                {isLoadingTree ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                )}
                Load
              </Button>
            </div>
          )}
        </div>
        
        {selectedUserId && (
          <div className="text-xs text-slate-300 mt-2 font-medium">
            Currently viewing: <span className="font-bold text-white">{getSelectedMemberName()}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0 bg-[#061424] relative min-h-[500px]">
        {isLoading || isLoadingTree ? (
          <div className="flex justify-center py-16">
            <div className="flex flex-col items-center space-y-4">
              <Skeleton className="h-32 w-48 bg-sky-900/30" />
              <Skeleton className="h-4 w-32 bg-sky-900/30" />
            </div>
          </div>
        ) : treeData ? (
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}
