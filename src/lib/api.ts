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
  Commission,
  Flat,
  FlatInvestment,
  AirbnbWalletData,
  AirbnbPayout,
  InventoryItem
} from "../../shared/schema";

// Helper: unwrap ApiResponse envelope OR return raw response as-is
function unwrap<T>(result: any): T {
  return (result?.data !== undefined ? result.data : result) as T;
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiRequest("GET", "/dashboard/stats");
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to get dashboard stats");
    return unwrap<DashboardStats>(result);
  },

  getInvestmentChart: async (period: string = "30D") => {
    const response = await apiRequest("GET", `/dashboard/investment-chart?period=${period}`);
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to get investment chart");
    return unwrap<any>(result);
  },

  getDailyProfits: async () => {
    const response = await apiRequest("GET", "/dashboard/daily-profits");
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to get daily profit history");
    return unwrap<any>(result);
  },
};

export const investmentApi = {
  getAll: async (): Promise<Investment[]> => {
    const response = await apiRequest("GET", "/investments");
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to get investments");
    const data = unwrap<any>(result);
    return Array.isArray(data) ? data : (data?.docs || []);
  },

  getById: async (id: string): Promise<Investment> => {
    const response = await apiRequest("GET", `/investments/${id}`);
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to get investment");
    return unwrap<Investment>(result);
  },

  create: async (data: InsertInvestment | FormData): Promise<any> => {
    const response = await apiRequest("POST", "/investments", data);
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to create investment");
    return unwrap(result);
  },

  update: async (id: string, data: Partial<InsertInvestment>): Promise<Investment> => {
    const response = await apiRequest("PUT", `/investments/${id}`, data);
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to update investment");
    return unwrap<Investment>(result);
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    const response = await apiRequest("DELETE", `/investments/${id}`);
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to delete investment");
    return unwrap<{ success: boolean }>(result);
  },

  approveInvestment: async (id: string): Promise<Investment> => {
    const response = await apiRequest("PUT", `/admin/investments/${id}/approve`);
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to approve investment");
    return unwrap<Investment>(result);
  },

  rejectInvestment: async (id: string, reason?: string): Promise<Investment> => {
    const response = await apiRequest("PUT", `/admin/investments/${id}/reject`, { reason });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to reject investment");
    return unwrap<Investment>(result);
  },
};

export const withdrawalApi = {
  getAll: async (): Promise<Withdrawal[]> => {
    const response = await apiRequest("GET", "/withdrawals");
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to get withdrawals");
    const data = unwrap<any>(result);
    return Array.isArray(data) ? data : (data?.docs || []);
  },

  getById: async (id: string): Promise<Withdrawal> => {
    const response = await apiRequest("GET", `/withdrawals/${id}`);
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to get withdrawal");
    return unwrap<Withdrawal>(result);
  },

  create: async (data: InsertWithdrawal): Promise<Withdrawal> => {
    const response = await apiRequest("POST", "/withdrawals", data);
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to create withdrawal");
    return unwrap<Withdrawal>(result);
  },

  update: async (id: string, data: Partial<InsertWithdrawal>): Promise<Withdrawal> => {
    const response = await apiRequest("PUT", `/withdrawals/${id}`, data);
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to update withdrawal");
    return unwrap<Withdrawal>(result);
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    const response = await apiRequest("DELETE", `/withdrawals/${id}`);
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to delete withdrawal");
    return unwrap<{ success: boolean }>(result);
  },
};

