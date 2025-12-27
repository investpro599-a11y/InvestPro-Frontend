import { apiRequest } from '../queryClient';

// Define the API response type
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export enum RewardStatus {
  LOCKED = 'locked',
  UNLOCKED = 'unlocked',
  CLAIMED = 'claimed'
}

export interface RewardRequirements {
  leftLegRequired: number;
  rightLegRequired: number;
  [key: string]: any; // For future requirements
}

export interface RewardProgress {
  leftLegCompleted: number;
  rightLegCompleted: number;
  [key: string]: any; // For future progress tracking
}

export interface RewardBase {
  name: string;
  description: string | null;
  value: number;
  level: number; // 1-6
  orderInLevel: number; // Order within the level
  imageUrl: string | null;
  isActive: boolean;
  requirements: RewardRequirements;
}

export interface UserClaim {
  userId: string;
  username: string;
  email: string;
  claimedAt?: string;
}

export interface Reward extends RewardBase {
  _id: string;
  id?: string; // For backward compatibility
  userStatus?: RewardStatus;
  userProgress?: RewardProgress;
  unlockedAt?: string;
  claimedAt?: string;
  claims?: UserClaim[]; // Array of user claims for admin view
  isLocked?: boolean; // Computed field for UI convenience
  isUnlocked?: boolean; // Computed field for UI convenience
  isClaimed?: boolean; // Computed field for UI convenience
  progressPercentage?: number; // 0-100
  createdAt: string;
  updatedAt: string;
}

export interface LevelRewards {
  level: number;
  isLocked: boolean;
  isCompleted: boolean;
  isActive?: boolean; // Current active level (unlocked but not completed)
  exists?: boolean;   // Whether this level has any rewards defined
  progress: number;   // 0-100
  rewards: Reward[];
}

export interface UserRewardProgress {
  totalLevels: number;
  completedLevels: number;
  currentLevel: number;
  progressPercentage: number;
  levels: LevelRewards[];
}

export interface RewardResponse {
  success: boolean;
  message?: string;
  data?: {
    rewards?: Reward[];
  };
  rewards?: Reward[];
}

export interface RewardClaimResponse {
  success: boolean;
  message: string;
  reward?: Reward;
}

async function handleApiRequest<T>(method: string, url: string, data?: unknown): Promise<T> {
  // Check for undefined or invalid ID in URL
  if (url.includes('/undefined')) {
    throw new Error('Invalid or missing ID in request');
  }
  
  const response = await apiRequest(method, url, data);
  
  // Handle empty responses for DELETE requests
  if (method === 'DELETE' && response.status === 204) {
    return {} as T;
  }
  
  // For other requests, try to parse JSON
  try {
    const responseText = await response.text();
    return responseText ? JSON.parse(responseText) : {} as T;
  } catch (error) {
    console.error('Error parsing response:', error);
    throw new Error('Failed to parse server response');
  }
}

