import { apiRequest } from "./queryClient";
import type { 
  Investment, 
  InsertInvestment, 
  Withdrawal, 
  InsertWithdrawal,
  User,
  Notification,
  DashboardStats,
  ApiResponse,
  PaginatedResponse,
  GenealogyTree,
  AdminStats,
  LogEntry,
  Commission
} from "../../shared/schema";

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiRequest("GET", "/dashboard/stats");
    const result: ApiResponse<DashboardStats> = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to get dashboard stats");
    return result.data!;
  },

  getInvestmentChart: async (period: string = "30D") => {
    const response = await apiRequest("GET", `/dashboard/investment-chart?period=${period}`);
    const result: ApiResponse<any> = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to get investment chart");
    return result.data!;
  },
};

export const investmentApi = {
  getAll: async (): Promise<PaginatedResponse<Investment>> => {
    const response = await apiRequest("GET", "/investments");
    const result: ApiResponse<PaginatedResponse<Investment>> = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to get investments");
    return result.data!;
  },

  getById: async (id: string): Promise<Investment> => {
    const response = await apiRequest("GET", `/investments/${id}`);
    const result: ApiResponse<Investment> = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to get investment");
    return result.data!;
  },

  create: async (data: InsertInvestment | FormData): Promise<any> => {
    if (typeof window !== 'undefined' && data instanceof FormData) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${baseUrl}/investments`, {
        method: "POST",
        body: data,
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
        credentials: 'include',
      });
      const result: ApiResponse<Investment> = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to create investment");
      return result;
    } else {
      const response = await apiRequest("POST", "/investments", data);
      const result: ApiResponse<Investment> = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to create investment");
      return result;
    }
  },

  update: async (id: string, data: Partial<InsertInvestment>): Promise<Investment> => {
    const response = await apiRequest("PUT", `/investments/${id}`, data);
    const result: ApiResponse<Investment> = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to update investment");
    return result.data!;
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    const response = await apiRequest("DELETE", `/investments/${id}`);
    const result: ApiResponse<{ success: boolean }> = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to delete investment");
    return result.data!;
  },

  approveInvestment: async (id: string): Promise<ApiResponse<Investment>> => {
    const response = await apiRequest("PATCH", `/investments/${id}/approve`);
    const result: ApiResponse<Investment> = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to approve investment");
    return result;
  },

  rejectInvestment: async (id: string, reason?: string): Promise<ApiResponse<Investment>> => {
    const response = await apiRequest("PATCH", `/investments/${id}/reject`, { reason });
    const result: ApiResponse<Investment> = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to reject investment");
    return result;
  },
};

export const withdrawalApi = {
  getAll: async (): Promise<PaginatedResponse<Withdrawal>> => {
    const response = await apiRequest("GET", "/withdrawals");
    const result: ApiResponse<PaginatedResponse<Withdrawal>> = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to get withdrawals");
    return result.data!;
  },

  getById: async (id: string): Promise<Withdrawal> => {
    const response = await apiRequest("GET", `/withdrawals/${id}`);
    const result: ApiResponse<Withdrawal> = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to get withdrawal");
    return result.data!;
  },

  create: async (data: InsertWithdrawal): Promise<Withdrawal> => {
    const response = await apiRequest("POST", "/withdrawals", data);
    const result: ApiResponse<Withdrawal> = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to create withdrawal");
    return result.data!;
  },

  update: async (id: string, data: Partial<InsertWithdrawal>): Promise<Withdrawal> => {
    const response = await apiRequest("PUT", `/withdrawals/${id}`, data);
    const result: ApiResponse<Withdrawal> = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to update withdrawal");
    return result.data!;
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    const response = await apiRequest("DELETE", `/withdrawals/${id}`);
    const result: ApiResponse<{ success: boolean }> = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to delete withdrawal");
    return result.data!;
  },
};

export const profileApi = {
  get: async (): Promise<User> => {
    const response = await apiRequest("GET", "/users/me");
    const result: ApiResponse<User> = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to get profile");
    return result.data!;
  },

  update: async (data: Partial<User>): Promise<User> => {
    const response = await apiRequest("PATCH", "/users/update-me", data);
    const result: ApiResponse<User> = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to update profile");
    return result.data!;
  },

  updateAvatar: async (file: File): Promise<{ avatarUrl: string }> => {
    const formData = new FormData();
    formData.append("avatar", file);
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${baseUrl}/users/profile/avatar`, {
      method: "POST",
      body: formData,
      headers: token ? { "Authorization": `Bearer ${token}` } : {},
      credentials: 'include',
    });
    const result: ApiResponse<{ avatarUrl: string }> = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to update avatar");
    return result.data!;
  },
};

