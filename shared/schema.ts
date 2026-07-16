// MongoDB-style schema definitions for client-side type safety
// These match the backend models but are simplified for client use

export interface User {
  _id?: string;
  id: number;
  fullName: string;
  username: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  walletAddress?: string;
  role: 'user' | 'admin';
  referralCode: string;
  referredBy?: number;
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  leftVolume?: string;
  rightVolume?: string;
  placementId?: number;
  placementPosition?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  securityQuestions?: SecurityQuestion[];
}

export interface Investment {
  _id?: string;
  id: number;
  userId: number | User;
  amount: number;
  plan: '6months' | '12months' | '18months';
  paymentMethod: 'usdt_trc20';
  transactionProof?: string;
  notes?: string;
  status: 'pending' | 'active' | 'maturing' | 'completed' | 'cancelled';
  roiRate: number;
  maturityDate?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Withdrawal {
  _id?: string;
  id: number;
  userId: number;
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
  paymentProof?: string;
  notes?: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  txid?: string;
  processedBy?: string;
  processedAt?: Date;
  rejectedReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Commission {
  _id?: string;
  id: number;
  userId: number;
  fromUserId: number;
  investmentId: number;
  level: number;
  amount: number;
  type: 'direct' | 'unilevel';
  status: 'unpaid' | 'paid';
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  _id?: string;
  id: number;
  userId: number;
  type: 'investment' | 'withdrawal' | 'user' | 'system';
  title: string;
  message: string;
  status: 'unread' | 'read';
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  _id?: string;
  id: string;
  userId: number;
  expiresAt: Date;
  createdAt: Date;
}

// Form data interfaces for API requests
export interface Reward {
  id: number;
  name: string;
  requiredVolumePkr: string;
  rewardAmountPkr: string;
  description: string | null;
  createdAt: string;
}

export interface InsertReward {
  name: string;
  requiredVolumePkr: string;
  rewardAmountPkr: string;
  description?: string;
}

export interface InsertUser {
  fullName: string;
  username: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  referralCode?: string;
  securityQuestions: SecurityQuestion[];
}

export interface InsertInvestment {
  amount: number;
  plan: '6months' | '12months' | '18months';
  paymentMethod: 'usdt_trc20';
  transactionProof?: File;
  notes?: string;
}

export interface InsertWithdrawal {
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
}

// Authentication interfaces
export interface LoginData {
  emailOrUsername: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  user: User;
  sessionId?: string; // ✅ add this
  token?: string;     // optional if still used elsewhere
  message?: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  userId?: string;
  otp?: string;
  newPassword: string;
  confirmPassword: string;
}

// Dashboard Stats interface
export interface DashboardStats {
  investmentAmount: number;
  unpaidROI: number;
  unpaidCommissions: number;
  directCommissions: number;
  totalCommissions: number;
  exchangeRate?: number;
  paidCommissions: number;
  totalReferrals: number;
  activeReferrals: number;
  referralLink: string;
  referralCode: string;
  investmentPercentage: string;
  commissionPercentage: string;
  roiPercentage: string;
  referralPercentage: string;
  investmentGrowth: string;
  totalSystemInvestment: number;
  totalSystemCommissions: number;
  totalSystemUsers: number;
  totalInvested: number;
  totalWithdrawn: number;
  activeInvestments: number;
  pendingInvestments: number;
  completedInvestments: number;
  pendingWithdrawals: number;
  completedWithdrawals: number;
  rejectedWithdrawals: number;
  totalROI: number;
  totalCommissionWithdrawn: number;
  totalPrincipalWithdrawn: number;
  withdrawalPercentage: string;
  roiEstimation: number;
  recentInvestments: any[];
  recentWithdrawals: any[];
  currentBalance: number;
  averageDailyProfit: number;
  availableCommission: number;
  availableROI: number;
  availablePrincipal: number;
  totalBalance: number;
  dailyROI: number;
  totalCreditedROI: number; // Total daily ROI earned
  roiWithdrawn: number; // Total ROI withdrawn
  leftVolume?: number;
  rightVolume?: number;
  matchedVolume?: number;
}

// API Response wrapper
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  data?: T;
  error?: string;
}

// Pagination interface
export interface PaginatedResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

// Genealogy interfaces
export type GenealogyNode = {
  _id?: string;
  id: number;
  fullName: string;
  username: string;
  email: string;
  profilePicture?: string;
  referralCode?: string;
  isActive: boolean;
  level: number;
  investmentAmount: number;
  commissionAmount: number;
  roiAmount?: number;
  balance: number;
  leftVolume?: number;
  rightVolume?: number;
  placementPosition?: 'left' | 'right' | null;
  commissionForRoot: number;
  commissionForRootDetails: Array<{
    investmentAmount: number;
    date: string;
    rate: number;
    commissionAmount: number;
  }>;
  children: GenealogyNode[];
};

export interface GenealogyTree {
  user: GenealogyNode;
  children: GenealogyNode[];
  maxLevel: number;
}

// Admin interfaces
export interface AdminStats {
  users: {
    total: number;
    active: number;
    newThisMonth: number;
  };
  investments: {
    total: number;
    pending: number;
    active: number;
  };
  withdrawals: {
    total: number;
    pending: number;
    completed: number;
  };
  commissions: {
    total: number;
    unpaid: number;
  };
  revenue: {
    total: number;
    thisMonth: number;
  };
}

// Log interfaces
export interface LogEntry {
  _id: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  userId?: string;
  action?: string;
  details?: any;
  timestamp: Date;
  ip?: string;
  userAgent?: string;
}

export const SECURITY_QUESTIONS = [
  "What is your favorite city?",
  "What was the name of your first school?",
  "What is your favorite  food?",
  "What is the name of your childhood best friend?",
  "What is your father's birthplace?",
  "What is your favorite cricket team?",
  "What is your favorite festival?",
  "What is the name of your first teacher?",
  "Who is your favorite singer?"
];

export interface SecurityQuestion {
  question: string;
  answer: string;
}