export const rewardApi = {
  // User endpoints
  getRewards: async (): Promise<Reward[]> => {
    try {
      console.log('Fetching user rewards...');
      const response = await handleApiRequest<any>('GET', '/rewards');
      console.log('Raw user rewards response:', JSON.stringify(response, null, 2));
      
      // Handle different possible response structures
      if (!response) {
        console.warn('Empty response received from /rewards');
        return [];
      }
      
      // Case 1: Direct array of rewards
      if (Array.isArray(response)) {
        console.log('Returning direct array of user rewards');
        return response;
      }
      
      // Case 2: Response has a data property containing rewards
      if (response.data) {
        // Case 2a: data.rewards exists and is an array
        if (response.data.rewards && Array.isArray(response.data.rewards)) {
          console.log('Returning user rewards from response.data.rewards');
          return response.data.rewards;
        }
        // Case 2b: data is directly an array
        if (Array.isArray(response.data)) {
          console.log('Returning user rewards from response.data');
          return response.data;
        }
      }
      
      // Case 3: Response has a rewards property that's an array
      if (response.rewards && Array.isArray(response.rewards)) {
        console.log('Returning user rewards from response.rewards');
        return response.rewards;
      }
      
      console.warn('Could not find rewards array in user response. Full response:', response);
      return [];
    } catch (error) {
      console.error('Error fetching user rewards:', error);
      return [];
    }
  },

  // Admin endpoints
  admin: {
    // Get all rewards with user claims for admin
    getRewardsWithClaims: async (): Promise<{ rewards: Reward[] }> => {
      const response = await handleApiRequest<{ data: { rewards: Reward[] } }>('GET', 'rewards/admin/with-claims');
      return { rewards: response?.data?.rewards || [] };
    },

    getRewards: async (): Promise<Reward[]> => {
      try {
        console.log('Fetching admin rewards...');
        const response = await handleApiRequest<any>('GET', 'admin/rewards');
        console.log('Raw admin rewards response:', JSON.stringify(response, null, 2));
        
        // Handle different possible response structures
        if (!response) {
          console.warn('Empty response received from admin/rewards');
          return [];
        }
        
        // Case 1: Direct array of rewards
        if (Array.isArray(response)) {
          console.log('Returning direct array of rewards');
          return response;
        }
        
        // Case 2: Response has a data property containing rewards
        if (response.data) {
          // Case 2a: data.rewards exists and is an array
          if (response.data.rewards && Array.isArray(response.data.rewards)) {
            console.log('Returning rewards from response.data.rewards');
            return response.data.rewards;
          }
          // Case 2b: data is directly an array
          if (Array.isArray(response.data)) {
            console.log('Returning rewards from response.data');
            return response.data;
          }
        }
        
        // Case 3: Response has a rewards property that's an array
        if (response.rewards && Array.isArray(response.rewards)) {
          console.log('Returning rewards from response.rewards');
          return response.rewards;
        }
        
        console.warn('Could not find rewards array in response. Full response:', response);
        return [];
      } catch (error) {
        console.error('Error fetching admin rewards:', error);
        return [];
      }
    },

    getReward: async (id: string | undefined): Promise<Reward | null> => {
      if (!id) {
        console.error('No reward ID provided');
        return null;
      }
      try {
        console.log(`Fetching reward with ID: ${id}`);
        const response = await handleApiRequest<{ data: { reward: Reward } }>('GET', `admin/rewards/${id}`);
        console.log('Raw API response for reward:', response);
        
        // Check if the response has the expected nested structure
        if (response?.data?.reward) {
          console.log('Extracted reward data:', response.data.reward);
          return response.data.reward;
        }
        
        console.warn('Unexpected response format:', response);
        return null;
      } catch (error) {
        console.error('Error fetching reward:', error);
        return null;
      }
    },

    createReward: async (data: RewardBase): Promise<Reward> => {
      // Use a relative URL without the /api prefix to be consistent with other endpoints
      return await handleApiRequest<Reward>('POST', 'admin/rewards', data);
    },

    updateReward: async (id: string, data: Partial<RewardBase>): Promise<Reward> => {
      console.log('Updating reward with ID:', id, 'Data:', data);
      try {
        const response = await handleApiRequest<{ data: { reward: Reward } }>('PATCH', `admin/rewards/${id}`, data);
        console.log('Update response:', response);
        if (response?.data?.reward) {
          return response.data.reward;
        }
        throw new Error('Invalid response format from server');
      } catch (error) {
        console.error('Error in updateReward:', error);
        throw error;
      }
    },

    deleteReward: async (id: string): Promise<void> => {
      try {
        await handleApiRequest('DELETE', `/admin/rewards/${id}`);
      } catch (error: any) {
        // If the error is 404 (Not Found), it means the reward was already deleted
        if (error?.response?.status === 404) {
          console.log('Reward not found, assuming it was already deleted');
          return; // Resolve the promise since the reward is already deleted
        }
        throw error; // Re-throw other errors
      }
    },
  },

  // Get rewards with user progress
  getUserRewards: async (): Promise<{ rewards: Reward[] }> => {
    return handleApiRequest<{ rewards: Reward[] }>('GET', '/rewards');
  },

  // Claim a reward
  claimReward: async (rewardId: string): Promise<RewardClaimResponse> => {
    return handleApiRequest<RewardClaimResponse>('POST', `/rewards/${rewardId}/claim`);
  },

  // Get reward history for the current user
  getRewardHistory: async (): Promise<{ rewards: Reward[] }> => {
    const response = await handleApiRequest<{ rewards: Reward[] }>('GET', '/rewards/history');
    return { rewards: response.rewards || [] };
  },
};

export default rewardApi;