export const profileApi = {
  get: async (): Promise<User> => {
    const response = await apiRequest("GET", "/users/me");
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to get profile");
    return unwrap<User>(result);
  },

  update: async (data: Partial<User>): Promise<User> => {
    const response = await apiRequest("PATCH", "/users/update-me", data);
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to update profile");
    return unwrap<User>(result);
  },

  updateAvatar: async (file: File): Promise<{ avatarUrl: string }> => {
    const formData = new FormData();
    formData.append("avatar", file);
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const token = localStorage.getItem("authToken");
    const response = await fetch(`${baseUrl}/users/profile/avatar`, {
      method: "POST",
      body: formData,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: "include",
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to update avatar");
    return unwrap<{ avatarUrl: string }>(result);
  },
};

export const notificationApi = {
  getAll: async (): Promise<Notification[]> => {
    const response = await apiRequest("GET", "/notifications");
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to get notifications");
    const data = unwrap<any>(result);
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.docs)) return data.docs;
    return [];
  },

  getUnread: async (): Promise<Notification[]> => {
    const response = await apiRequest("GET", "/notifications/unread");
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to get unread notifications");
    const data = unwrap<any>(result);
    return Array.isArray(data) ? data : [];
  },

  markAsRead: async (id: string): Promise<Notification> => {
    const response = await apiRequest("PUT", `/notifications/${id}/read`);
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to mark notification as read");
    return unwrap<Notification>(result);
  },

  markAllAsRead: async (): Promise<void> => {
    const response = await apiRequest("PUT", "/notifications/read-all");
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to mark all notifications as read");
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    const response = await apiRequest("DELETE", `/notifications/${id}`);
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to delete notification");
    return unwrap<{ success: boolean }>(result);
  },

  getUserNotifications: async (): Promise<Notification[]> => {
    const response = await apiRequest("GET", "/notifications");
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to get user notifications");
    const data = unwrap<any>(result);
    return Array.isArray(data) ? data : [];
  },
};

export const genealogyApi = {
  getTree: async (userId?: string): Promise<GenealogyTree> => {
    const url = userId ? `/genealogy/${userId}` : "/genealogy";
    const response = await apiRequest("GET", url);
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to get genealogy tree");
    return unwrap<GenealogyTree>(result);
  },

  getTeamMembers: async (): Promise<User[]> => {
    const response = await apiRequest("GET", "/genealogy/team-members");
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to get team members");
    const data = unwrap<any>(result);
    return Array.isArray(data) ? data : [];
  },

  getReferrals: async (): Promise<User[]> => {
    const response = await apiRequest("GET", "/genealogy/referrals");
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to get referrals");
    const data = unwrap<any>(result);
    return Array.isArray(data) ? data : [];
  },
};

export const commissionApi = {
  getAll: async (): Promise<Commission[]> => {
    const response = await apiRequest("GET", "/commissions");
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to get commissions");
    const data = unwrap<any>(result);
    return Array.isArray(data) ? data : (data?.docs || []);
  },

  getEarnings: async (): Promise<any> => {
    const response = await apiRequest("GET", "/commissions/earnings");
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to get earnings");
    return unwrap<any>(result);
  },
};

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    const response = await apiRequest("GET", "/admin/stats");
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to get admin stats");
    return unwrap<AdminStats>(result);
  },

  getPendingInvestments: async (): Promise<Investment[]> => {
    const response = await apiRequest("GET", "/admin/investments/pending");
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to get pending investments");
    const data = unwrap<any>(result);
    return Array.isArray(data) ? data : [];
  },

  getPendingWithdrawals: async (): Promise<Withdrawal[]> => {
    const response = await apiRequest("GET", "/admin/withdrawals/pending");
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to get pending withdrawals");
    const data = unwrap<any>(result);
    return Array.isArray(data) ? data : (data?.pendingWithdrawals || []);
  },

  approveWithdrawal: async (id: string, txid: string): Promise<Withdrawal> => {
    const response = await apiRequest("PUT", `/admin/withdrawals/${id}/approve`, { txid });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to approve withdrawal");
    return unwrap<Withdrawal>(result);
  },

  rejectWithdrawal: async (id: string, reason?: string): Promise<Withdrawal> => {
    const response = await apiRequest("PUT", `/admin/withdrawals/${id}/reject`, { reason });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to reject withdrawal");
    return unwrap<Withdrawal>(result);
  },

  getUsers: async (): Promise<User[]> => {
    const response = await apiRequest("GET", "/admin/users");
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to get users");
    const data = unwrap<any>(result);
    return Array.isArray(data) ? data : (data?.docs || []);
  },

  getUserById: async (id: string): Promise<User> => {
    const response = await apiRequest("GET", `/admin/users/${id}`);
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to get user");
    return unwrap<User>(result);
  },

  deleteUser: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiRequest("DELETE", `/admin/users/${id}`);
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to delete user");
    return { success: true, message: result.message || "User deleted successfully" };
  },

  toggleUserStatus: async (id: string): Promise<{ success: boolean; user: User; message: string }> => {
    const response = await apiRequest("PUT", `/admin/users/${id}/toggle-status`);
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to toggle user status");
    return unwrap<{ success: boolean; user: User; message: string }>(result);
  },

  getAllInvestments: async (): Promise<Investment[]> => {
    const response = await apiRequest("GET", "/admin/investments");
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to get all investments");
    const data = unwrap<any>(result);
    return Array.isArray(data) ? data : (data?.docs || []);
  },

  getAllWithdrawals: async (): Promise<Withdrawal[]> => {
    const response = await apiRequest("GET", "/admin/withdrawals");
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to get all withdrawals");
    const data = unwrap<any>(result);
    return Array.isArray(data) ? data : (data?.docs || []);
  },

  getLogs: async (filter?: string): Promise<LogEntry[]> => {
    const url = filter ? `/admin/logs?filter=${filter}` : "/admin/logs";
    const response = await apiRequest("GET", url);
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to get logs");
    const data = unwrap<any>(result);
    return Array.isArray(data) ? data : (data?.docs || []);
  },

  approveInvestment: async (id: string): Promise<Investment> => {
    const response = await apiRequest("PUT", `/admin/investments/${id}/approve`);
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to approve investment");
    return unwrap<Investment>(result);
  },

  rejectInvestment: async (id: string, reason?: string): Promise<Investment> => {
    const response = await apiRequest("PUT", `/admin/investments/${id}/reject`, { reason });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to reject investment");
    return unwrap<Investment>(result);
  },
};

