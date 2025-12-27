"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import { authApi } from "@/lib/auth";

export default function VerifyEmailPage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      setStatus("pending");
      try {
        const res = await authApi.verifyEmail(params.token);
        setStatus("success");
        setMessage(res.message || "Your email has been verified successfully!");
      } catch (err: any) {
        setStatus("error");
        setMessage(err.message || "Verification failed. The link may have expired or is invalid.");
      }
    };
    verify();
    // eslint-disable-next-line
  }, [params.token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Verify Your Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          {status === "pending" && (
            <>
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
                <svg className="w-6 h-6 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
              </div>
              <p>Verifying your email, please wait...</p>
            </>
          )}
          {status === "success" && (
            <>
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-green-700 font-semibold">{message}</p>
              <Button className="w-full mt-4" onClick={() => router.push("/login")}>Go to Login</Button>
            </>
          )}
          {status === "error" && (
            <>
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <p className="text-red-700 font-semibold">{message}</p>
              <Button className="w-full mt-4" onClick={() => router.push("/signup")}>Go to Signup</Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 