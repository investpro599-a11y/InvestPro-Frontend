"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { usePathname, useRouter } from "next/navigation";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center animated-moving-gradient py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient Lighting Spheres strictly contained */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-float" />
      </div>

      {/* Top right theme toggle */}
      <div className="absolute top-5 right-5 z-20">
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

      <div className="max-w-md w-full space-y-8 relative z-10">
        <Card className="glass-panel border-white/15 p-2 shadow-2xl rounded-3xl">
          <CardHeader className="text-center space-y-4 pt-6">
            <div className="relative inline-flex items-center justify-center mx-auto">
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-75 animate-pulse" />
              <img src="/investpro.png" alt="InvestPro Logo" className="relative h-20 w-20 object-contain" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-3xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white">
                Reset <span className="gradient-text-primary">Password</span>
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Recover access to your InvestPro account</p>
            </div>
          </CardHeader>
          <CardContent className="pb-8">
            <ForgotPasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
