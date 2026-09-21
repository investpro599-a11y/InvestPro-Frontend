"use client";

import { useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { SignupForm } from "@/components/auth/signup-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AuthPitch } from "@/components/auth/auth-pitch";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Sun, Moon, ArrowLeft } from "lucide-react";

function SignupInner() {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = new URLSearchParams(useSearchParams());
  const referralCode = searchParams.get("ref") || undefined;
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center animated-moving-gradient py-8 px-4 sm:px-6 lg:px-12 relative overflow-hidden">
      {/* Ambient Lighting Spheres strictly contained */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl animate-float" />
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

        {/* Right Column: Signup Auth Box (Centered on mobile) */}
        <div className="w-full max-w-md mx-auto lg:col-span-5">
          <Card className="glass-panel border-slate-200/80 dark:border-white/15 p-2 sm:p-3 shadow-2xl rounded-3xl bg-white/95 dark:bg-[#0c1e34]/90">
            <CardHeader className="text-center lg:text-left space-y-3 pt-6 pb-2 px-6">
              {/* Mobile Header: Centered Glowing Logo & Brand Title */}
              <div className="lg:hidden flex flex-col items-center justify-center space-y-3">
                <div className="relative inline-flex items-center justify-center">
                  <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full blur-lg opacity-75 animate-pulse" />
                  <img src="/investpro.png" alt="InvestPro Logo" className="relative h-16 w-16 object-contain" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white">
                    Join <span className="gradient-text-primary">InvestPro</span>
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">
                    Create your secure account to start investing
                  </p>
                </div>
              </div>

              {/* Desktop Header: Navigation, Switcher Tabs, and Title */}
              <div className="hidden lg:block space-y-3">
                <Link 
                  href="/" 
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors w-fit mb-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </Link>

                <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-[#07182b] rounded-2xl border border-slate-200 dark:border-sky-500/20 shadow-inner">
                  <Link
                    href="/login"
                    className="py-2.5 text-center text-xs sm:text-sm font-extrabold rounded-xl transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="py-2.5 text-center text-xs sm:text-sm font-extrabold rounded-xl transition-all bg-white dark:bg-sky-600 text-slate-900 dark:text-white shadow-sm"
                  >
                    Register
                  </Link>
                </div>

                <div className="space-y-1 pt-2">
                  <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-slate-900 dark:text-white">
                    Join InvestPro
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">
                    Create your secure account to start investing
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pb-8 px-6">
              <SignupForm initialReferralCode={referralCode} />
              <div className="mt-6 text-center">
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Already have an account?{' '}
                  <Link href="/login" className="text-sky-600 dark:text-sky-400 font-bold hover:underline transition-colors">
                    Log in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function Signup() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    }>
      <SignupInner />
    </Suspense>
  );
}