export const fileUploadApi = {
  upload: async (file: File): Promise<{ filename: string; url: string; size: number }> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiRequest("POST", "/upload", formData);
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to upload file");
    return unwrap<{ filename: string; url: string; size: number }>(result);
  },
};

export const databaseConfigApi = {
  getCollections: async () => {
    const response = await apiRequest("GET", "/admin/db/collections");
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to get collections");
    return unwrap<any>(result);
  },

  getDocuments: async (collection: string, page: number, limit: number) => {
    const response = await apiRequest("GET", `/admin/db/collection/${collection}?page=${page}&limit=${limit}`);
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to get documents");
    return unwrap<any>(result);
  },

  addDocument: async (collection: string, doc: any) => {
    const response = await apiRequest("POST", `/admin/db/collection/${collection}`, doc);
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to add document");
    return unwrap<any>(result);
  },

  updateDocument: async (collection: string, id: string, doc: any) => {
    const response = await apiRequest("PUT", `/admin/db/collection/${collection}/${id}`, doc);
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to update document");
    return unwrap<any>(result);
  },

  deleteDocument: async (collection: string, id: string) => {
    const response = await apiRequest("DELETE", `/admin/db/collection/${collection}/${id}`);
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to delete document");
    return unwrap<any>(result);
  },

  importDocuments: async (collection: string, docs: any[]) => {
    const response = await apiRequest("POST", `/admin/db/collection/${collection}/import`, { documents: docs });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to import documents");
    return unwrap<any>(result);
  },
};

