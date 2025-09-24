/**
 * API Client for AfriConnect Backend Services
 * Handles all API communication with consistent error handling and authentication
 */

import { projectId, publicAnonKey } from '../supabase/info';
import { supabase } from '../supabase/client';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-8392ff4e`;

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}

export interface ApiClientConfig {
  baseURL?: string;
  defaultHeaders?: Record<string, string>;
  timeout?: number;
}

export class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;

  constructor(config: ApiClientConfig = {}) {
    this.baseURL = config.baseURL || API_BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
      ...config.defaultHeaders
    };
    this.timeout = config.timeout || 10000; // Reduced from 30s to 10s
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.defaultHeaders,
          ...options.headers
        },
        signal: controller.signal,
        // Add cache control to prevent caching issues
        cache: 'no-cache'
      });

      clearTimeout(timeoutId);

      // Handle empty responses
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch {
          data = null;
        }
      } else {
        data = null;
      }

      if (!response.ok) {
        return {
          success: false,
          error: data?.error || `HTTP ${response.status}: ${response.statusText}`,
          status: response.status
        };
      }

      return {
        success: true,
        data,
        status: response.status
      };

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.warn(`API request timeout for ${endpoint}`);
          return {
            success: false,
            error: 'Request timeout - please try again',
            status: 408
          };
        }
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          console.warn(`Network error for ${endpoint}:`, error.message);
          return {
            success: false,
            error: 'Network error - please check your connection',
            status: 0
          };
        }
        return {
          success: false,
          error: error.message,
          status: 0
        };
      }

      return {
        success: false,
        error: 'Unknown error occurred',
        status: 0
      };
    }
  }

  // Set authentication token (when user logs in)
  setAuthToken(token: string) {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Remove authentication token (when user logs out)
  clearAuthToken() {
    this.defaultHeaders['Authorization'] = `Bearer ${publicAnonKey}`;
  }

  // GET request
  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'GET',
      headers
    });
  }

  // POST request
  async post<T>(
    endpoint: string, 
    data?: any, 
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers
    });
  }

  // PUT request
  async put<T>(
    endpoint: string, 
    data?: any, 
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      headers
    });
  }

  // DELETE request
  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'DELETE',
      headers
    });
  }
}

// Create default API client instance with optimized settings
export const apiClient: ApiClient = new ApiClient({
  timeout: 8000, // 8 second timeout
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  }
});

// Create a fallback API client for development/testing
interface MockApiClient {
  get<T>(endpoint: string): Promise<ApiResponse<T>>;
  post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>>;
  put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>>;
  delete<T>(endpoint: string): Promise<ApiResponse<T>>;
}

export const mockApiClient: MockApiClient = {
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    console.warn(`Mock API call: GET ${endpoint}`);
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {} as T,
          status: 200
        });
      }, 500);
    });
  },
  
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    console.warn(`Mock API call: POST ${endpoint}`, data);
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          data: { message: 'Mock response' } as T,
          status: 200
        });
      }, 500);
    });
  },
  
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    console.warn(`Mock API call: PUT ${endpoint}`, data);
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          data: { message: 'Mock response' } as T,
          status: 200
        });
      }, 500);
    });
  },
  
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    console.warn(`Mock API call: DELETE ${endpoint}`);
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          data: { message: 'Mock response' } as T,
          status: 200
        });
      }, 500);
    });
  }
};

// Determine which client to use based on environment
const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost';
export const safeApiClient: ApiClient | MockApiClient = isDevelopment ? mockApiClient : apiClient;

// =============================================================================
// AUTHENTICATION API FUNCTIONS
// =============================================================================
export const authApi = {
  signUp: async (data: any) => {
    return apiClient.post('/auth/signup', data);
  },
  signIn: async (data: any) => {
    // Supabase handles sign-in on the client, this is for custom server logic if needed
    return supabase.auth.signInWithPassword(data);
  },
  signOut: async () => {
    return supabase.auth.signOut();
  }
};

// =============================================================================
// FR09 - RATINGS & REVIEWS API FUNCTIONS
// =============================================================================

export const reviewsApi = {
  // Submit product review
  submitProductReview: async (data: {
    productId: string;
    rating: number;
    comment?: string;
    verified_purchase?: boolean;
  }) => {
    return apiClient.post('/reviews/product', data);
  },

  // Submit seller review
  submitSellerReview: async (data: {
    sellerId: string;
    rating: number;
    comment?: string;
    categories?: {
      communication: number;
      shipping: number;
      item_as_described: number;
      overall: number;
    };
  }) => {
    return apiClient.post('/reviews/seller', data);
  },

  // Reply to review (seller only)
  replyToReview: async (data: {
    reviewId: string;
    response: string;
  }) => {
    return apiClient.post('/reviews/reply', data);
  },

  // Get product reviews
  getProductReviews: async (productId: string, page = 1, limit = 10) => {
    return apiClient.get(`/reviews/product/${productId}?page=${page}&limit=${limit}`);
  }
};

// =============================================================================
// FR10 - SECURITY & COMPLIANCE API FUNCTIONS
// =============================================================================

export const securityApi = {
  // Submit ID verification
  submitIdVerification: async (data: {
    id_type: string;
    id_number: string;
    document_images: string[];
    selfie_image?: string;
  }) => {
    return apiClient.post('/security/verify-id', data);
  },

  // Get verification status
  getVerificationStatus: async () => {
    return apiClient.get('/security/verification-status');
  },

  // Update privacy settings
  updatePrivacySettings: async (data: {
    data_sharing?: boolean;
    marketing_communications?: boolean;
    profile_visibility?: 'public' | 'private' | 'friends';
    activity_visibility?: 'public' | 'private' | 'friends';
  }) => {
    return apiClient.put('/security/privacy', data);
  }
};

// =============================================================================
// FR11 - ADMIN & MODERATION API FUNCTIONS
// =============================================================================

export const adminApi = {
  // Suspend user (admin only)
  suspendUser: async (data: {
    userId: string;
    reason: string;
    duration?: number; // days
  }) => {
    return apiClient.post('/admin/users/suspend', data);
  },

  // Moderate review (admin only)
  moderateReview: async (data: {
    reviewId: string;
    action: 'approved' | 'rejected' | 'hidden';
    reason?: string;
  }) => {
    return apiClient.put('/admin/reviews/moderate', data);
  },

  // Resolve escrow dispute (admin only)
  resolveEscrowDispute: async (data: {
    disputeId: string;
    resolution: string;
    buyerRefund?: number;
    sellerPayout?: number;
    adminNotes?: string;
  }) => {
    return apiClient.post('/admin/escrow/resolve', data);
  }
};

// =============================================================================
// FR12 - CUSTOMER CARE API FUNCTIONS
// =============================================================================

export const supportApi = {
  // Submit contact form
  submitContactForm: async (data: {
    name: string;
    email: string;
    subject: string;
    message: string;
    category?: string;
    priority?: 'low' | 'medium' | 'high';
  }) => {
    return apiClient.post('/support/contact', data);
  },

  // Chat with bot
  chatWithBot: async (data: {
    message: string;
    sessionId?: string;
    userId?: string;
  }) => {
    return apiClient.post('/support/chatbot', data);
  },

  // Escalate to live support
  escalateToSupport: async (data: {
    issue: string;
    category: string;
    urgency?: 'low' | 'medium' | 'high';
    contact_method?: 'email' | 'phone' | 'chat';
    phone?: string;
    email?: string;
    name?: string;
  }) => {
    return apiClient.post('/support/escalate', data);
  }
};

// =============================================================================
// FR13 - ORDER TRACKING API FUNCTIONS
// =============================================================================

export const trackingApi = {
  // Create tracking record (seller/admin)
  createTrackingRecord: async (data: {
    orderId: string;
    courierService: string;
    trackingNumber: string;
    estimatedDelivery?: string;
  }) => {
    return apiClient.post('/orders/track/create', data);
  },

  // Update tracking status
  updateTrackingStatus: async (data: {
    orderId: string;
    status: string;
    location?: string;
    description?: string;
    courierUpdate?: boolean;
  }) => {
    return apiClient.put('/orders/track/update', data);
  },

  // Get tracking information
  getTrackingInfo: async (orderId: string) => {
    return apiClient.get(`/orders/track/${orderId}`);
  },

  // Get delivery updates for user
  getDeliveryUpdates: async () => {
    return apiClient.get('/orders/delivery-updates');
  },

  // Webhook for courier integration (internal use)
  processCourierWebhook: async (data: {
    tracking_number: string;
    status: string;
    location?: string;
    timestamp?: string;
    courier_service?: string;
  }) => {
    return apiClient.post('/orders/courier-webhook', data);
  }
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

// Utility functions
export function handleApiResponse<T>(response: ApiResponse<T>): T {
  if (response.success) {
    return response.data as T;
  } else {
    throw new Error(response.error || 'API request failed');
  }
}

export function formatErrorMessage(error: any): string {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error) return error.error;
  return 'An unexpected error occurred';
}

export function isAuthenticated(): boolean {
  const authHeader = (apiClient as any).defaultHeaders['Authorization'];
  return authHeader !== `Bearer ${publicAnonKey}`;
}

export async function retryApiCall<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<ApiResponse<T>> {
  let lastError: ApiResponse<T>;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await apiCall();
      if (result.success || result.status < 500) {
        return result; // Don't retry client errors (4xx)
      }
      lastError = result;
    } catch (error) {
      lastError = {
        success: false,
        error: formatErrorMessage(error),
        status: 0
      };
    }

    if (attempt < maxRetries) {
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return lastError!;
}

export const apiUtils = {
  handleApiResponse,
  formatErrorMessage,
  isAuthenticated,
  retryApiCall
};

export default apiClient;
