"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { notificationApi } from "@/lib";
import { getFileUrl } from "@/lib/utils";
import {
  ChartLine, 
  Bell, 
  ChevronDown, 
  User, 
  Settings, 
  LogOut, 
  Shield, 
  Users, 
  FileText, 
  Network,
  TrendingUp,
  DollarSign,
  CheckCircle,
  XCircle,
  Menu,
  Gift
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { NotificationPanel } from "@/components/notifications/notification-panel";
import { usePathname } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import React from "react";

export function Navigation() {
  const { user, logout, isAdmin } = useAuth();
  const location = usePathname();
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const { data: unreadNotifications = [], error: notificationError } = useQuery({
    queryKey: ["notifications/unread"],
    queryFn: notificationApi.getUnread,
    enabled: !!user,
    retry: false,
  });

  const isActive = (path: string) => location === path;
  const isAdminActive = location.startsWith("/admin");

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (!user) return null;

  // Mobile menu links
  const mobileLinks = (
    <div className="flex flex-col gap-2 p-4">
      {/* User Info */}
      <div className="flex items-center gap-3 mb-4 border-b pb-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={getFileUrl(user.profilePicture)} />
          <AvatarFallback>{user.fullName.split(" ").map(n => n[0]).join("").toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-semibold text-base">{user.fullName}</div>
          <div className="text-xs text-gray-500">{user.email}</div>
        </div>
        <Button variant="ghost" size="icon" aria-label="Close menu" className="ml-auto" onClick={() => setDrawerOpen(false)}>
          <XCircle className="h-6 w-6" />
        </Button>
      </div>
      {/* Main Links */}
      <div className="flex flex-col gap-1 mb-2">
        <Link href="/dashboard" onClick={() => setDrawerOpen(false)} className={`py-3 px-4 rounded-lg text-base font-semibold transition-colors flex items-center gap-2 ${isActive("/dashboard") || isActive("/") ? "bg-primary text-white" : "text-gray-700 hover:bg-primary/10"}`}>Dashboard</Link>
        {!isAdmin && (
          <>
            <Link href="/investments" onClick={() => setDrawerOpen(false)} className={`py-3 px-4 rounded-lg text-base font-semibold transition-colors flex items-center gap-2 ${isActive("/investments") ? "bg-primary text-white" : "text-gray-700 hover:bg-primary/10"}`}>Investments</Link>
            <Link href="/withdrawals" onClick={() => setDrawerOpen(false)} className={`py-3 px-4 rounded-lg text-base font-semibold transition-colors flex items-center gap-2 ${isActive("/withdrawals") ? "bg-primary text-white" : "text-gray-700 hover:bg-primary/10"}`}>Withdrawals</Link>
            <Link href="/rewards" onClick={() => setDrawerOpen(false)} className={`py-3 px-4 rounded-lg text-base font-semibold transition-colors flex items-center gap-2 ${isActive("/rewards") ? "bg-primary text-white" : "text-gray-700 hover:bg-primary/10"}`}>
              <Gift className="h-4 w-4" /> Rewards
            </Link>
          </>
        )}
        <Link href="/genealogy" onClick={() => setDrawerOpen(false)} className={`py-3 px-4 rounded-lg text-base font-semibold transition-colors flex items-center gap-2 ${isActive("/genealogy") ? "bg-primary text-white" : "text-gray-700 hover:bg-primary/10"}`}>Genealogy</Link>
      </div>
      {/* Admin Section */}
      {isAdmin && (
        <>
          <div className="text-xs uppercase text-gray-400 mt-2 mb-1 tracking-wider">Admin</div>
          <div className="flex flex-col gap-1 mb-2">
            <Link href="/admin" onClick={() => setDrawerOpen(false)} className="py-3 px-4 rounded-lg text-base font-semibold text-gray-700 hover:bg-primary/10 flex items-center gap-2"><Shield className="h-4 w-4" /> Admin Dashboard</Link>
            <Link href="/admin/users" onClick={() => setDrawerOpen(false)} className="py-3 px-4 rounded-lg text-base font-semibold text-gray-700 hover:bg-primary/10 flex items-center gap-2"><Users className="h-4 w-4" /> User Management</Link>
            <Link href="/admin/investment-approvals" onClick={() => setDrawerOpen(false)} className="py-3 px-4 rounded-lg text-base font-semibold text-gray-700 hover:bg-primary/10 flex items-center gap-2"><DollarSign className="h-4 w-4" /> Investment Approvals</Link>
            <Link href="/admin/withdrawal-approvals" onClick={() => setDrawerOpen(false)} className="py-3 px-4 rounded-lg text-base font-semibold text-gray-700 hover:bg-primary/10 flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Withdrawal Approvals</Link>
            <Link href="/admin/rewards" onClick={() => setDrawerOpen(false)} className="py-3 px-4 rounded-lg text-base font-semibold text-gray-700 hover:bg-primary/10 flex items-center gap-2"><Gift className="h-4 w-4" /> Rewards Management</Link>
            <Link href="/admin/logs" onClick={() => setDrawerOpen(false)} className="py-3 px-4 rounded-lg text-base font-semibold text-gray-700 hover:bg-primary/10 flex items-center gap-2"><FileText className="h-4 w-4" /> System Logs</Link>
            <Link href="/admin/database-config" onClick={() => setDrawerOpen(false)} className="py-3 px-4 rounded-lg text-base font-semibold text-gray-700 hover:bg-primary/10 flex items-center gap-2"><Settings className="h-4 w-4" /> Database Config</Link>
            <Link href="/admin/genealogy" onClick={() => setDrawerOpen(false)} className="py-3 px-4 rounded-lg text-base font-semibold text-gray-700 hover:bg-primary/10 flex items-center gap-2"><Network className="h-4 w-4" /> Genealogy Management</Link>
          </div>
        </>
      )}
      {/* Divider */}
      <div className="border-t my-2" />
      {/* Notification Bell */}
      <div className="flex items-center gap-2 mb-2">
        <Bell className="h-5 w-5 text-gray-500" />
        <span className="text-sm">Notifications</span>
        {unreadNotifications.length > 0 && (
          <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
            {unreadNotifications.length > 9 ? "9+" : unreadNotifications.length}
          </Badge>
        )}
      </div>
      {/* Profile & Logout */}
      <div className="flex flex-col gap-1">
        <Link href="/profile" onClick={() => setDrawerOpen(false)} className="py-3 px-4 rounded-lg text-base font-semibold text-gray-700 hover:bg-primary/10 flex items-center gap-2"><User className="h-4 w-4" /> Profile</Link>
        <Link href="/settings" onClick={() => setDrawerOpen(false)} className="py-3 px-4 rounded-lg text-base font-semibold text-gray-700 hover:bg-primary/10 flex items-center gap-2"><Settings className="h-4 w-4" /> Settings</Link>
        <button onClick={handleLogout} className="py-3 px-4 rounded-lg text-base font-semibold text-gray-700 hover:bg-red-100 flex items-center gap-2"><LogOut className="h-4 w-4" /> Logout</button>
      </div>
    </div>
  );

  return (
    <nav className="bg-white/95 backdrop-blur border-b border-gray-200 sticky top-0 z-50 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between min-h-[4.5rem] items-center">
          <div className="flex items-center gap-4 md:gap-6">
            <Link href="/dashboard" className="flex items-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md transition-transform">
              <img src="/investpro.png" alt="InvestPro Logo" className="h-16 w-16 md:h-20 md:w-20 object-contain group-hover:scale-105 transition-transform" />
              <span className="text-xl md:text-2xl font-extrabold tracking-tight text-primary">InvestPro</span>
            </Link>
            {/* Desktop Nav */}
            {!isMobile && (
              <div className="hidden md:flex gap-1 bg-gray-100 rounded-full px-2 py-1 shadow-inner">
                <Link href="/dashboard" className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${isActive("/dashboard") || isActive("/") ? "bg-primary text-white underline underline-offset-4 shadow" : "text-gray-700 hover:bg-primary/10 hover:underline hover:underline-offset-4"}`}>Dashboard</Link>
                {!isAdmin && (
                  <>
                    <Link href="/investments" className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${isActive("/investments") ? "bg-primary text-white underline underline-offset-4 shadow" : "text-gray-700 hover:bg-primary/10 hover:underline hover:underline-offset-4"}`}>Investments</Link>
                    <Link href="/withdrawals" className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${isActive("/withdrawals") ? "bg-primary text-white underline underline-offset-4 shadow" : "text-gray-700 hover:bg-primary/10 hover:underline hover:underline-offset-4"}`}>Withdrawals</Link>
                    <Link href="/rewards" className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${isActive("/rewards") ? "bg-primary text-white underline underline-offset-4 shadow" : "text-gray-700 hover:bg-primary/10 hover:underline hover:underline-offset-4"} flex items-center gap-1`}>
                      <Gift className="h-4 w-4" /> Rewards
                    </Link>
                  </>
                )}
                <Link href="/genealogy" className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${isActive("/genealogy") ? "bg-primary text-white underline underline-offset-4 shadow" : "text-gray-700 hover:bg-primary/10 hover:underline hover:underline-offset-4"}`}>Genealogy</Link>
                {isAdmin && (
                  <>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                          <Shield className="h-4 w-4" /> Admin <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="flex items-center gap-2"> <TrendingUp className="h-4 w-4" /> Dashboard</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/admin/users" className="flex items-center gap-2"><Users className="h-4 w-4" /> User Management</Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                            <DollarSign className="h-4 w-4" /> Approvals <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                        <DropdownMenuItem asChild>
                            <Link href="/admin/investment-approvals" className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> Investment Approvals</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/admin/withdrawal-approvals" className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Withdrawal Approvals</Link>
                        </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                            <Gift className="h-4 w-4" /> Rewards <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem asChild>
                            <Link href="/admin/rewards" className="flex items-center gap-2"><Gift className="h-4 w-4" /> Manage Rewards</Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                            <FileText className="h-4 w-4" /> System <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem asChild>
                            <Link href="/admin/logs" className="flex items-center gap-2"><FileText className="h-4 w-4" /> System Logs</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                            <Link href="/admin/database-config" className="flex items-center gap-2"><Settings className="h-4 w-4" /> Database Config</Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                            <Network className="h-4 w-4" /> Genealogy <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                        <DropdownMenuItem asChild>
                            <Link href="/genealogy" className="flex items-center gap-2"><Network className="h-4 w-4" /> Normal Genealogy</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/admin/genealogy" className="flex items-center gap-2"><Shield className="h-4 w-4" /> Genealogy Management</Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>
            )}
            {/* Mobile Nav Trigger */}
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={() => setDrawerOpen(true)} className="md:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <Menu className="h-8 w-8" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute top-2 right-2 h-3 w-3 rounded-full bg-red-500 border-2 border-white animate-pulse" aria-label="Unread notifications" />
                )}
              </Button>
            )}
          </div>
          {/* Desktop right side (profile, notifications) */}
          {!isMobile && (
            <div className="flex items-center gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 relative focus:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="Notifications">
                    <Bell className="h-5 w-5" />
                    {unreadNotifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 border-2 border-white animate-pulse" aria-label="Unread notifications" />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-96" align="end">
                  <NotificationPanel />
                </PopoverContent>
              </Popover>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-3 py-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={getFileUrl(user.profilePicture)} />
                      <AvatarFallback>
                        {user.fullName.split(" ").map(n => n[0]).join("").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-semibold">{user.fullName}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2"><User className="h-4 w-4" /> Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-2"><Settings className="h-4 w-4" /> Settings</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center gap-2"><Shield className="h-4 w-4" /> Admin Panel</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent className="max-w-xs w-full animate-slideInLeft">
            {mobileLinks}
          </DrawerContent>
        </Drawer>
      )}
    </nav>
  );
}