export const flatsApi = {
  getAll: async (): Promise<Flat[]> => {
    const response = await apiRequest("GET", "/flats");
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to fetch flats");
    return unwrap<Flat[]>(result);
  },

  getById: async (id: number): Promise<Flat> => {
    const response = await apiRequest("GET", `/flats/${id}`);
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to fetch flat");
    return unwrap<Flat>(result);
  },

  invest: async (
    flatId: number,
    data?: { amountUsd?: number; ownershipSharePercent?: number; paymentMethod?: string; paymentProof?: string }
  ): Promise<any> => {
    const response = await apiRequest("POST", `/flats/${flatId}/invest`, data || {});
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to submit property investment");
    return unwrap<any>(result);
  },

  getMyInvestments: async (): Promise<FlatInvestment[]> => {
    const response = await apiRequest("GET", "/flats/user/my-investments");
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to fetch flat investments");
    return unwrap<FlatInvestment[]>(result);
  },

  getWallet: async (): Promise<AirbnbWalletData> => {
    const response = await apiRequest("GET", "/flats/user/wallet");
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to fetch Airbnb wallet");
    return unwrap<AirbnbWalletData>(result);
  },

  createFlat: async (data: any): Promise<Flat> => {
    const response = await apiRequest("POST", "/admin/flats", data);
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to create flat");
    return unwrap<Flat>(result);
  },

  updateFlat: async (id: number, data: any): Promise<Flat> => {
    const response = await apiRequest("PUT", `/admin/flats/${id}`, data);
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to update flat");
    return unwrap<Flat>(result);
  },

  deleteFlat: async (id: number): Promise<boolean> => {
    const response = await apiRequest("DELETE", `/admin/flats/${id}`);
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to delete flat");
    return true;
  },

  getAllInvestments: async (): Promise<FlatInvestment[]> => {
    const response = await apiRequest("GET", "/admin/flats/investments");
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to fetch all flat investments");
    return unwrap<FlatInvestment[]>(result);
  },

  approveInvestment: async (id: number): Promise<any> => {
    const response = await apiRequest("POST", `/admin/flats/investments/${id}/approve`);
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to approve investment");
    return unwrap<any>(result);
  },

  rejectInvestment: async (id: number, reason?: string): Promise<any> => {
    const response = await apiRequest("POST", `/admin/flats/investments/${id}/reject`, { reason });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to reject investment");
    return unwrap<any>(result);
  },

  updateSetupPhase: async (id: number, setupPhase: string): Promise<any> => {
    const response = await apiRequest("PUT", `/admin/flats/investments/${id}/phase`, { setupPhase });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to update setup phase");
    return unwrap<any>(result);
  },

  disburseRentalPayout: async (id: number, data: { amountUsd: number; monthYear: string; note?: string; payoutType?: string; daysCount?: number; bankAccount?: string; destination?: string }): Promise<any> => {
    const response = await apiRequest("POST", `/admin/flats/investments/${id}/disburse`, data);
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to disburse payout");
    return unwrap<any>(result);
  },

  getInvestors: async (): Promise<any[]> => {
    const response = await apiRequest("GET", "/admin/flats/investors");
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to fetch property investors");
    return unwrap<any[]>(result);
  },

  creditInvestor: async (userId: number, data: { amountUsd: number; monthYear?: string; propertyTitle?: string; bankAccount?: string; destination?: string; note?: string }): Promise<any> => {
    const response = await apiRequest("POST", `/admin/flats/investors/${userId}/credit`, data);
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to credit investor account");
    return unwrap<any>(result);
  },

  runMonthlyReturns: async (monthYear?: string): Promise<any> => {
    const response = await apiRequest("POST", "/admin/flats/run-monthly-returns", { monthYear });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to run monthly returns");
    return result;
  },

  seedDemoData: async (): Promise<any> => {
    const response = await apiRequest("POST", "/admin/flats/seed-demo");
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to seed demo data");
    return unwrap<any>(result);
  },

  requestWithdrawal: async (data: { amountUsd: number; paymentMethod: string; walletAddressOrAccount: string }): Promise<any> => {
    const response = await apiRequest("POST", "/flats/user/withdraw", data);
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to submit withdrawal request");
    return unwrap<any>(result);
  },

  getAdminTreasury: async (): Promise<any> => {
    const response = await apiRequest("GET", "/admin/treasury");
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to fetch admin treasury");
    return unwrap<any>(result);
  },

  injectCapital: async (amountUsd: number, note?: string): Promise<any> => {
    const response = await apiRequest("POST", "/admin/treasury/inject-capital", { amountUsd, note });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to inject capital");
    return unwrap<any>(result);
  },

  recordGrossRent: async (amountUsd: number, note?: string): Promise<any> => {
    const response = await apiRequest("POST", "/admin/treasury/record-gross-rent", { amountUsd, note });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to record gross rent");
    return unwrap<any>(result);
  },

  withdrawAdminProfit: async (amountUsd: number, note?: string): Promise<any> => {
    const response = await apiRequest("POST", "/admin/treasury/withdraw-profit", { amountUsd, note });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to withdraw admin profit");
    return unwrap<any>(result);
  },

  payUtilityExpense: async (amountUsd: number, note?: string): Promise<any> => {
    const response = await apiRequest("POST", "/admin/treasury/pay-utility", { amountUsd, note });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to record utility payment");
    return unwrap<any>(result);
  },

  getAdminWithdrawalRequests: async (): Promise<any[]> => {
    const response = await apiRequest("GET", "/admin/flats/withdrawals");
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to fetch property withdrawals");
    return unwrap<any[]>(result);
  },

  processWithdrawalRequest: async (id: number, data: { action: 'approve' | 'reject'; txid?: string; notes?: string }): Promise<any> => {
    const response = await apiRequest("POST", `/admin/flats/withdrawals/${id}/process`, data);
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to process withdrawal");
    return unwrap<any>(result);
  },
};
