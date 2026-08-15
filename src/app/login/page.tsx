"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Login() {
  const { isAuthenticated, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "admin") {
        router.push("/admin");
      } else {
      router.push("/dashboard");
      }
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient Lighting Spheres */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-glow" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none -z-10 animate-float" />

      <div className="max-w-md w-full space-y-8 relative z-10">
        <Card className="glass-panel border-white/15 p-2 shadow-2xl rounded-3xl">
          <CardHeader className="text-center space-y-4 pt-6">
            <div className="relative inline-flex items-center justify-center mx-auto">
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-75 animate-pulse" />
              <img src="/investpro.png" alt="InvestPro Logo" className="relative h-20 w-20 object-contain" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-3xl font-extrabold font-display tracking-tight text-white">
                Welcome to <span className="gradient-text-primary">InvestPro</span>
              </h2>
              <p className="text-slate-400 text-sm font-medium">Sign in to access your investment portal</p>
            </div>
          </CardHeader>
          <CardContent className="pb-8">
            <LoginForm />
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-400">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-blue-400 font-semibold hover:text-blue-300 hover:underline transition-colors">
                  Create an account
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}