export const notificationApi = {
  getAll: async (): Promise<Notification[]> => {
    const response = await apiRequest("GET", "/notifications");
    const result: ApiResponse<{ docs: Notification[]; page: number; limit: number; total: number; pages: number } | Notification[]> = await response.json();
    console.log('notificationApi.getAll result:', result);
    if (!response.ok) throw new Error(result.message || "Failed to get notifications");
    // If result.data is an array, return it; if it's an object with docs, return docs
    if (Array.isArray(result.data)) return result.data;
    if (result.data && Array.isArray((result.data as any).docs)) return (result.data as any).docs;
    return [];
  },

  getUnread: async (): Promise<Notification[]> => {
    const response = await apiRequest("GET", "/notifications/unread");
    const result: ApiResponse<Notification[]> = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to get unread notifications");
    return result.data!;
  },

  markAsRead: async (id: string): Promise<Notification> => {
    const response = await apiRequest("PATCH", `/notifications/${id}/read`);
    const result: ApiResponse<Notification> = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to mark notification as read");
    return result.data!;
  },

  markAllAsRead: async (): Promise<{ markedCount: number; message: string }> => {
    const response = await apiRequest("PATCH", "/notifications/mark-all-read");
    const result: ApiResponse<{ markedCount: number; message: string }> = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to mark all notifications as read");
    return result.data!;
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    const response = await apiRequest("DELETE", `/notifications/${id}`);
    const result: ApiResponse<{ success: boolean }> = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to delete notification");
    return result.data!;
  },

  getUserNotifications: async (): Promise<Notification[]> => {
    const response = await apiRequest("GET", "/notifications/my-notifications");
    const result: ApiResponse<{ notifications: Notification[] }> = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to get user notifications");
    return result.data?.notifications || [];
  },
};

export const genealogyApi = {
  getTree: async (userId?: string): Promise<GenealogyTree> => {
    const url = userId ? `/genealogy/${userId}` : "/genealogy";
    const response = await apiRequest("GET", url);
    const result: ApiResponse<GenealogyTree> = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to get genealogy tree");
    return result.data!;
  },

  getTeamMembers: async (): Promise<User[]> => {
    const response = await apiRequest("GET", "/genealogy/team-members");
    const result: ApiResponse<User[]> = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to get team members");
    return result.data!;
  },

  getReferrals: async (): Promise<User[]> => {
    const response = await apiRequest("GET", "/genealogy/referrals");
    const result: ApiResponse<User[]> = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to get referrals");
    return result.data!;
  },
};

