"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { usePathname, useRouter } from "next/navigation";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { ChartLine } from "lucide-react";

export default function ForgotPassword() {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4">
            <ChartLine className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">InvestPro</h2>
          <p className="text-gray-600 mt-2">Reset your password</p>
        </div>
        
        <ForgotPasswordForm />
      </div>
    </div>
  );
} 
