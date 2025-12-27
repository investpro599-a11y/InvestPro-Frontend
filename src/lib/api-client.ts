import type { 
  ApiResponse, 
  User, 
  Investment, 
  Withdrawal, 
  Notification,
  DashboardStats,
  GenealogyTree,
  AdminStats,
  LogEntry
} from "../../shared/schema";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

class ApiClient {
  private getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = this.getAuthHeaders();
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData: ApiResponse = await response.json().catch(() => ({
        status: 'error',
        message: response.statusText,
      }));
      
      const error = new Error(errorData.message || response.statusText);
      (error as any).status = response.status;
      throw error;
    }

    const result: ApiResponse<T> = await response.json();
    return result.data!;
  }

  // Authentication
  async login(emailOrUsername: string, password: string) {
    return this.request<{ user: User; token: string; message?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ emailOrUsername, password }),
    });
  }

  async signup(userData: {
    fullName: string;
    username: string;
    email: string;
    phone?: string;
    password: string;
    referralCode?: string;
  }) {
    return this.request<{ user: User; token: string; message?: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    return this.request<void>('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return this.request<User>('/auth/me');
  }

  async forgotPassword(email: string) {
    return this.request<{ message: string; userId: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(userId: string, otp: string, newPassword: string, confirmPassword: string) {
    return this.request<{ message: string }>(`/auth/reset-password/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({ otp, newPassword, confirmPassword }),
    });
  }

  // Investments
  async getInvestments() {
    return this.request<Investment[]>('/investments');
  }

  async getInvestment(id: string) {
    return this.request<Investment>(`/investments/${id}`);
  }

  async createInvestment(data: FormData | {
    amount: number;
    plan: '6months' | '12months' | '18months';
    paymentMethod: 'usdt_trc20';
    notes?: string;
  }) {
    const options: RequestInit = {
      method: 'POST',
    };

    if (data instanceof FormData) {
      options.body = data;
      delete (options.headers as any)['Content-Type']; // Let browser set it for FormData
    } else {
      options.body = JSON.stringify(data);
    }

    return this.request<Investment>('/investments', options);
  }

  async updateInvestment(id: string, data: Partial<Investment>) {
    return this.request<Investment>(`/investments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteInvestment(id: string) {
    return this.request<{ success: boolean }>(`/investments/${id}`, {
      method: 'DELETE',
    });
  }

  // Withdrawals
  async getWithdrawals() {
    return this.request<Withdrawal[]>('/withdrawals');
  }

  async getWithdrawal(id: string) {
    return this.request<Withdrawal>(`/withdrawals/${id}`);
  }

  async createWithdrawal(data: {
    amount: number;
    type: 'roi' | 'commission' | 'principal';
    method: 'easypaisa' | 'jazzcash' | 'bank_account' | 'trc20' | 'others';
    phoneNumber?: string;
    accountNumber?: string;
    bankName?: string;
    trcId?: string;
    accountName?: string;
    platform?: string;
    walletAddress?: string;
    notes?: string;
  }) {
    return this.request<Withdrawal>('/withdrawals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateWithdrawal(id: string, data: Partial<Withdrawal>) {
    return this.request<Withdrawal>(`/withdrawals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteWithdrawal(id: string) {
    return this.request<{ success: boolean }>(`/withdrawals/${id}`, {
      method: 'DELETE',
    });
  }

  // Profile
  async getProfile() {
    return this.request<User>('/users/profile');
  }

  async updateProfile(data: Partial<User>) {
    return this.request<User>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return this.request<{ avatarUrl: string }>('/users/profile/avatar', {
      method: 'POST',
      body: formData,
    });
  }

  // Notifications
  async getNotifications() {
    return this.request<Notification[]>('/notifications');
  }

  async getUnreadNotifications() {
    return this.request<Notification[]>('/notifications/unread');
  }

  async markNotificationAsRead(id: string) {
    return this.request<Notification>(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead() {
    return this.request<{ success: boolean }>('/notifications/read-all', {
      method: 'PUT',
    });
  }

  async deleteNotification(id: string) {
    return this.request<{ success: boolean }>(`/notifications/${id}`, {
      method: 'DELETE',
    });
  }

  // Genealogy
  async getGenealogyTree(userId?: string) {
    const endpoint = userId ? `/genealogy/${userId}` : '/genealogy';
    return this.request<GenealogyTree>(endpoint);
  }

  async getTeamMembers() {
    return this.request<User[]>('/genealogy/team-members');
  }

  async getReferrals() {
    return this.request<User[]>('/genealogy/referrals');
  }

  // Commissions
  async getCommissions() {
    return this.request<any[]>('/commissions');
  }

  async getEarnings() {
    return this.request<any>('/commissions/earnings');
  }

  // Dashboard
  async getDashboardStats() {
    return this.request<DashboardStats>('/dashboard/stats');
  }

  async getInvestmentChart(period: string = '30D') {
    return this.request<any>(`/dashboard/investment-chart?period=${period}`);
  }

  // Admin
  async getAdminStats() {
    return this.request<AdminStats>('/admin/stats');
  }

  async getPendingInvestments() {
    return this.request<Investment[]>('/admin/investments/pending');
  }

  async approveInvestment(id: string) {
    return this.request<Investment>(`/admin/investments/${id}/approve`, {
      method: 'PUT',
    });
  }

  async rejectInvestment(id: string, reason?: string) {
    return this.request<Investment>(`/admin/investments/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  async getPendingWithdrawals() {
    return this.request<Withdrawal[]>('/admin/withdrawals/pending');
  }

  async approveWithdrawal(id: string, txid: string, paymentProof?: string) {
    return this.request<Withdrawal>(`/admin/withdrawals/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ txid, paymentProof }),
    });
  }

  async rejectWithdrawal(id: string, reason?: string) {
    return this.request<Withdrawal>(`/admin/withdrawals/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  async getUsers() {
    return this.request<User[]>('/admin/users');
  }

  async getUser(id: string) {
    return this.request<User>(`/admin/users/${id}`);
  }

  async toggleUserStatus(id: string) {
    return this.request<{ success: boolean; user: User; message: string }>(`/admin/users/${id}/toggle-status`, {
      method: 'PUT',
    });
  }

  async deleteUser(id: string) {
    return this.request<{ success: boolean }>(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  async getAllInvestments() {
    return this.request<Investment[]>('/admin/investments');
  }

  async getAllWithdrawals() {
    return this.request<Withdrawal[]>('/admin/withdrawals');
  }

  async getLogs(filter?: string) {
    const endpoint = filter ? `/admin/logs?filter=${filter}` : '/admin/logs';
    return this.request<LogEntry[]>(endpoint);
  }

  // File Upload
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.request<{ filename: string; url: string; size: number }>('/upload', {
      method: 'POST',
      body: formData,
    });
  }

  // Database Config
  async getCollections() {
    return this.request<any[]>('/admin/db/collections');
  }

  async getDocuments(collection: string, page: number, limit: number) {
    return this.request<any>(`/admin/db/collection/${collection}?page=${page}&limit=${limit}`);
  }

  async addDocument(collection: string, doc: any) {
    return this.request<any>(`/admin/db/collection/${collection}`, {
      method: 'POST',
      body: JSON.stringify(doc),
    });
  }

  async updateDocument(collection: string, id: string, doc: any) {
    return this.request<any>(`/admin/db/collection/${collection}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(doc),
    });
  }

  async deleteDocument(collection: string, id: string) {
    return this.request<{ success: boolean }>(`/admin/db/collection/${collection}/${id}`, {
      method: 'DELETE',
    });
  }

  async importDocuments(collection: string, docs: any[]) {
    return this.request<any>(`/admin/db/collection/${collection}/import`, {
      method: 'POST',
      body: JSON.stringify({ documents: docs }),
    });
  }
}

export const apiClient = new ApiClient(); 