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
      const err = new Error(result.message || "Login failed");
      if (result.requiresVerification) {
        (err as any).requiresVerification = true;
        (err as any).email = result.email;
      }
      throw err;
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

  
  verifyEmail: async (data: { email: string; otp: string }) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const response = await fetch(`${baseUrl}/auth/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Verification failed");
    if (result.sessionId) localStorage.setItem('authToken', result.sessionId);
    return result;
  },

  resendOtp: async (email: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const response = await fetch(`${baseUrl}/auth/resend-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      credentials: 'include',
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to resend code");
    return result;
  },

  verifySignupOtp: async (data: { email: string; otp: string }) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const response = await fetch(`${baseUrl}/auth/verify-signup-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to verify signup code");
    return result;
  },

  forgotPassword: async (email: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const response = await fetch(`${baseUrl}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      credentials: 'include',
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to send reset link");
    return result;
  },
  verifyResetOtp: async (data: { email: string; otp: string }) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const response = await fetch(`${baseUrl}/auth/verify-reset-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to verify code");
    return result;
  },


  resetPassword: async (data: { email: string; otp: string; newPassword: string }) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const response = await fetch(`${baseUrl}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to reset password");
    return result;
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
};
