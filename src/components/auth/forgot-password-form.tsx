"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Key, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/auth";

type Step = 'email' | 'otp' | 'password' | 'success';

export function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [enteredOtp, setEnteredOtp] = useState("");

  const emailForm = useForm();
  const resetForm = useForm();

  const otpForm = useForm();
  const handleVerifyOtp = async (data: any) => {
    if (!data.otp || data.otp.length < 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    setEnteredOtp(data.otp);
    setStep('password');
    setError('');
    setSuccess('');
  };

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleRequestReset = async (data: any) => {
    setError('');
    setSuccess('');
    try {
      await authApi.forgotPassword(data.email);
      setEmail(data.email);
      setStep('otp');
      setResendCountdown(60);
      setSuccess('Password reset OTP sent to your email.');
    } catch (error: any) {
      setError(error.message || "Failed to send reset OTP");
    }
  };

  const handleResetPassword = async (data: any) => {
    setError('');
    setSuccess('');
    try {
      if (data.newPassword !== data.confirmPassword) {
        throw new Error("Passwords do not match");
      }
      await authApi.resetPassword({
        email,
        otp: enteredOtp,
        newPassword: data.newPassword,
      });
      setStep('success');
      setSuccess('Password reset successfully! You can now login with your new password.');
    } catch (error: any) {
      setError(error.message || "Failed to reset password");
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    setError('');
    setSuccess('');
    try {
      await authApi.forgotPassword(email);
      setSuccess("OTP resent to your email.");
      setResendCountdown(60); // Reset countdown
    } catch (error: any) {
      setError(error.message || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/login');
  };

  if (step === 'success') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Key className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-xl">Password Reset Successful!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600">
            Your password has been reset successfully. You can now login with your new password.
          </p>
          <Button onClick={handleBackToLogin} className="w-full">
            Back to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  
  if (step === 'otp') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Enter OTP</CardTitle>
          <p className="text-sm text-gray-600">Enter the OTP sent to {email}.</p>
        </CardHeader>
        <CardContent>
          <Form {...otpForm}>
            <form onSubmit={otpForm.handleSubmit(handleVerifyOtp)} className="space-y-4">
              <FormField
                control={otpForm.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OTP Code</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="6-digit code" maxLength={6} autoComplete="one-time-code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && <div className="text-red-600 text-sm text-center">{error}</div>}
              {success && <div className="text-green-600 text-sm text-center">{success}</div>}
              
              <Button type="submit" className="w-full">
                Verify OTP
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={handleResendOtp}
                  disabled={resendLoading || resendCountdown > 0}
                  className="text-sm"
                >
                  {resendCountdown > 0 ? `Resend OTP in ${resendCountdown}s` : "Resend OTP"}
                </Button>
              </div>

              <div className="text-center mt-2">
                <Button variant="link" onClick={() => setStep('email')} className="text-sm flex items-center space-x-1 mx-auto">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }

  if (step === 'password') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Reset Password</CardTitle>
          <p className="text-sm text-gray-600">Enter the OTP sent to {email} and your new password.</p>
        </CardHeader>
        <CardContent>
          <Form {...resetForm}>
            <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-4">
              <FormField
                control={resetForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter new password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={resetForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirm new password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && <div className="text-red-600 text-sm text-center">{error}</div>}
              {success && <div className="text-green-600 text-sm text-center">{success}</div>}
              
              <Button type="submit" className="w-full" disabled={resetForm.formState.isSubmitting}>
                {resetForm.formState.isSubmitting ? 'Resetting...' : 'Reset Password'}
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={handleResendOtp}
                  disabled={resendLoading || resendCountdown > 0}
                  className="text-sm"
                >
                  {resendCountdown > 0 ? `Resend OTP in ${resendCountdown}s` : "Resend OTP"}
                </Button>
              </div>

              <div className="text-center mt-2">
                <Button variant="link" onClick={() => setStep('email')} className="text-sm flex items-center space-x-1 mx-auto">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Lock className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle className="text-xl">Forgot Password?</CardTitle>
        <p className="text-sm text-gray-600">
          Enter your email address and we'll send you an OTP to reset your password.
        </p>
      </CardHeader>
      <CardContent>
        <Form {...emailForm}>
          <form onSubmit={emailForm.handleSubmit(handleRequestReset)} className="space-y-4">
            <FormField
              control={emailForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && <div className="text-red-600 text-sm text-center">{error}</div>}
            {success && <div className="text-green-600 text-sm text-center">{success}</div>}

            <Button type="submit" className="w-full" disabled={emailForm.formState.isSubmitting}>
              {emailForm.formState.isSubmitting ? "Sending..." : "Send Reset Code"}
            </Button>

            <div className="text-center">
              <Button
                variant="link"
                onClick={handleBackToLogin}
                className="text-sm flex items-center space-x-1 mx-auto"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Login</span>
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}