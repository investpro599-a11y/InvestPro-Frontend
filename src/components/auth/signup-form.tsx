"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { SECURITY_QUESTIONS, SecurityQuestion } from "../../../shared/schema";

interface SignupFormProps {
  initialReferralCode?: string;
}

// Define the signup schema for client-side validation
const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(50, 'Full name must be less than 50 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username must be less than 20 characters').regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Invalid email address').max(100, 'Email must be less than 100 characters'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password must be less than 100 characters'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
  referralCode: z.string().optional(),
  securityQuestions: z
    .array(
      z.object({
        question: z.string().min(1, 'Select a question'),
        answer: z.string().min(1, 'Answer is required'),
      })
    )
    .min(3, 'You must answer at least 3 security questions')
    .max(3, 'You can only answer 3 security questions'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

const defaultSecurityQuestions: SecurityQuestion[] = [
  { question: '', answer: '' },
  { question: '', answer: '' },
  { question: '', answer: '' },
];

export function SignupForm({ initialReferralCode }: SignupFormProps) {
  const { signup, login } = useAuth();
  const { toast } = useToast();
  const [signupError, setSignupError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      username: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      referralCode: initialReferralCode || '',
      securityQuestions: defaultSecurityQuestions,
    },
    mode: 'onChange', // Enable real-time validation
  });
  
  const router = useRouter();
  const emailInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (initialReferralCode) {
      form.setValue("referralCode", initialReferralCode);
    }
  }, [initialReferralCode, form]);

  useEffect(() => {
    if (emailError && emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, [emailError]);

  // Clear errors when form values change
  useEffect(() => {
    const subscription = form.watch(() => {
      setSignupError('');
      setEmailError('');
      setUsernameError('');
      setFormErrors([]);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (data: SignupFormValues) => {
    if (isSubmitting) return; // Prevent double submission
    
    setIsSubmitting(true);
    setSignupError('');
    setEmailError('');
    setUsernameError('');
    setFormErrors([]);
    
    try {
      console.log('Submitting signup data:', { ...data, password: '[HIDDEN]' });
      
      // Always create user accounts - admins cannot sign up through public form
      const signupData = {
        ...data,
        role: "user" // Force user role for all public signups
      };
      
      console.log('Calling signup API...');
      await signup(signupData);
      
      console.log('Signup successful, showing toast...');
      toast({
        title: "Signup successful!",
        description: "Logging you in...",
      });
      
      console.log('Attempting login...');
      await login({ emailOrUsername: data.email, password: data.password });
      
      console.log('Login successful, redirecting...');
      // The useAuth hook will handle routing based on user role
      // All signups are users, so they go to /dashboard
      window.location.reload();
    } catch (error: any) {
      console.error('Signup error:', error);
      
      let handled = false;
      if (error.message === 'Email already exists') {
        setEmailError('Email already exists');
        handled = true;
      } else if (error.message === 'Username already exists') {
        setUsernameError('Username already exists');
        handled = true;
      } else if (error.message.includes('trusted provider') || error.message.includes('valid pattern')) {
        setEmailError(error.message);
        handled = true;
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        setSignupError('Network error. Please check your internet connection and try again.');
        handled = true;
      } else if (error.message.includes('timeout')) {
        setSignupError('Request timed out. Please try again.');
        handled = true;
      } else {
        setSignupError(error.message || "Signup failed. Please try again.");
      }
      
      toast({
        variant: 'destructive',
        title: 'Signup Error',
        description: error.message || 'Signup failed. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any previous errors
    setSignupError('');
    setEmailError('');
    setUsernameError('');
    setFormErrors([]);
    
    // Trigger form validation
    form.handleSubmit(onSubmit)(e);
  };

  return (
    <Form {...form}>
      <form 
        ref={formRef}
        onSubmit={handleFormSubmit} 
        className="space-y-4"
        noValidate // Prevent browser validation to use our custom validation
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter full name" 
                    {...field} 
                    autoComplete="name"
                    autoCapitalize="words"
                    required
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Choose username" 
                    {...field} 
                    autoComplete="username"
                    autoCapitalize="none"
                    required
                    disabled={isSubmitting}
                  />
                </FormControl>
                {usernameError && <div className="text-red-600 text-xs mt-1">{usernameError}</div>}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address *</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  {...field}
                  ref={emailInputRef}
                  className={emailError ? "border-red-500 focus:border-red-600 focus:ring-red-500" : ""}
                  autoComplete="email"
                  autoCapitalize="none"
                  inputMode="email"
                  required
                  disabled={isSubmitting}
                />
              </FormControl>
              {emailError && (
                <div className="text-red-600 text-xs mt-1 font-semibold animate-pulse">{emailError}</div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number (Optional)</FormLabel>
              <FormControl>
                <Input 
                  type="tel" 
                  placeholder="Enter phone number" 
                  {...field} 
                  value={field.value || ""} 
                  autoComplete="tel"
                  inputMode="tel"
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password *</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="Create password" 
                    {...field} 
                    autoComplete="new-password"
                    required
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password *</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="Confirm password" 
                    {...field} 
                    autoComplete="new-password"
                    required
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="referralCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Referral Code {initialReferralCode && <span className="text-green-600">(Pre-filled from referral link)</span>}
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter referral code (optional)" 
                  {...field} 
                  autoComplete="off"
                  autoCapitalize="characters"
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 gap-4">
          <label className="font-semibold">Security Questions (for password recovery)</label>
          {form.watch('securityQuestions').map((sq, idx) => (
            <div key={idx} className="flex flex-col md:flex-row gap-2 items-center mb-2">
              <FormField
                control={form.control}
                name={`securityQuestions.${idx}.question` as const}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Question {idx + 1}</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="input input-bordered w-full"
                        required
                        value={field.value}
                        onChange={e => {
                          // Prevent duplicate questions
                          const selected = e.target.value;
                          const currentQuestions = form.getValues('securityQuestions').map(q => q.question);
                          if (currentQuestions.includes(selected) && selected !== sq.question) {
                            alert('You cannot select the same question twice.');
                            return;
                          }
                          field.onChange(selected);
                        }}
                      >
                        <option value="">Select a question</option>
                        {SECURITY_QUESTIONS.map((q: string, i: number) => (
                          <option key={i} value={q} disabled={form.watch('securityQuestions').some((s, sidx) => sidx !== idx && s.question === q)}>
                            {q}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`securityQuestions.${idx}.answer` as const}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Answer</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter your answer"
                        required
                        autoComplete="off"
                        type="text"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
        </div>
        
        {/* Error Display */}
        {signupError && (
          <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md border border-red-200">
            {signupError}
          </div>
        )}
        
        {formErrors.length > 0 && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200">
            <ul className="list-disc list-inside space-y-1">
              {formErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting || !form.formState.isValid}
        >
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </Button>
        
        {/* Form Status */}
        {isSubmitting && (
          <div className="text-center text-sm text-gray-600">
            Please wait while we create your account...
          </div>
        )}
      </form>
    </Form>
  );
}
