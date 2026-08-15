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
  Gift,
  Sun,
  Moon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { NotificationPanel } from "@/components/notifications/notification-panel";
import { usePathname } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { toast } from "sonner";

export function Navigation() {
  const { user, logout, isAdmin } = useAuth();
  const location = usePathname();
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("investpro-theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      setIsDarkMode(false);
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
      localStorage.setItem("investpro-theme", "light");
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      localStorage.setItem("investpro-theme", "dark");
    }
  };

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
  const navLinkClass = (path: string) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
      isActive(path)
        ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-lg shadow-sky-500/25"
        : "text-slate-300 hover:bg-sky-500/15 hover:text-white"
    }`;

  return (
    <nav className="glass-nav sticky top-0 z-50 transition-all duration-300 shadow-2xl bg-[#061322]/90 border-b border-sky-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-3 group focus:outline-none rounded-xl transition-transform hover:scale-[1.02]">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full blur-md opacity-85 group-hover:opacity-100 transition duration-300" />
                <img src="/investpro.png" alt="InvestPro Logo" className="relative h-12 w-12 object-contain" />
              </div>
              <span className="text-2xl font-extrabold font-display tracking-tight text-white">
                Invest<span className="text-sky-400">Pro</span>
              </span>
            </Link>

            {/* Desktop Nav Pills */}
            {!isMobile && (
              <div className="hidden md:flex gap-1.5 bg-[#091a2e]/90 backdrop-blur-xl border border-sky-500/25 rounded-full p-1.5 shadow-inner">
                <Link
                  href="/dashboard"
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                    isActive("/dashboard") || isActive("/")
                      ? "bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 text-white shadow-lg shadow-sky-500/30 border border-sky-300/40"
                      : "text-slate-200 hover:text-white hover:bg-sky-500/15"
                  }`}
                >
                  Dashboard
                </Link>
                {!isAdmin && (
                  <>
                    <Link
                      href="/investments"
                      className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                        isActive("/investments")
                          ? "bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 text-white shadow-lg shadow-sky-500/30 border border-sky-300/40"
                          : "text-slate-200 hover:text-white hover:bg-sky-500/15"
                      }`}
                    >
                      Investments
                    </Link>
                    <Link
                      href="/withdrawals"
                      className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                        isActive("/withdrawals")
                          ? "bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 text-white shadow-lg shadow-sky-500/30 border border-sky-300/40"
                          : "text-slate-200 hover:text-white hover:bg-sky-500/15"
                      }`}
                    >
                      Withdrawals
                    </Link>
                    <Link
                      href="/rewards"
                      className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 flex items-center gap-1.5 ${
                        isActive("/rewards")
                          ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold shadow-lg shadow-amber-500/30 border border-amber-300/40"
                          : "text-amber-300 hover:text-amber-200 hover:bg-white/10"
                      }`}
                    >
                      <Gift className="h-4 w-4" /> Rewards
                    </Link>
                  </>
                )}
                <Link
                  href="/genealogy"
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                    isActive("/genealogy")
                      ? "bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 text-white shadow-lg shadow-sky-500/30 border border-sky-300/40"
                      : "text-slate-200 hover:text-white hover:bg-sky-500/15"
                  }`}
                >
                  Genealogy
                </Link>
                {isAdmin && (
                  <>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="rounded-full text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-sky-600 dark:hover:text-white hover:bg-sky-500/15">
                          <Shield className="h-4 w-4 text-purple-500 dark:text-purple-400" /> Admin <ChevronDown className="h-4 w-4 opacity-80" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="bg-white/95 dark:bg-[#0a1b2e]/95 backdrop-blur-xl border border-sky-500/25 text-slate-900 dark:text-white shadow-xl">
                        <DropdownMenuItem asChild className="hover:bg-sky-500/15 focus:bg-sky-500/15 text-slate-800 dark:text-slate-100 font-medium">
                          <Link href="/admin" className="flex items-center gap-2"> <TrendingUp className="h-4 w-4 text-sky-500 dark:text-sky-400" /> Dashboard</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="hover:bg-sky-500/15 focus:bg-sky-500/15 text-slate-800 dark:text-slate-100 font-medium">
                          <Link href="/admin/users" className="flex items-center gap-2"><Users className="h-4 w-4 text-purple-500 dark:text-purple-400" /> User Management</Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="rounded-full text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-sky-600 dark:hover:text-white hover:bg-sky-500/15">
                          <DollarSign className="h-4 w-4 text-emerald-500 dark:text-emerald-400" /> Approvals <ChevronDown className="h-4 w-4 opacity-80" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="bg-white/95 dark:bg-[#0a1b2e]/95 backdrop-blur-xl border border-sky-500/25 text-slate-900 dark:text-white shadow-xl">
                        <DropdownMenuItem asChild className="hover:bg-sky-500/15 focus:bg-sky-500/15 text-slate-800 dark:text-slate-100 font-medium">
                          <Link href="/admin/investment-approvals" className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-emerald-500 dark:text-emerald-400" /> Investment Approvals</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="hover:bg-sky-500/15 focus:bg-sky-500/15 text-slate-800 dark:text-slate-100 font-medium">
                          <Link href="/admin/withdrawal-approvals" className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-teal-500 dark:text-teal-400" /> Withdrawal Approvals</Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="rounded-full text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-amber-600 dark:hover:text-white hover:bg-sky-500/15">
                          <Gift className="h-4 w-4 text-amber-500 dark:text-amber-400" /> Rewards <ChevronDown className="h-4 w-4 opacity-70" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100 shadow-xl">
                        <DropdownMenuItem asChild className="hover:bg-sky-500/15 focus:bg-sky-500/15 text-slate-800 dark:text-slate-200 font-medium">
                          <Link href="/admin/rewards" className="flex items-center gap-2"><Gift className="h-4 w-4 text-amber-500 dark:text-amber-400" /> Manage Rewards</Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Header Right Actions (Desktop & Mobile) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-sky-500/20 relative rounded-full border border-slate-200 dark:border-sky-500/20 bg-white/80 dark:bg-[#07182b]/80 shadow-sm dark:shadow-md transition-all duration-300"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle Theme Mode"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-amber-400 transition-transform duration-300 hover:rotate-45" />
              ) : (
                <Moon className="h-5 w-5 text-sky-500 transition-transform duration-300 hover:-rotate-12" />
              )}
            </Button>

            {!isMobile ? (
              <>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-sky-500/10 relative rounded-full" aria-label="Notifications">
                      <Bell className="h-5 w-5" />
                      {unreadNotifications.length > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-4 ring-white dark:ring-slate-950 animate-pulse" aria-label="Unread notifications" />
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-96 p-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-2xl text-slate-900 dark:text-slate-100 rounded-2xl overflow-hidden" align="end">
                    <NotificationPanel />
                  </PopoverContent>
                </Popover>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2.5 px-3.5 py-2 rounded-full border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/50 hover:bg-sky-50 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 transition-all">
                      <Avatar className="h-8 w-8 ring-2 ring-blue-500/40">
                        <AvatarImage src={getFileUrl(user.profilePicture)} />
                        <AvatarFallback className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs">
                          {user.fullName.split(" ").map(n => n[0]).join("").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-bold font-display tracking-tight text-slate-800 dark:text-white">{user.fullName}</span>
                      <ChevronDown className="h-4 w-4 opacity-60" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-2xl text-slate-900 dark:text-slate-100 rounded-xl p-1.5">
                    <DropdownMenuItem asChild className="hover:bg-sky-50 dark:hover:bg-slate-800/80 focus:bg-sky-50 dark:focus:bg-slate-800/80 text-slate-800 dark:text-slate-200 cursor-pointer rounded-lg font-medium">
                      <Link href="/profile" className="flex items-center gap-2"><User className="h-4 w-4 text-blue-500 dark:text-blue-400" /> Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="hover:bg-sky-50 dark:hover:bg-slate-800/80 focus:bg-sky-50 dark:focus:bg-slate-800/80 text-slate-800 dark:text-slate-200 cursor-pointer rounded-lg font-medium">
                      <Link href="/settings" className="flex items-center gap-2"><Settings className="h-4 w-4 text-indigo-500 dark:text-indigo-400" /> Settings</Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator className="bg-slate-200 dark:bg-white/10" />
                        <DropdownMenuItem asChild className="hover:bg-sky-50 dark:hover:bg-slate-800/80 focus:bg-sky-50 dark:focus:bg-slate-800/80 text-slate-800 dark:text-slate-200 cursor-pointer rounded-lg font-medium">
                          <Link href="/admin" className="flex items-center gap-2"><Shield className="h-4 w-4 text-purple-500 dark:text-purple-400" /> Admin Panel</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator className="bg-slate-200 dark:bg-white/10" />
                    <DropdownMenuItem onClick={handleLogout} className="hover:bg-rose-50 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-300 focus:bg-rose-50 dark:focus:bg-rose-500/20 cursor-pointer rounded-lg flex items-center gap-2 font-medium">
                      <LogOut className="h-4 w-4 text-rose-500 dark:text-rose-400" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setDrawerOpen(true)} 
                className="text-slate-200 hover:bg-sky-500/20 rounded-full border border-sky-500/20 bg-[#07182b]/80 shadow-md"
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6 text-sky-300" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-rose-500 border-2 border-slate-900 animate-pulse" aria-label="Unread notifications" />
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
      {/* Mobile Full-Height Left Sidebar — rendered via portal into document.body */}
      {isMobile && drawerOpen && isMounted && ReactDOM.createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          {/* Sidebar Panel */}
          <div
            className="fixed top-0 left-0 h-screen z-[9999] flex flex-col bg-[#07172b] border-r border-sky-500/20 shadow-2xl shadow-black/50 overflow-hidden"
            style={{ width: "80vw", maxWidth: "320px", animation: "slideInFromLeft 0.25s ease-out" }}
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-sky-500/20 bg-[#061322]">
              <Link href="/dashboard" onClick={() => setDrawerOpen(false)} className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full blur-md opacity-70" />
                  <img src="/investpro.png" alt="InvestPro" className="relative h-9 w-9 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
                </div>
                <span className="text-lg font-extrabold text-white">Invest<span className="text-sky-400">Pro</span></span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setDrawerOpen(false)} className="text-slate-400 hover:text-white hover:bg-sky-500/20 rounded-full h-8 w-8">
                <XCircle className="h-5 w-5" />
              </Button>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-sky-500/15 bg-sky-500/5">
              <Avatar className="h-11 w-11 ring-2 ring-sky-500/40">
                <AvatarImage src={getFileUrl(user.profilePicture)} />
                <AvatarFallback className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm">
                  {user.fullName.split(" ").map(n => n[0]).join("").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="font-bold text-white text-sm truncate">{user.fullName}</div>
                <div className="text-xs text-sky-400/80 truncate">{user.email}</div>
              </div>
            </div>

            {/* Scrollable Nav Links */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">

              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest px-4 pt-1 pb-1">Navigation</p>
              <Link href="/dashboard" onClick={() => setDrawerOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${ isActive("/dashboard") || isActive("/") ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-lg" : "text-slate-300 hover:bg-sky-500/15 hover:text-white" }`}>
                <TrendingUp className="h-4 w-4 shrink-0" /> Dashboard
              </Link>

              {!isAdmin && (
                <>
                  <Link href="/investments" onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${ isActive("/investments") ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-lg" : "text-slate-300 hover:bg-sky-500/15 hover:text-white" }`}>
                    <DollarSign className="h-4 w-4 shrink-0" /> Investments
                  </Link>
                  <Link href="/withdrawals" onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${ isActive("/withdrawals") ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-lg" : "text-slate-300 hover:bg-sky-500/15 hover:text-white" }`}>
                    <CheckCircle className="h-4 w-4 shrink-0" /> Withdrawals
                  </Link>
                  <Link href="/rewards" onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${ isActive("/rewards") ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 shadow-lg" : "text-amber-300 hover:bg-amber-500/15 hover:text-amber-200" }`}>
                    <Gift className="h-4 w-4 shrink-0" /> Rewards
                  </Link>
                </>
              )}

              <Link href="/genealogy" onClick={() => setDrawerOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${ isActive("/genealogy") ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-lg" : "text-slate-300 hover:bg-sky-500/15 hover:text-white" }`}>
                <Network className="h-4 w-4 shrink-0" /> Genealogy
              </Link>

              {isAdmin && (
                <>
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest px-4 pt-4 pb-1">Admin Panel</p>
                  <Link href="/admin" onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${ isActive("/admin") ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg" : "text-slate-300 hover:bg-purple-500/15 hover:text-white" }`}>
                    <Shield className="h-4 w-4 shrink-0 text-purple-400" /> Admin Dashboard
                  </Link>
                  <Link href="/admin/users" onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-300 hover:bg-sky-500/15 hover:text-white transition-all">
                    <Users className="h-4 w-4 shrink-0 text-purple-400" /> User Management
                  </Link>
                  <Link href="/admin/investment-approvals" onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-300 hover:bg-sky-500/15 hover:text-white transition-all">
                    <DollarSign className="h-4 w-4 shrink-0 text-emerald-400" /> Investment Approvals
                  </Link>
                  <Link href="/admin/withdrawal-approvals" onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-300 hover:bg-sky-500/15 hover:text-white transition-all">
                    <CheckCircle className="h-4 w-4 shrink-0 text-teal-400" /> Withdrawal Approvals
                  </Link>
                  <Link href="/admin/rewards" onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-300 hover:bg-sky-500/15 hover:text-white transition-all">
                    <Gift className="h-4 w-4 shrink-0 text-amber-400" /> Rewards Management
                  </Link>
                  <Link href="/admin/logs" onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-300 hover:bg-sky-500/15 hover:text-white transition-all">
                    <FileText className="h-4 w-4 shrink-0 text-slate-400" /> System Logs
                  </Link>
                  <Link href="/admin/database-config" onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-300 hover:bg-sky-500/15 hover:text-white transition-all">
                    <Settings className="h-4 w-4 shrink-0 text-sky-400" /> Database Config
                  </Link>
                  <Link href="/admin/genealogy" onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-300 hover:bg-sky-500/15 hover:text-white transition-all">
                    <Network className="h-4 w-4 shrink-0 text-indigo-400" /> Genealogy Mgmt
                  </Link>
                </>
              )}

              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest px-4 pt-4 pb-1">Account</p>
              <Link href="/profile" onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-300 hover:bg-sky-500/15 hover:text-white transition-all">
                <User className="h-4 w-4 shrink-0 text-blue-400" /> Profile
              </Link>
              <Link href="/settings" onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-300 hover:bg-sky-500/15 hover:text-white transition-all">
                <Settings className="h-4 w-4 shrink-0 text-indigo-400" /> Settings
              </Link>
              {unreadNotifications.length > 0 && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl">
                  <Bell className="h-4 w-4 shrink-0 text-sky-400" />
                  <span className="text-sm font-bold text-slate-300">Notifications</span>
                  <Badge variant="destructive" className="ml-auto h-5 min-w-5 rounded-full px-1 text-xs">
                    {unreadNotifications.length > 9 ? "9+" : unreadNotifications.length}
                  </Badge>
                </div>
              )}
            </div>

            {/* Sidebar Footer — Logout */}
            <div className="px-3 py-3 border-t border-sky-500/15">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-400 hover:bg-rose-500/15 hover:text-rose-300 transition-all"
              >
                <LogOut className="h-4 w-4 shrink-0" /> Logout
              </button>
            </div>
          </div>
        </>
      , document.body)}
    </nav>
  );
}

