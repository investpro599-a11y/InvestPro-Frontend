"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/auth";
import type { User, LoginData, InsertUser } from "../../shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  signup: (data: InsertUser) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/auth/me"],
    queryFn: async () => {
      return await authApi.me();
    },
    retry: (failureCount, error: any) => {
      // Don't retry on 401 (unauthorized) or 429 (rate limited)
      if (error?.status === 401 || error?.status === 429) {
        return false;
      }
      // Only retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('authToken'), // Only run if token exists
  });

  // Handle deactivated account error
  useEffect(() => {
    if (error && (error?.message?.includes("deactivated") || (error as any)?.accountDeactivated)) {
      queryClient.setQueryData(["auth/me"], null);
      queryClient.clear();
      toast({
        variant: "destructive",
        title: "Account Deactivated",
        description: "Your account has been deactivated. Please contact an administrator.",
      });
      router.push("/login");
    }
  }, [error, queryClient, toast, router]);

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const result = await authApi.login(data);
      return result;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/auth/me"], data.user);
      
      toast({
        title: "Welcome back!",
        description: data.message || "Login successful",
      });
      
      if (data.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "An error occurred during login",
      });
    },
  });

  const signupMutation = useMutation({
    mutationFn: authApi.signup,
    onSuccess: (data) => {
      if (data.user) {
        queryClient.setQueryData(["/auth/me"], data.user);
        
        toast({
          title: "Account created!",
          description: data.message || "Your account has been created successfully",
        });
        
        if (data.user.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      }
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: error.message || "An error occurred during signup",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.setQueryData(["/auth/me"], null);
      queryClient.clear();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
      router.push("/login");
    },
  });

  const value: AuthContextType = {
    user: user || null,
    isLoading,
    login: async (data: LoginData) => {
      await loginMutation.mutateAsync(data);
    },
    signup: async (data: InsertUser) => {
      await signupMutation.mutateAsync(data);
    },
    logout: async () => {
      await logoutMutation.mutateAsync();
    },
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
