"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "@/lib";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Camera, User, Settings, Save } from "lucide-react";
import { handleFormSubmissionResponse, extractMessage } from "@/lib/messages";
import { PasswordChangeForm } from "@/components/profile/password-change-form";
import { apiRequest } from "@/lib/queryClient";
import { getFileUrl } from "@/lib/utils";

export function ProfileForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preload user data into the form
  const form = useForm({
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      walletAddress: user?.walletAddress || "",
    },
  });

  // Update form values when user changes
  useEffect(() => {
    if (user) {
      form.reset({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        walletAddress: user.walletAddress || "",
      });
    }
  }, [user, form]);

  const updateProfileMutation = useMutation({
    mutationFn: profileApi.update,
    onSuccess: (response) => {
      // Extract user data from response
      const updatedUser = response;
      queryClient.setQueryData(["auth/me"], updatedUser);
      
      // Use server message if available, otherwise use default
      const toastConfig = handleFormSubmissionResponse(response, 'update');
      toast(toastConfig);
      
      setIsEditing(false);
      form.reset({
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phone: updatedUser.phone || undefined,
        walletAddress: updatedUser.walletAddress || "",
      });
    },
    onError: (error: any) => {
      console.error('Profile update error:', error);
      const message = extractMessage(error);
      toast({
        variant: "destructive",
        title: "Profile Update Failed",
        description: message,
      });
    },
  });

  const onSubmit = (data: any) => {
    console.log('Form data before processing:', data);
    
    const updateData: any = {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone || undefined,
      walletAddress: data.walletAddress || undefined,
    };

    // Remove undefined values to avoid sending them
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined || updateData[key] === '') {
        delete updateData[key];
      }
    });

    console.log('Data being sent to backend:', updateData);
    updateProfileMutation.mutate(updateData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.reset({
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      walletAddress: user?.walletAddress || "",
    });
  };

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("profilePicture", file);
    try {
      // Use the same apiRequest function that handles authentication properly
      const res = await apiRequest("POST", "/users/profile-picture", formData);
      const data = await res.json();
      // Update user in query cache with the new profile picture
      if (data.data && data.data.profilePicture) {
        queryClient.setQueryData(["/auth/me"], (old: any) => ({ 
          ...old, 
          profilePicture: data.data.profilePicture 
        }));
        toast({ 
          title: "Profile picture updated!",
          description: data.message || "Your profile picture has been updated successfully."
        });
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (err: any) {
      console.error('Profile picture upload error:', err);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: err.message || "Could not upload profile picture",
      });
    }
  };

  if (!user) return null;

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Picture Section */}
        <div className="lg:col-span-1">
          <Card className="glass-card border-sky-500/25 bg-white/90 dark:bg-[#0e2238]/90 shadow-xl">
            <CardHeader className="border-b border-sky-500/20 px-6 py-4 bg-slate-50/80 dark:bg-[#07172b]">
              <CardTitle className="flex items-center space-x-2 text-slate-900 dark:text-white font-extrabold font-display">
                <User className="h-5 w-5 text-sky-500" />
                <span>Profile Picture</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4 p-6">
              <div className="relative inline-block">
                <Avatar className="w-24 h-24 mx-auto border-2 border-sky-400/40 shadow-lg">
                  <AvatarImage 
                    src={getFileUrl(user.profilePicture)} 
                    crossOrigin="anonymous"
                  />
                  <AvatarFallback className="bg-sky-950 text-sky-200 text-2xl font-bold">
                    {user.fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  className="absolute -bottom-1 -right-1 rounded-full w-8 h-8 p-0 bg-sky-600 hover:bg-sky-500 text-white shadow-md"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload picture"
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  tabIndex={-1}
                  aria-hidden="true"
                  onChange={handleProfileImageChange}
                />
              </div>
              <div>
                <p className="font-bold text-lg text-slate-900 dark:text-white">{user.fullName}</p>
                <p className="text-sm font-semibold text-sky-600 dark:text-sky-300">@{user.username}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Form Section */}
        <div className="lg:col-span-2">
          <Card className="glass-card border-sky-500/25 bg-white/90 dark:bg-[#0e2238]/90 shadow-xl">
            <CardHeader className="border-b border-sky-500/20 px-6 py-4 bg-slate-50/80 dark:bg-[#07172b]">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2 text-slate-900 dark:text-white font-extrabold font-display">
                  <Settings className="h-5 w-5 text-sky-500" />
                  <span>Profile Information</span>
                </CardTitle>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} variant="outline" className="bg-sky-500/10 border-sky-400/30 text-sky-600 dark:text-sky-300 font-bold hover:bg-sky-500/20">
                    Edit Profile
                  </Button>
                ) : (
                  <Button onClick={handleCancel} variant="ghost" size="sm" className="text-slate-600 dark:text-slate-300 font-bold">
                    Cancel
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-800 dark:text-slate-200 font-bold text-xs uppercase tracking-wider">Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!isEditing} className="bg-white/80 dark:bg-[#07172b] border-sky-500/20 text-slate-900 dark:text-white font-semibold" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div>
                      <FormLabel className="text-slate-800 dark:text-slate-200 font-bold text-xs uppercase tracking-wider">Username</FormLabel>
                      <Input value={user.username} disabled className="bg-slate-100 dark:bg-[#051120] border-sky-500/20 text-slate-500 dark:text-slate-400 font-semibold" />
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Username cannot be changed</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-800 dark:text-slate-200 font-bold text-xs uppercase tracking-wider">Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} disabled={!isEditing} className="bg-white/80 dark:bg-[#07172b] border-sky-500/20 text-slate-900 dark:text-white font-semibold" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-800 dark:text-slate-200 font-bold text-xs uppercase tracking-wider">Phone Number</FormLabel>
                          <FormControl>
                            <Input type="tel" {...field} disabled={!isEditing} className="bg-white/80 dark:bg-[#07172b] border-sky-500/20 text-slate-900 dark:text-white font-semibold" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="walletAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-800 dark:text-slate-200 font-bold text-xs uppercase tracking-wider">TRC20 USDT Wallet Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your TRC20 USDT wallet address for withdrawals" {...field} disabled={!isEditing} className="bg-white/80 dark:bg-[#07172b] border-sky-500/20 text-slate-900 dark:text-white font-semibold" />
                        </FormControl>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          This address will be used for all withdrawal transactions. Make sure it&apos;s correct.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {isEditing && (
                    <div className="flex justify-end space-x-4 pt-2">
                      <Button type="button" variant="outline" onClick={handleCancel}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={updateProfileMutation.isPending} className="bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold shadow-lg shadow-sky-500/25">
                        {updateProfileMutation.isPending ? (
                          "Saving..."
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Password Change Section */}
      <div className="mt-8">
        <Card className="glass-card border-sky-500/25 bg-white/90 dark:bg-[#0e2238]/90 shadow-xl">
          <CardHeader className="border-b border-sky-500/20 px-6 py-4 bg-slate-50/80 dark:bg-[#07172b]">
            <CardTitle className="flex items-center space-x-2 text-slate-900 dark:text-white font-extrabold font-display">
              <Settings className="h-5 w-5 text-sky-500" />
              <span>Change Password</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 font-medium">
              Use the form below to change your password. You&apos;ll need to provide your current password for security.
            </p>
            <PasswordChangeForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 