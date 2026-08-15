"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/layout";
import { ProfileForm } from "@/components/profile/profile-form";

export default function Profile() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Show spinner while auth is being determined
  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-full border-4 border-sky-500/30 border-t-sky-500 animate-spin" />
            <p className="text-slate-400 font-medium">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white">Profile <span className="gradient-text-primary">Settings</span></h1>
            <p className="text-slate-300 mt-1 font-medium">Manage your account information and preferences.</p>
          </div>

          <ProfileForm />
        </div>
      </div>
    </Layout>
  );
}
