"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, Lock, Key } from "lucide-react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/auth";
import { SecurityQuestion } from "../../../shared/schema";

type Step = 'choice' | 'email' | 'security' | 'reset' | 'success';

const isClient = typeof window !== 'undefined';

export function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('choice');
  const [method, setMethod] = useState<'email' | 'security' | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [securityQuestions, setSecurityQuestions] = useState<SecurityQuestion[]>([]);
  const [securityAnswers, setSecurityAnswers] = useState<string[]>(['', '', '']);
  const [securityError, setSecurityError] = useState('');

  const emailForm = useForm();

  const resetForm = useForm();

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
      const result = await authApi.requestPasswordReset(data);
      setUserId(result.userId ?? null);
      setEmail(data.email);
      if (result.userId) {
        const questions = await authApi.getSecurityQuestions(result.userId);
        setSecurityQuestions(questions);
      }
      setStep('security');
      setResendCountdown(60); // Start 60 second countdown
      setSuccess('Password reset OTP sent to your email.');
    } catch (error: any) {
      setError(error.message || "Failed to send reset OTP");
    }
  };

  const handleResetPassword = async (data: any) => {
    setError('');
    setSuccess('');
    try {
      await authApi.resetPassword({
        ...data,
        userId: userId!,
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
      if (!userId) return;
      await authApi.resendPasswordResetOtp(userId);
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

  if (step === 'choice') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Forgot Password?</CardTitle>
          <p className="text-sm text-gray-600">How would you like to reset your password?</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full" onClick={() => { setMethod('email'); setStep('email'); }}>Send Reset Link to Email</Button>
          <Button className="w-full" variant="outline" onClick={() => { setMethod('security'); setStep('security'); }}>Answer Security Questions</Button>
          <div className="text-center mt-2">
            <Button variant="link" onClick={handleBackToLogin} className="text-sm flex items-center space-x-1 mx-auto">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Login</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'email') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Reset via Email</CardTitle>
          <p className="text-sm text-gray-600">Enter your email address to receive a reset link.</p>
        </CardHeader>
        <CardContent>
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(async (data: any) => {
              setError('');
              setSuccess('');
              try {
                await authApi.requestPasswordReset({ ...data, method: 'email' });
                setSuccess('If your email is registered, a reset link has been sent.');
                setStep('success');
              } catch (error: any) {
                setError(error.message || 'Failed to send reset link');
              }
            })} className="space-y-4">
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter your email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && <div className="text-red-600 text-sm text-center">{error}</div>}
              {success && <div className="text-green-600 text-sm text-center">{success}</div>}
              <Button type="submit" className="w-full" disabled={emailForm.formState.isSubmitting}>
                {emailForm.formState.isSubmitting ? 'Sending...' : 'Send Reset Link'}
              </Button>
              <div className="text-center mt-2">
                <Button variant="link" onClick={() => setStep('choice')} className="text-sm flex items-center space-x-1 mx-auto">
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

  if (step === 'security') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Reset via Security Questions</CardTitle>
          <p className="text-sm text-gray-600">Enter your email to answer your security questions.</p>
        </CardHeader>
        <CardContent>
          {!securityQuestions.length ? (
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(async (data: any) => {
                setError('');
                setSuccess('');
                try {
                  // Find user by email, get userId (API to be implemented)
                  const userId = await authApi.getUserIdByEmail(data.email);
                  setUserId(userId);
                  const questions = await authApi.getSecurityQuestions(userId);
                  setSecurityQuestions(questions);
                } catch (error: any) {
                  setError(error.message || 'Failed to find user or questions');
                }
              })} className="space-y-4">
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter your email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {error && <div className="text-red-600 text-sm text-center">{error}</div>}
                <Button type="submit" className="w-full" disabled={emailForm.formState.isSubmitting}>
                  {emailForm.formState.isSubmitting ? 'Finding...' : 'Continue'}
                </Button>
                <div className="text-center mt-2">
                  <Button variant="link" onClick={() => setStep('choice')} className="text-sm flex items-center space-x-1 mx-auto">
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back</span>
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <form onSubmit={async e => {
              e.preventDefault();
              setSecurityError('');
              try {
                await authApi.verifySecurityAnswers(userId!, securityAnswers);
                setStep('reset');
              } catch (err: any) {
                setSecurityError(err.message || 'Incorrect answers.');
              }
            }} className="space-y-4">
              {securityQuestions.map((q, idx) => (
                <div key={idx} className="mb-2">
                  <label className="block font-semibold mb-1">{q.question}</label>
                  <Input
                    type="text"
                    value={securityAnswers[idx]}
                    onChange={e => {
                      const updated = [...securityAnswers];
                      updated[idx] = e.target.value;
                      setSecurityAnswers(updated);
                    }}
                    required
                    autoComplete="off"
                  />
                </div>
              ))}
              {securityError && <div className="text-red-600 text-sm text-center">{securityError}</div>}
              <Button type="submit" className="w-full">Continue</Button>
              <div className="text-center mt-2">
                <Button variant="link" onClick={() => { setSecurityQuestions([]); setStep('security'); }} className="text-sm flex items-center space-x-1 mx-auto">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    );
  }

  if (step === 'reset') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Reset Password</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...resetForm}>
            <form onSubmit={resetForm.handleSubmit(async (data: any) => {
              setError('');
              setSuccess('');
              try {
                await authApi.resetPassword({ ...data, userId });
                setStep('success');
                setSuccess('Password reset successfully! You can now login with your new password.');
              } catch (error: any) {
                setError(error.message || 'Failed to reset password');
              }
            })} className="space-y-4">
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
          Enter your email address and we&apos;ll send you a code to reset your password.
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