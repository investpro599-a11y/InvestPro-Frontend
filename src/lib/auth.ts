import type { 
  User, 
  LoginData, 
  InsertUser, 
  AuthResponse, 
  ForgotPasswordData, 
  ResetPasswordData,
  ApiResponse,
  SecurityQuestion
} from "../../shared/schema";

export type { LoginData };

export const authApi = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const response = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emailOrUsername: data.emailOrUsername,
        password: data.password
      }),
      credentials: 'include',
    });


    const result = await response.json();
    console.log("API RESULT:", result);
    console.log("API RESULT DATA:", result.data);

    if (!response.ok) {
      throw new Error(result.message || "Login failed");
    }

    // Handle both wrapped { data: { user, token } } and unwrapped { user, sessionId } responses
    const responseData: AuthResponse = result.data ?? result;

    // Store token or sessionId — backend returns sessionId, not a JWT token
    const tokenToStore = responseData?.token || responseData?.sessionId;
    if (tokenToStore) {
      localStorage.setItem('authToken', tokenToStore);
    }

    // Also set the user in query cache immediately so isAuthenticated becomes true
    // without waiting for the /auth/me query to re-run
    return responseData;
  },

  signup: async (data: InsertUser): Promise<AuthResponse> => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    console.log('Signup request data:', { ...data, password: '[HIDDEN]' });
    console.log('Signup URL:', `${baseUrl}/auth/signup`);
    
    try {
      const response = await fetch(`${baseUrl}/auth/signup`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          fullName: data.fullName,
          username: data.username,
          email: data.email,
          phone: data.phone,
          password: data.password,
          confirmPassword: data.confirmPassword,
          referralCode: data.referralCode,
          securityQuestions: data.securityQuestions
        }),
        credentials: 'include',
      });
      
      console.log('Signup response status:', response.status);
      console.log('Signup response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Signup error response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          console.error('Failed to parse error response as JSON:', e);
          throw new Error(`Signup failed: ${response.status} ${response.statusText}`);
        }
        
        throw new Error(errorData.message || `Signup failed: ${response.status}`);
      }
      
      const result: ApiResponse<AuthResponse> = await response.json();
      console.log('Signup response data:', result);
      
      // Handle both wrapped { status, data } and unwrapped { message, userId } responses
      const responseData = result.data ?? (result as any);
      
      // Store token if present
      if (responseData?.token) {
        localStorage.setItem('authToken', responseData.token);
      }
      
      return responseData;
    } catch (error: any) {
      console.error('Signup fetch error:', error);
      
      // Handle network errors specifically
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      
      // Handle timeout errors
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      
      // Re-throw the error if it's already an Error object
      if (error instanceof Error) {
        throw error;
      }
      
      // Handle other types of errors
      throw new Error(error.message || 'Signup failed. Please try again.');
    }
  },

  logout: async (): Promise<void> => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const token = localStorage.getItem('authToken');
    
    if (token) {
      try {
        await fetch(`${baseUrl}/auth/logout`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          credentials: 'include',
        });
      } catch (error) {
        console.error('Logout API call failed:', error);
      }
    }
    
    localStorage.removeItem('authToken');
  },

  me: async (): Promise<User> => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${baseUrl}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include',
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to get user data");
    }

    // Handle both wrapped { data: { ...user } } and unwrapped { ...user } responses
    return (result.data ?? result) as User;
  },

  // Forgot password functionality
  requestPasswordReset: async (data: ForgotPasswordData & { method: 'email' | 'security' }): Promise<{ message: string; userId?: string }> => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const response = await fetch(`${baseUrl}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    const result: ApiResponse<{ message: string; userId?: string }> = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Failed to request password reset");
    }
    return result.data!;
  },

  getUserIdByEmail: async (email: string): Promise<string> => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const response = await fetch(`${baseUrl}/auth/user-id-by-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const result: ApiResponse<{ userId: string }> = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'User not found');
    }
    return result.data!.userId;
  },

  getSecurityQuestions: async (userId: string): Promise<SecurityQuestion[]> => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const response = await fetch(`${baseUrl}/auth/security-questions/${userId}`);
    const result: ApiResponse<SecurityQuestion[]> = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch security questions');
    }
    return result.data!;
  },

  verifySecurityAnswers: async (userId: string, answers: string[]): Promise<void> => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const response = await fetch(`${baseUrl}/auth/verify-security-answers/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    });
    const result: ApiResponse = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Security answers verification failed');
    }
  },

  resetPassword: async (data: ResetPasswordData): Promise<{ message: string }> => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const response = await fetch(`${baseUrl}/auth/reset-password/${data.userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        otp: data.otp,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword
      }),
      credentials: 'include',
    });
    
    const result: ApiResponse<{ message: string }> = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || "Failed to reset password");
    }
    
    return result.data!;
  },

  resendPasswordResetOtp: async (userId: string): Promise<{ message: string }> => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const response = await fetch(`${baseUrl}/auth/resend-password-reset-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
      credentials: 'include',
    });
    
    const result: ApiResponse<{ message: string }> = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || "Failed to resend OTP");
    }
    
    return result.data!;
  },

  // Email verification
  verifyEmail: async (token: string): Promise<{ message: string }> => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const response = await fetch(`${baseUrl}/auth/verify-email/${token}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
    });
    
    const result: ApiResponse<{ message: string }> = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || "Failed to verify email");
    }
    
    return result.data!;
  },

  resendEmailVerification: async (): Promise<{ message: string }> => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${baseUrl}/auth/resend-verification`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      credentials: 'include',
    });
    
    const result: ApiResponse<{ message: string }> = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || "Failed to resend verification email");
    }
    
    return result.data!;
  },

  // Update password
  updatePassword: async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${baseUrl}/auth/update-password`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        currentPassword,
        newPassword
      }),
      credentials: 'include',
    });
    
    const result: ApiResponse<{ message: string }> = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || "Failed to update password");
    }
    
    return result.data!;
  },

  resetPasswordWithToken: async (token: string, newPassword: string, confirmPassword: string): Promise<{ message: string }> => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const response = await fetch(`${baseUrl}/auth/reset-password/${token}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword, confirmPassword }),
      credentials: 'include',
    });
    const result: ApiResponse<{ message: string }> = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Failed to reset password");
    }
    return result.data!;
  },
};
