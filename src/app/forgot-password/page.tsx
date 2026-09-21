"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { usePathname, useRouter } from "next/navigation";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AuthPitch } from "@/components/auth/auth-pitch";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Sun, Moon, ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center animated-moving-gradient py-8 px-4 sm:px-6 lg:px-12 relative overflow-hidden">
      {/* Ambient Lighting Spheres strictly contained */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-float" />
      </div>

      {/* Top right theme toggle */}
      <div className="absolute top-5 right-5 sm:right-8 z-20 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-sky-500/20 rounded-full border border-slate-200 dark:border-sky-500/20 bg-white/80 dark:bg-[#07182b]/80 shadow-md backdrop-blur-md transition-all duration-300"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle Theme Mode"
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5 text-amber-400 transition-transform duration-300 hover:rotate-45" />
          ) : (
            <Moon className="h-5 w-5 text-sky-500 transition-transform duration-300 hover:-rotate-12" />
          )}
        </Button>
      </div>

      {/* Main Container: Centered on mobile, Split Grid on desktop */}
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start relative z-10 pt-2 sm:pt-4 lg:pt-6">
        {/* Left Column: Brand & Feature Value Propositions (Desktop Only) */}
        <div className="hidden lg:block lg:col-span-7 pt-1">
          <AuthPitch />
        </div>

        {/* Right Column: Forgot Password Auth Box (Centered on mobile) */}
        <div className="w-full max-w-md mx-auto lg:col-span-5">
          <Card className="glass-panel border-slate-200/80 dark:border-white/15 p-2 sm:p-3 shadow-2xl rounded-3xl bg-white/95 dark:bg-[#0c1e34]/90">
            <CardHeader className="text-center lg:text-left space-y-3 pt-6 pb-2 px-6">
              {/* Mobile Header: Centered Glowing Logo & Brand Title */}
              <div className="lg:hidden flex flex-col items-center justify-center space-y-3">
                <div className="relative inline-flex items-center justify-center">
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-75 animate-pulse" />
                  <img src="/investpro.png" alt="InvestPro Logo" className="relative h-16 w-16 object-contain" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white">
                    Reset <span className="gradient-text-primary">Password</span>
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">
                    Recover access to your InvestPro account
                  </p>
                </div>
              </div>

              {/* Desktop Header */}
              <div className="hidden lg:block space-y-3">
                <Link 
                  href="/login" 
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors w-fit mb-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                </Link>

                <div className="space-y-1 pt-2">
                  <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-slate-900 dark:text-white">
                    Reset Password
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">
                    Recover access to your InvestPro account
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pb-8 px-6">
              <ForgotPasswordForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 
