"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "@/lib";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Check, CheckCheck, AlertCircle, User, DollarSign, Coins, Settings } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Notification } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "investment":
      return <Coins className="h-4 w-4" />;
    case "withdrawal":
      return <DollarSign className="h-4 w-4" />;
    case "user":
      return <User className="h-4 w-4" />;
    case "system":
      return <Settings className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case "investment":
      return "bg-sky-500/20 text-sky-300 border border-sky-400/30";
    case "withdrawal":
      return "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30";
    case "user":
      return "bg-indigo-500/20 text-indigo-300 border border-indigo-400/30";
    case "system":
      return "bg-amber-500/20 text-amber-300 border border-amber-400/30";
    default:
      return "bg-slate-800 text-slate-300 border border-white/10";
  }
};

export function NotificationPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");
  const { isAdmin } = useAuth();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications", isAdmin ? "admin" : "user"],
    queryFn: isAdmin ? notificationApi.getAll : notificationApi.getUserNotifications,
  });

  const markAsReadMutation = useMutation({
    mutationFn: notificationApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to mark notification as read',
        description: error?.message || 'An error occurred while marking as read.',
      });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread"] });
      toast({
        title: "All notifications marked as read",
        description: "All notifications have been marked as read.",
      });
    },
  });

  const handleMarkAsRead = (notification: Notification) => {
    if (notification.status === "unread") {
      markAsReadMutation.mutate(String(notification.id || notification._id));
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === "all") return true;
    if (activeTab === "requests") {
      return notification.type === "investment" || notification.type === "withdrawal";
    }
    return notification.type === activeTab;
  });

  const unreadCount = notifications.filter(n => n.status === "unread").length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-sky-500/25 bg-[#0e2238]/95 text-white shadow-xl">
      <CardHeader className="border-b border-sky-500/20 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-sky-400" />
            <CardTitle className="text-lg font-extrabold font-display text-white">Notifications</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2 bg-rose-500 text-white font-bold">
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
              className="bg-sky-500/20 border-sky-400/30 text-sky-300 hover:bg-sky-500/40"
            >
              <CheckCheck className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {isAdmin ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 bg-[#07172b] border border-sky-500/20 p-1 rounded-xl">
              <TabsTrigger value="all" className="rounded-lg text-xs font-bold data-[state=active]:bg-sky-500 data-[state=active]:text-white">All</TabsTrigger>
              <TabsTrigger value="requests" className="rounded-lg text-xs font-bold data-[state=active]:bg-sky-500 data-[state=active]:text-white">Requests</TabsTrigger>
              <TabsTrigger value="user" className="rounded-lg text-xs font-bold data-[state=active]:bg-sky-500 data-[state=active]:text-white">Users</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab} className="mt-4">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-8 text-slate-300">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50 text-sky-400" />
                  <p className="text-sm font-bold">No notifications found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id || notification._id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        notification.status === "unread"
                          ? "bg-[#091f38] border-sky-400/50 shadow-md shadow-sky-500/10"
                          : "bg-[#07172b] border-sky-500/20"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start space-x-3 flex-1 min-w-0">
                          <div className={`p-2 rounded-xl flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-bold text-white text-sm truncate">{notification.title}</h4>
                              {notification.status === "unread" && (
                                <Badge className="text-[10px] bg-sky-500 text-white font-bold flex-shrink-0">
                                  New
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-slate-300 mb-2 break-words leading-relaxed font-medium">{notification.message}</p>
                            <p className="text-[10px] text-slate-400 font-semibold">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        {notification.status === "unread" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification)}
                            disabled={markAsReadMutation.isPending}
                            className="text-sky-300 hover:bg-sky-500/20"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          notifications.length === 0 ? (
            <div className="text-center py-8 text-slate-300">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50 text-sky-400" />
              <p className="text-sm font-bold">No notifications found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id || notification._id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    notification.status === "unread"
                      ? "bg-[#091f38] border-sky-400/50 shadow-md shadow-sky-500/10"
                      : "bg-[#07172b] border-sky-500/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-xl flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-bold text-white text-sm truncate">{notification.title}</h4>
                          {notification.status === "unread" && (
                            <Badge className="text-[10px] bg-sky-500 text-white font-bold flex-shrink-0">
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 mb-2 break-words leading-relaxed font-medium">{notification.message}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    {notification.status === "unread" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification)}
                        disabled={markAsReadMutation.isPending}
                        className="text-sky-300 hover:bg-sky-500/20"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
} 