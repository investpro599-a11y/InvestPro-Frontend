"use client";

import { useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { SignupForm } from "@/components/auth/signup-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function SignupInner() {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = new URLSearchParams(useSearchParams());
  const referralCode = searchParams.get("ref") || undefined;

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-4 px-4 sm:py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center space-y-4 pb-6 px-6 pt-8">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full mx-auto">
              <img src="/investpro.png" alt="InvestPro Logo" className="h-20 w-20 sm:h-24 sm:w-24 object-contain" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Join InvestPro</h2>
              <p className="text-sm sm:text-base text-gray-600 mt-2">Create your account to start investing</p>
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-8">
            <SignupForm initialReferralCode={referralCode} />
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-600 hover:underline font-medium">
                  Log in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Mobile-specific instructions */}
        <div className="text-center text-xs text-gray-500 px-4">
          <p>Having trouble? Make sure you have a stable internet connection and try again.</p>
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