export const commissionApi = {
  getAll: async (): Promise<PaginatedResponse<Commission>> => {
    const response = await apiRequest("GET", "/commissions");
    const result: ApiResponse<PaginatedResponse<Commission>> = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to get commissions");
    return result.data!;
  },

  getEarnings: async (): Promise<any> => {
    const response = await apiRequest("GET", "/commissions/earnings");
    const result: ApiResponse<any> = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to get earnings");
    return result.data!;
  },
};

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    const response = await apiRequest("GET", "/admin/stats");
    const result: ApiResponse<AdminStats> = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to get admin stats");
    return result.data!;
  },

  getPendingInvestments: async (): Promise<Investment[]> => {
    const response = await apiRequest("GET", "/admin/investments/pending");
    const result: ApiResponse<Investment[]> = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to get pending investments");
    return result.data!;
  },

  getPendingWithdrawals: async (): Promise<{ pendingWithdrawals: Withdrawal[]; totalPendingAmount: number; count: number }> => {
    const response = await apiRequest("GET", "/admin/withdrawals/pending");
    const result: ApiResponse<{ pendingWithdrawals: Withdrawal[]; totalPendingAmount: number; count: number }> = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to get pending withdrawals");
    return result.data!;
  },

  approveWithdrawal: async (id: string, formData: FormData): Promise<Withdrawal> => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    const response = await fetch(`${baseUrl}/withdrawals/${id}/process`, {
      method: 'PATCH',
      body: formData,
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      credentials: 'include',
    });
    const result: ApiResponse<Withdrawal> = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to approve withdrawal');
    return result.data!;
  },

  getUsers: async (): Promise<User[]> => {
    const response = await apiRequest("GET", "/admin/users");
    const result: ApiResponse<{ docs: User[]; page: number; limit: number; total: number; pages: number }> = await response.json();
    console.log('adminApi.getUsers result:', result);
    if (!response.ok) throw new Error(result.message || "Failed to get users");
    return result.data?.docs || [];
  },

  getUserById: async (id: string): Promise<User> => {
    const response = await apiRequest("GET", `/admin/users/${id}`);
    const result: ApiResponse<User> = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to get user");
    return result.data!;
  },

  deleteUser: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiRequest("DELETE", `/admin/users/${id}`);
    const result: ApiResponse<{ success: boolean; message: string }> = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to delete user");
    return {
      success: true,
      message: result.message || "User deleted successfully"
    };
  },

  toggleUserStatus: async (id: string): Promise<{ success: boolean; user: User; message: string }> => {
    const response = await apiRequest("PATCH", `/admin/users/${id}/toggle-status`);
    const result: ApiResponse<{ success: boolean; user: User; message: string }> = await response.json();
    console.log('adminApi.toggleUserStatus', id, result);
    if (!response.ok) throw new Error(result.message || "Failed to toggle user status");
    return result.data!;
  },

  rejectWithdrawal: async (id: string, reason?: string): Promise<Withdrawal> => {
    const response = await apiRequest("PATCH", `/withdrawals/${id}/reject`, { reason });
    const result: ApiResponse<Withdrawal> = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to reject withdrawal");
    return result.data!;
  },

  getAllInvestments: async (): Promise<Investment[]> => {
    const response = await apiRequest("GET", "/admin/investments");
    const result: ApiResponse<{ docs: Investment[]; page: number; limit: number; total: number; pages: number }> = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to get all investments");
    return result.data?.docs || [];
  },

  getAllWithdrawals: async (): Promise<Withdrawal[]> => {
    const response = await apiRequest("GET", "/admin/withdrawals");
    const result: ApiResponse<{ docs: Withdrawal[]; page: number; limit: number; total: number; pages: number }> = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to get all withdrawals");
    return result.data?.docs || [];
  },

  getLogs: async (filter?: string): Promise<LogEntry[]> => {
    const url = filter ? `/admin/logs?filter=${filter}` : "/admin/logs";
    const response = await apiRequest("GET", url);
    const result: ApiResponse<{ docs: LogEntry[]; page: number; limit: number; total: number; pages: number }> = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to get logs");
    return result.data?.docs || [];
  },

  approveInvestment: async (id: string): Promise<ApiResponse<Investment>> => {
    const response = await apiRequest("PATCH", `/investments/${id}/approve`);
    const result: ApiResponse<Investment> = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to approve investment");
    return result;
  },

  rejectInvestment: async (id: string, reason?: string): Promise<ApiResponse<Investment>> => {
    const response = await apiRequest("PATCH", `/investments/${id}/reject`, { reason });
    const result: ApiResponse<Investment> = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to reject investment");
    return result;
  },
};

export const fileUploadApi = {
  upload: async (file: File): Promise<{ filename: string; url: string; size: number }> => {
    const formData = new FormData();
    formData.append("file", file);
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    const response = await fetch(`${baseUrl}/upload`, {
      method: "POST",
      body: formData,
      headers: token ? { "Authorization": `Bearer ${token}` } : {},
      credentials: 'include',
    });
    const result: ApiResponse<{ filename: string; url: string; size: number }> = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Failed to upload file");
    }
    return result.data!;
  },
};

export const databaseConfigApi = {
  getCollections: async () => {
    const response = await apiRequest("GET", "/admin/db/collections");
    const result: ApiResponse<any> = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to get collections");
    return result.data!;
  },
  
  getDocuments: async (collection: string, page: number, limit: number) => {
    const response = await apiRequest("GET", `/admin/db/collection/${collection}?page=${page}&limit=${limit}`);
    const result: ApiResponse<any> = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to get documents");
    return result.data!;
  },
  
  addDocument: async (collection: string, doc: any) => {
    const response = await apiRequest("POST", `/admin/db/collection/${collection}`, doc);
    const result: ApiResponse<any> = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to add document");
    return result.data!;
  },
  
  updateDocument: async (collection: string, id: string, doc: any) => {
    const response = await apiRequest("PUT", `/admin/db/collection/${collection}/${id}`, doc);
    const result: ApiResponse<any> = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to update document");
    return result.data!;
  },
  
  deleteDocument: async (collection: string, id: string) => {
    const response = await apiRequest("DELETE", `/admin/db/collection/${collection}/${id}`);
    const result: ApiResponse<any> = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to delete document");
    return result.data!;
  },

  importDocuments: async (collection: string, docs: any[]) => {
    const response = await apiRequest("POST", `/admin/db/collection/${collection}/import`, { documents: docs });
    const result: ApiResponse<any> = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to import documents");
    return result.data!;
  },
};
