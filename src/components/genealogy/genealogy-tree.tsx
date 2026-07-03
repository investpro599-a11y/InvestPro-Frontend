"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { genealogyApi } from "@/lib";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { PrinterCheck, Users, RefreshCw, Loader2, Search, X } from "lucide-react";
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
  // Safety check for null/undefined node
  if (!node) {
    return null;
  }

  const levelColors = [
    "bg-primary/10 border-primary/30 text-primary",
    "bg-green-50 border-green-200 text-green-700",
    "bg-blue-50 border-blue-200 text-blue-700",
    "bg-purple-50 border-purple-200 text-purple-700",
    "bg-orange-50 border-orange-700 text-orange-700",
  ];

  const colorClass = levelColors[node.level] || "bg-gray-50 border-gray-200 text-gray-700";
  const isNonInvested = !node.investmentAmount || node.investmentAmount <= 0;

  return (
    <div className="flex flex-col items-center">
      <div
        className={`rounded-xl border-2 p-4 text-center min-w-[220px] max-w-xs shadow-md transition-all duration-200 ${colorClass} ${isNonInvested ? 'opacity-70 grayscale' : ''}`}
        tabIndex={0}
        aria-label={`Genealogy card for ${node.fullName || 'Unknown User'}`}
      >
        <Avatar className="w-14 h-14 mx-auto mb-2">
          <AvatarImage src={getFileUrl(node.profilePicture)} />
          <AvatarFallback>
            {getInitials(node.fullName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-center space-y-0.5">
          <span
            className="font-semibold truncate max-w-[140px] block"
            title={node.fullName || 'Unknown User'}
          >
            {node.fullName || "Unknown User"}
          </span>
          <span
            className="text-sm opacity-80 truncate max-w-[120px] block"
            title={node.username || 'unknown'}
          >
            @{node.username || "unknown"}
          </span>
          <span className="text-xs opacity-60">Level {node.level}</span>
          {isNonInvested && (
            <Badge variant="outline" className="text-xs mt-1" title="This user has not invested yet">Not Invested</Badge>
          )}
        </div>
        <div className="mt-2 space-y-1 text-left">
          <div className="flex justify-between text-xs">
            <span className="font-medium">Balance:</span>
            <span className="truncate max-w-[90px]" title={`PKR ${node.balance?.toLocaleString()}`}>PKR {node.balance?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="font-medium">Investment:</span>
            <span className="truncate max-w-[90px]" title={`PKR ${node.investmentAmount?.toLocaleString()}`}>PKR {node.investmentAmount?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="font-medium">Commission:</span>
            <span className="truncate max-w-[90px]" title={`PKR ${node.commissionAmount?.toLocaleString()}`}>PKR {node.commissionAmount?.toLocaleString()}</span>
          </div>
        </div>
        {node.commissionForRoot > 0 && (
          <div className="mt-2 text-left border-t pt-2">
            <p className="text-xs font-semibold text-green-700 mb-1">You earn from this member:</p>
            <ul className="text-xs ml-2 max-h-20 overflow-y-auto pr-1">
              {node.commissionForRootDetails.map((detail, idx) => (
                <li key={idx} className="mb-1">
                  <span>• Investment: PKR {detail.investmentAmount.toLocaleString()} on {new Date(detail.date).toLocaleDateString()}<br /></span>
                  <span>  Rate: {detail.rate}% → <span className="font-bold">PKR {detail.commissionAmount.toLocaleString()}</span></span>
                  <span className="ml-2 inline-block px-2 py-0.5 rounded bg-green-100 text-green-800 text-[10px] font-bold align-middle">One-time commission paid</span>
                </li>
              ))}
            </ul>
            <p className="text-xs font-bold text-green-800 mt-1">Total from this member: PKR {node.commissionForRoot.toLocaleString()}</p>
          </div>
        )}
      </div>

      {node.children && node.children.length > 0 && (
        <>
          <div className="h-8 w-px bg-gray-300 my-2"></div>
          <div className="flex space-x-8 overflow-x-auto pb-2">
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

  // Helper to check for valid userId (MongoDB ObjectId or 'myself')
  const isValidUserId = (id: string | undefined) => {
    if (!id) return false;
    if (id === 'myself') return true;
    // MongoDB ObjectId is 24 hex chars
    return /^[a-fA-F0-9]{24}$/.test(id);
  };

  // Update selectedUserId when prop changes
  useEffect(() => {
    if (initialSelectedUserId && isValidUserId(initialSelectedUserId)) {
      setSelectedUserId(initialSelectedUserId);
    } else {
      setSelectedUserId('myself');
    }
  }, [initialSelectedUserId]);

  // Sanitize setSelectedUserId to never set 'NaN' or invalid
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

  // Filter team members based on search query
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

  const handleRefreshTeamMembers = async () => {
    try {
      await refetchTeamMembers();
      toast.success("Team members refreshed");
    } catch (error) {
      toast.error("Failed to refresh team members");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSearchClear = () => {
    setSearchQuery("");
  };

  const getSelectedMemberName = () => {
    if (selectedUserId === "myself") {
      return user?.fullName || "Myself";
    }
    const member = teamMembers.find((m: User) => String(m.id || m._id) === selectedUserId);
    return member?.fullName || "Select Member";
  };

  // If a specific user is selected and we're not in admin mode, hide the selection controls
  const showSelectionControls = !initialSelectedUserId || isAdmin;

  // Handle error state
  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="text-red-600 mb-4">
            <p>Failed to load genealogy data</p>
            <p className="text-sm text-gray-500">Please try again later</p>
          </div>
          <Button onClick={() => refetch()} variant="outline">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CardTitle>Genealogy Tree</CardTitle>
            {isAdmin && (
              <Badge variant="secondary" className="text-xs">
                Admin View - All Users
              </Badge>
            )}
          </div>
          {showSelectionControls && (
            <div className="flex space-x-3">
              {isAdmin && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search users by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-8 w-64"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSearchClear}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}
              <Select value={selectedUserId} onValueChange={handleSelectUser}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select Member" />
                </SelectTrigger>
                <SelectContent>
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
              
              <Button 
                onClick={handleLoadTree} 
                disabled={isLoadingTree || !selectedUserId}
                variant="default"
              >
                {isLoadingTree ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Load Tree
              </Button>
              
              <Button onClick={handleRefreshTeamMembers} variant="outline" disabled={loadingTeamMembers}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loadingTeamMembers ? 'animate-spin' : ''}`} />
                Refresh Members
              </Button>
              
              <Button onClick={handlePrint} variant="outline">
                <PrinterCheck className="h-4 w-4 mr-2" />
                Print Tree
              </Button>
            </div>
          )}
        </div>
        
        {selectedUserId && (
          <div className="text-sm text-muted-foreground">
            Currently viewing: <span className="font-medium">{getSelectedMemberName()}</span>
            {isAdmin && selectedUserId !== "myself" && (
              <span className="ml-2 text-blue-600">
                (Admin access to all user genealogy trees)
              </span>
            )}
            {isAdmin && searchQuery && (
              <span className="ml-2 text-gray-500">
                • Showing {filteredTeamMembers.length} of {teamMembers.length} users
              </span>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading || isLoadingTree ? (
          <div className="flex justify-center py-8">
            <div className="flex flex-col items-center space-y-4">
            <Skeleton className="h-32 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        ) : treeData ? (
          <div className="overflow-x-auto">
            <div className="min-w-full p-8">
              <TreeNodeComponent node={treeData.user} />
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            {isAdmin && searchQuery && filteredTeamMembers.length === 0 ? (
              <>
                <p>No users found matching "{searchQuery}"</p>
                <p className="text-sm">Try a different search term or clear the search</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSearchClear}
                  className="mt-2"
                >
                  Clear Search
                </Button>
              </>
            ) : (
              <>
                <p>No genealogy data available</p>
                <p className="text-sm">Select a team member and click "Load Tree" to view their genealogy tree</p>
                {isAdmin && (
                  <p className="text-xs text-blue-600 mt-2">
                    As an admin, you can view the genealogy tree of any user in the system
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
