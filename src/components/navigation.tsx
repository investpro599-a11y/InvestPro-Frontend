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
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/hooks/use-auth";
import { useAppMode } from "@/hooks/use-app-mode";
import { useQuery } from "@tanstack/react-query";
import { notificationApi } from "@/lib";
import { getFileUrl } from "@/lib/utils";
import {
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Shield,
  Users,
  Network,
  TrendingUp,
  DollarSign,
  CheckCircle,
  XCircle,
  Menu,
  Gift,
  Building2,
  Sun,
  Moon,
  ArrowLeftRight,
  Wallet,
  Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { NotificationPanel } from "@/components/notifications/notification-panel";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import React, { useEffect, useState, Suspense } from "react";
import ReactDOM from "react-dom";
import { useTheme } from "@/components/theme-provider";

function NavigationContent() {
  const { user, logout, isAdmin } = useAuth();
  const location = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const [isMounted, setIsMounted] = useState(false);

  const { mode, isPropertyMode, isRegularMode, switchMode, openSelectModeModal } = useAppMode();
  const activeTabParam = searchParams?.get("tab") || "marketplace";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const { data: unreadNotifications = [] } = useQuery({
    queryKey: ["notifications/unread"],
    queryFn: notificationApi.getUnread,
    enabled: !!user,
    retry: false,
  });

  const isActive = (path: string) => location === path;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (!user) return null;

  return (
    <nav className="glass-nav sticky top-0 z-50 transition-all duration-300 shadow-md dark:shadow-2xl bg-white/95 dark:bg-[#061322]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-sky-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo & Ecosystem Badge */}
          <div className="flex items-center gap-4 lg:gap-6">
            <Link
              href={isPropertyMode ? "/flats" : "/dashboard"}
              className="flex items-center gap-3 group focus:outline-none rounded-xl transition-transform hover:scale-[1.02]"
            >
              <div className="relative">
                <div className={`absolute -inset-1 rounded-full blur-md opacity-85 group-hover:opacity-100 transition duration-300 ${
                  isPropertyMode ? "bg-gradient-to-r from-indigo-500 to-purple-500" : "bg-gradient-to-r from-sky-500 to-indigo-500"
                }`} />
                <img src="/investpro.png" alt="InvestPro Logo" className="relative h-11 w-11 object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white leading-none">
                  Invest<span className={isPropertyMode ? "text-indigo-400" : "text-sky-500"}>Pro</span>
                </span>
                {isPropertyMode && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 mt-0.5">
                    Property App
                  </span>
                )}
              </div>
            </Link>

            {/* Track indicator badge on tablet/desktop */}
            <div className="hidden sm:flex items-center">
              {isPropertyMode ? (
                <Badge className="bg-indigo-500/15 text-indigo-400 dark:text-indigo-300 border border-indigo-400/30 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5 shadow-sm">
                  <Building2 className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Real Estate & Flats</span>
                </Badge>
              ) : (
                <Badge className="bg-sky-500/15 text-sky-500 dark:text-sky-300 border border-sky-400/30 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5 shadow-sm">
                  <TrendingUp className="h-3.5 w-3.5 text-sky-400" />
                  <span>Daily Yields & ROI</span>
                </Badge>
              )}
            </div>

            {/* Desktop Nav Pills: COMPLETELY SEPARATED PER APP */}
            {!isMobile && (
              <div className="hidden md:flex gap-1.5 bg-slate-100/90 dark:bg-[#091a2e]/90 backdrop-blur-xl border border-slate-200/80 dark:border-sky-500/25 rounded-full p-1.5 shadow-inner">
                {isPropertyMode ? (
                  /* ================= PROPERTY INVESTMENT APP NAV ================= */
                  <>
                    <Link
                      href="/flats?tab=marketplace"
                      className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 flex items-center gap-1.5 ${
                        isActive("/flats") && activeTabParam === "marketplace"
                          ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-indigo-500/30"
                          : "text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-indigo-500/15"
                      }`}
                    >
                      <Building2 className="h-4 w-4" />
                      <span>Flats Marketplace</span>
                    </Link>

                    <Link
                      href="/flats?tab=wallet"
                      className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 flex items-center gap-1.5 ${
                        isActive("/flats") && activeTabParam === "wallet"
                          ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-indigo-500/30"
                          : "text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-indigo-500/15"
                      }`}
                    >
                      <Wallet className="h-4 w-4" />
                      <span>Rental Portfolio & Wallet</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/flats?tab=admin"
                        className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 flex items-center gap-1.5 ${
                          isActive("/flats") && activeTabParam === "admin"
                            ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30"
                            : "text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-purple-500/15"
                        }`}
                      >
                        <Shield className="h-4 w-4 text-purple-400" />
                        <span>Property Admin Desk</span>
                      </Link>
                    )}
                  </>
                ) : (
                  /* ================= REGULAR INVESTMENT APP NAV ================= */
                  <>
                    <Link
                      href="/dashboard"
                      className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                        isActive("/dashboard") || isActive("/")
                          ? "bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 text-white shadow-lg shadow-sky-500/30"
                          : "text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-sky-500/15"
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
                              ? "bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 text-white shadow-lg shadow-sky-500/30"
                              : "text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-sky-500/15"
                          }`}
                        >
                          Investments
                        </Link>
                        <Link
                          href="/withdrawals"
                          className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                            isActive("/withdrawals")
                              ? "bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 text-white shadow-lg shadow-sky-500/30"
                              : "text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-sky-500/15"
                          }`}
                        >
                          Withdrawals
                        </Link>
                        <Link
                          href="/rewards"
                          className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 flex items-center gap-1.5 ${
                            isActive("/rewards")
                              ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold shadow-lg shadow-amber-500/30"
                              : "text-amber-600 dark:text-amber-300 hover:text-amber-700 dark:hover:text-amber-200 hover:bg-amber-100/50 dark:hover:bg-white/10"
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
                          ? "bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 text-white shadow-lg shadow-sky-500/30"
                          : "text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-sky-500/15"
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
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Header Right Actions (Desktop & Mobile) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Portal Switcher Button */}
            {isPropertyMode ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => switchMode("regular")}
                className="hidden md:inline-flex items-center gap-2 rounded-full text-xs font-bold bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-300 border-sky-400/30 hover:border-sky-400/60 shadow-sm transition-all py-1.5 px-3.5"
                title="Switch to Regular Investment Track"
              >
                <TrendingUp className="h-3.5 w-3.5 text-sky-400" />
                <span className="hidden xl:inline">Switch to Regular App</span>
                <span className="xl:hidden">Regular App</span>
                <ArrowLeftRight className="h-3 w-3 text-sky-400/70" />
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => switchMode("property")}
                className="hidden md:inline-flex items-center gap-2 rounded-full text-xs font-bold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border-indigo-400/30 hover:border-indigo-400/60 shadow-sm transition-all py-1.5 px-3.5"
                title="Switch to Property Investment Track"
              >
                <Building2 className="h-3.5 w-3.5 text-indigo-400" />
                <span className="hidden xl:inline">Switch to Property App</span>
                <span className="xl:hidden">Property App</span>
                <ArrowLeftRight className="h-3 w-3 text-indigo-400/70" />
              </Button>
            )}

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

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-2.5">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-sky-500/10 relative rounded-full" aria-label="Notifications">
                    <Bell className="h-5 w-5" />
                    {unreadNotifications.length > 0 && (
                      <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-4 ring-white dark:ring-slate-950 animate-pulse" aria-label="Unread notifications" />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[calc(100vw-2rem)] max-w-sm p-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-2xl text-slate-900 dark:text-slate-100 rounded-2xl overflow-hidden" align="end">
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

                  <DropdownMenuSeparator className="bg-slate-200 dark:bg-white/10" />

                  {/* Switch App Mode directly */}
                  {isPropertyMode ? (
                    <DropdownMenuItem
                      onClick={() => switchMode("regular")}
                      className="hover:bg-sky-50 dark:hover:bg-slate-800/80 focus:bg-sky-50 dark:focus:bg-slate-800/80 text-slate-800 dark:text-slate-200 cursor-pointer rounded-lg font-medium flex items-center gap-2"
                    >
                      <TrendingUp className="h-4 w-4 text-sky-500 dark:text-sky-400" /> Switch to Regular App
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={() => switchMode("property")}
                      className="hover:bg-indigo-50 dark:hover:bg-slate-800/80 focus:bg-indigo-50 dark:focus:bg-slate-800/80 text-slate-800 dark:text-slate-200 cursor-pointer rounded-lg font-medium flex items-center gap-2"
                    >
                      <Building2 className="h-4 w-4 text-indigo-500 dark:text-indigo-400" /> Switch to Property App
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem
                    onClick={openSelectModeModal}
                    className="hover:bg-sky-50 dark:hover:bg-slate-800/80 focus:bg-sky-50 dark:focus:bg-slate-800/80 text-slate-800 dark:text-slate-200 cursor-pointer rounded-lg font-medium flex items-center gap-2"
                  >
                    <ArrowLeftRight className="h-4 w-4 text-purple-500 dark:text-purple-400" /> Choose Investment Track
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
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex md:hidden">
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
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Glass Sidebar Drawer — rendered via portal into document.body */}
      {isMobile && drawerOpen && isMounted && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9998] flex">
          {/* Glass Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Glass Drawer Panel */}
          <div
            className="relative z-[9999] w-[82vw] max-w-[340px] h-[100dvh] flex flex-col bg-[#07172b]/95 [html.light_&]:bg-white/95 backdrop-blur-2xl border-r border-sky-500/20 [html.light_&]:border-slate-200/80 shadow-2xl shadow-black/60 overflow-hidden"
            style={{ animation: "slideInFromLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1)" }}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-sky-500/15 [html.light_&]:border-slate-200/70 bg-[#061322]/80 [html.light_&]:bg-slate-50/80 backdrop-blur-xl shrink-0">
              <Link
                href={isPropertyMode ? "/flats" : "/dashboard"}
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-2.5"
              >
                <div className="relative">
                  <div className={`absolute -inset-1 rounded-full blur-md opacity-70 ${
                    isPropertyMode ? "bg-gradient-to-r from-indigo-500 to-purple-500" : "bg-gradient-to-r from-sky-500 to-indigo-500"
                  }`} />
                  <img src="/investpro.png" alt="InvestPro" className="relative h-9 w-9 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
                <div>
                  <span className="text-xl font-extrabold tracking-tight text-white [html.light_&]:text-slate-900 block leading-none">
                    Invest<span className={isPropertyMode ? "text-indigo-400" : "text-sky-400"}>Pro</span>
                  </span>
                  {isPropertyMode && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Property App
                    </span>
                  )}
                </div>
              </Link>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="text-slate-300 [html.light_&]:text-slate-700 hover:text-white [html.light_&]:hover:text-slate-900 hover:bg-sky-500/20 rounded-full border border-sky-500/20 [html.light_&]:border-slate-300 bg-[#07182b]/80 [html.light_&]:bg-white h-8 w-8 shadow-sm"
                  title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                  aria-label="Toggle Theme Mode"
                >
                  {isDarkMode ? (
                    <Sun className="h-4 w-4 text-amber-400" />
                  ) : (
                    <Moon className="h-4 w-4 text-sky-500" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDrawerOpen(false)}
                  className="text-slate-400 hover:text-white [html.light_&]:text-slate-600 [html.light_&]:hover:text-slate-900 hover:bg-sky-500/20 [html.light_&]:hover:bg-slate-200 rounded-full h-8 w-8"
                  aria-label="Close menu"
                >
                  <XCircle className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* User Info Card */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-sky-500/15 [html.light_&]:border-slate-200/70 bg-sky-500/5 [html.light_&]:bg-sky-50/60 shrink-0">
              <Avatar className="h-11 w-11 ring-2 ring-sky-500/40 shadow-sm">
                <AvatarImage src={getFileUrl(user.profilePicture)} />
                <AvatarFallback className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm">
                  {user.fullName.split(" ").map(n => n[0]).join("").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white [html.light_&]:text-slate-900 text-sm truncate">{user.fullName}</span>
                  {isAdmin && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-purple-400 text-purple-300 [html.light_&]:text-purple-700 bg-purple-500/10">
                      Admin
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-sky-400 [html.light_&]:text-sky-600 truncate">{user.email}</div>
              </div>
            </div>

            {/* Scrollable Nav Links: STRICTLY SEPARATED PER APP */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
              {isPropertyMode ? (
                /* ================= MOBILE PROPERTY APP LINKS ================= */
                <>
                  <div className="px-3 pt-2 pb-1 flex items-center justify-between">
                    <p className="text-[10px] uppercase font-bold text-indigo-400 [html.light_&]:text-indigo-600 tracking-widest">
                      Property Investment
                    </p>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-indigo-400 text-indigo-400">
                      Flats & Units
                    </Badge>
                  </div>

                  <Link
                    href="/flats?tab=marketplace"
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                      isActive("/flats") && activeTabParam === "marketplace"
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25"
                        : "text-slate-300 [html.light_&]:text-slate-700 hover:bg-indigo-500/15 [html.light_&]:hover:bg-slate-100 hover:text-white"
                    }`}
                  >
                    <Building2 className="h-4 w-4 shrink-0 text-indigo-400" />
                    <span>Flats Marketplace</span>
                  </Link>

                  <Link
                    href="/flats?tab=wallet"
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                      isActive("/flats") && activeTabParam === "wallet"
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25"
                        : "text-slate-300 [html.light_&]:text-slate-700 hover:bg-indigo-500/15 [html.light_&]:hover:bg-slate-100 hover:text-white"
                    }`}
                  >
                    <Wallet className="h-4 w-4 shrink-0 text-emerald-400" />
                    <span>Rental Portfolio & Wallet</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      href="/flats?tab=admin"
                      onClick={() => setDrawerOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                        isActive("/flats") && activeTabParam === "admin"
                          ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25"
                          : "text-slate-300 [html.light_&]:text-slate-700 hover:bg-purple-500/15 [html.light_&]:hover:bg-slate-100 hover:text-white"
                      }`}
                    >
                      <Shield className="h-4 w-4 shrink-0 text-purple-400" />
                      <span>Property Admin Desk</span>
                    </Link>
                  )}

                  {/* Switch to Regular App Card */}
                  <div className="pt-3 pb-2 px-1">
                    <button
                      onClick={() => {
                        setDrawerOpen(false);
                        switchMode("regular");
                      }}
                      className="w-full p-3 rounded-2xl bg-gradient-to-br from-sky-500/15 via-blue-500/10 to-transparent border border-sky-400/30 text-left hover:scale-[1.01] transition-transform duration-200"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-400">
                          Switch Ecosystem
                        </span>
                        <ArrowLeftRight className="h-3.5 w-3.5 text-sky-400" />
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-xl bg-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                          <TrendingUp className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white [html.light_&]:text-slate-900">
                            Regular Investment App
                          </div>
                          <div className="text-[10px] text-slate-400 [html.light_&]:text-slate-500">
                            Daily ROI, Staking & Withdrawals
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                </>
              ) : (
                /* ================= MOBILE REGULAR APP LINKS ================= */
                <>
                  <div className="px-3 pt-2 pb-1 flex items-center justify-between">
                    <p className="text-[10px] uppercase font-bold text-sky-400 [html.light_&]:text-sky-600 tracking-widest">
                      Regular Investment
                    </p>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-sky-400 text-sky-400">
                      Daily ROI
                    </Badge>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                      isActive("/dashboard") || isActive("/")
                        ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-lg shadow-sky-500/25"
                        : "text-slate-300 [html.light_&]:text-slate-700 hover:bg-sky-500/15 [html.light_&]:hover:bg-slate-100 hover:text-white"
                    }`}
                  >
                    <TrendingUp className="h-4 w-4 shrink-0" />
                    <span>Dashboard</span>
                  </Link>

                  {!isAdmin && (
                    <>
                      <Link
                        href="/investments"
                        onClick={() => setDrawerOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                          isActive("/investments")
                            ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-lg shadow-sky-500/25"
                            : "text-slate-300 [html.light_&]:text-slate-700 hover:bg-sky-500/15 [html.light_&]:hover:bg-slate-100 hover:text-white"
                        }`}
                      >
                        <DollarSign className="h-4 w-4 shrink-0" />
                        <span>Investments</span>
                      </Link>
                      <Link
                        href="/withdrawals"
                        onClick={() => setDrawerOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                          isActive("/withdrawals")
                            ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-lg shadow-sky-500/25"
                            : "text-slate-300 [html.light_&]:text-slate-700 hover:bg-sky-500/15 [html.light_&]:hover:bg-slate-100 hover:text-white"
                        }`}
                      >
                        <CheckCircle className="h-4 w-4 shrink-0" />
                        <span>Withdrawals</span>
                      </Link>
                      <Link
                        href="/rewards"
                        onClick={() => setDrawerOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                          isActive("/rewards")
                            ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold shadow-lg shadow-amber-500/25"
                            : "text-amber-300 [html.light_&]:text-amber-700 hover:bg-amber-500/15 [html.light_&]:hover:bg-amber-50 hover:text-amber-200"
                        }`}
                      >
                        <Gift className="h-4 w-4 shrink-0" />
                        <span>Rewards</span>
                      </Link>
                    </>
                  )}

                  <Link
                    href="/genealogy"
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                      isActive("/genealogy")
                        ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-lg shadow-sky-500/25"
                        : "text-slate-300 [html.light_&]:text-slate-700 hover:bg-sky-500/15 [html.light_&]:hover:bg-slate-100 hover:text-white"
                    }`}
                  >
                    <Network className="h-4 w-4 shrink-0" />
                    <span>Genealogy</span>
                  </Link>

                  {isAdmin && (
                    <>
                      <p className="text-[10px] uppercase font-bold text-slate-400 [html.light_&]:text-slate-500 tracking-widest px-3 pt-4 pb-1">Admin Panel</p>
                      <Link
                        href="/admin"
                        onClick={() => setDrawerOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                          isActive("/admin")
                            ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25"
                            : "text-slate-300 [html.light_&]:text-slate-700 hover:bg-purple-500/15 [html.light_&]:hover:bg-slate-100 hover:text-white"
                        }`}
                      >
                        <Shield className="h-4 w-4 shrink-0 text-purple-400" />
                        <span>Admin Dashboard</span>
                      </Link>
                      <Link
                        href="/admin/users"
                        onClick={() => setDrawerOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-300 [html.light_&]:text-slate-700 hover:bg-sky-500/15 [html.light_&]:hover:bg-slate-100 hover:text-white transition-all"
                      >
                        <Users className="h-4 w-4 shrink-0 text-purple-400" />
                        <span>User Management</span>
                      </Link>
                      <Link
                        href="/admin/investment-approvals"
                        onClick={() => setDrawerOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-300 [html.light_&]:text-slate-700 hover:bg-sky-500/15 [html.light_&]:hover:bg-slate-100 hover:text-white transition-all"
                      >
                        <DollarSign className="h-4 w-4 shrink-0 text-emerald-400" />
                        <span>Investment Approvals</span>
                      </Link>
                      <Link
                        href="/admin/withdrawal-approvals"
                        onClick={() => setDrawerOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-300 [html.light_&]:text-slate-700 hover:bg-sky-500/15 [html.light_&]:hover:bg-slate-100 hover:text-white transition-all"
                      >
                        <CheckCircle className="h-4 w-4 shrink-0 text-teal-400" />
                        <span>Withdrawal Approvals</span>
                      </Link>
                    </>
                  )}

                  {/* Switch to Property App Card */}
                  <div className="pt-3 pb-2 px-1">
                    <button
                      onClick={() => {
                        setDrawerOpen(false);
                        switchMode("property");
                      }}
                      className="w-full p-3 rounded-2xl bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-transparent border border-indigo-400/30 text-left hover:scale-[1.01] transition-transform duration-200"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400">
                          Switch Ecosystem
                        </span>
                        <ArrowLeftRight className="h-3.5 w-3.5 text-indigo-400" />
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white [html.light_&]:text-slate-900">
                            Property Investment App
                          </div>
                          <div className="text-[10px] text-slate-400 [html.light_&]:text-slate-500">
                            Luxury flats & rental returns
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                </>
              )}

              {/* Shared Account Section */}
              <p className="text-[10px] uppercase font-bold text-slate-400 [html.light_&]:text-slate-500 tracking-widest px-3 pt-4 pb-1">
                Account & Preferences
              </p>
              <Link
                href="/profile"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-300 [html.light_&]:text-slate-700 hover:bg-sky-500/15 [html.light_&]:hover:bg-slate-100 hover:text-white transition-all"
              >
                <User className="h-4 w-4 shrink-0 text-blue-400" />
                <span>Profile</span>
              </Link>
              <Link
                href="/settings"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-300 [html.light_&]:text-slate-700 hover:bg-sky-500/15 [html.light_&]:hover:bg-slate-100 hover:text-white transition-all"
              >
                <Settings className="h-4 w-4 shrink-0 text-indigo-400" />
                <span>Settings</span>
              </Link>

              <button
                onClick={() => {
                  setDrawerOpen(false);
                  openSelectModeModal();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-300 [html.light_&]:text-slate-700 hover:bg-sky-500/15 [html.light_&]:hover:bg-slate-100 hover:text-white transition-all text-left"
              >
                <ArrowLeftRight className="h-4 w-4 shrink-0 text-purple-400" />
                <span>Choose Investment Track</span>
              </button>
            </div>

            {/* Footer — Logout */}
            <div className="px-4 py-3.5 border-t border-sky-500/15 [html.light_&]:border-slate-200/70 bg-[#061322]/80 [html.light_&]:bg-slate-50/80 backdrop-blur-xl shrink-0 pb-safe">
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold text-rose-400 [html.light_&]:text-rose-600 bg-rose-500/10 hover:bg-rose-500/20 [html.light_&]:bg-rose-50 [html.light_&]:hover:bg-rose-100 border border-rose-500/20 [html.light_&]:border-rose-200 transition-all"
              >
                <LogOut className="h-4 w-4 shrink-0" /> Logout
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </nav>
  );
}

export function Navigation() {
  return (
    <Suspense fallback={null}>
      <NavigationContent />
    </Suspense>
  );
}
