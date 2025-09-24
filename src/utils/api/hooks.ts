/**
 * React Hooks for AfriConnect API Integration
 * Provides easy-to-use hooks for all API functionality with loading states and error handling
 */

import { useState, useEffect, useCallback } from 'react';
import { safeApiClient, reviewsApi, securityApi, adminApi, supportApi, trackingApi, formatErrorMessage, authApi } from './client';

// =============================================================================
// GENERIC HOOKS
// =============================================================================

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseApiMutation<T, P = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
  mutate: (params: P) => Promise<T | null>;
  reset: () => void;
}

// Generic hook for API calls with timeout protection
export function useApi<T>(
  apiCall: () => Promise<any>,
  dependencies: any[] = [],
  options: { enabled?: boolean; fallbackData?: T } = {}
): UseApiState<T> {
  const [data, setData] = useState<T | null>(options.fallbackData || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (options.enabled === false) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Add timeout protection
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 15000);
      });
      
      const response = await Promise.race([apiCall(), timeoutPromise]);
      
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.error || 'API call failed');
        // Use fallback data if available
        if (options.fallbackData) {
          setData(options.fallbackData);
        }
      }
    } catch (err) {
      const errorMessage = formatErrorMessage(err);
      setError(errorMessage);
      console.warn('API call failed:', errorMessage);
      
      // Use fallback data on error
      if (options.fallbackData) {
        setData(options.fallbackData);
      }
    } finally {
      setLoading(false);
    }
  }, [...dependencies, options.enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}

// Generic hook for API mutations (POST, PUT, DELETE)
export function useApiMutation<T, P = any>(
  apiCall: (params: P) => Promise<any>
): UseApiMutation<T, P> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (params: P): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall(params);
      if (response.success || (response.data && !response.error)) { // Handle Supabase auth response
        const responseData = response.data?.user || response.data;
        setData(responseData);
        return responseData;
      } else {
        setError(response.error?.message || response.error || 'API call failed');
        return null;
      }
    } catch (err) {
      setError(formatErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    mutate,
    reset
  };
}

// =============================================================================
// AUTHENTICATION HOOKS
// =============================================================================

export function useSignUp() {
  return useApiMutation(authApi.signUp);
}

export function useSignIn() {
  return useApiMutation(authApi.signIn);
}


// =============================================================================
// FR09 - RATINGS & REVIEWS HOOKS
// =============================================================================

export function useProductReviews(productId: string, page = 1, limit = 10) {
  return useApi(
    () => reviewsApi.getProductReviews(productId, page, limit),
    [productId, page, limit]
  );
}

export function useSubmitProductReview() {
  return useApiMutation(reviewsApi.submitProductReview);
}

export function useSubmitSellerReview() {
  return useApiMutation(reviewsApi.submitSellerReview);
}

export function useReplyToReview() {
  return useApiMutation(reviewsApi.replyToReview);
}

// Custom hook for managing review form state
export function useReviewForm(type: 'product' | 'seller') {
  const [formData, setFormData] = useState({
    rating: 0,
    comment: '',
    categories: {
      communication: 0,
      shipping: 0,
      item_as_described: 0,
      overall: 0
    }
  });

  const submitProductReview = useSubmitProductReview();
  const submitSellerReview = useSubmitSellerReview();

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateCategory = (category: string, rating: number) => {
    setFormData(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: rating
      }
    }));
  };

  const submitReview = async (targetId: string) => {
    if (type === 'product') {
      return await submitProductReview.mutate({
        productId: targetId,
        rating: formData.rating,
        comment: formData.comment
      });
    } else {
      return await submitSellerReview.mutate({
        sellerId: targetId,
        rating: formData.rating,
        comment: formData.comment,
        categories: formData.categories
      });
    }
  };

  const reset = () => {
    setFormData({
      rating: 0,
      comment: '',
      categories: {
        communication: 0,
        shipping: 0,
        item_as_described: 0,
        overall: 0
      }
    });
    submitProductReview.reset();
    submitSellerReview.reset();
  };

  return {
    formData,
    updateField,
    updateCategory,
    submitReview,
    reset,
    loading: submitProductReview.loading || submitSellerReview.loading,
    error: submitProductReview.error || submitSellerReview.error
  };
}

// =============================================================================
// FR10 - SECURITY & COMPLIANCE HOOKS
// =============================================================================

export function useVerificationStatus() {
  return useApi(() => securityApi.getVerificationStatus());
}

export function useSubmitIdVerification() {
  return useApiMutation(securityApi.submitIdVerification);
}

export function useUpdatePrivacySettings() {
  return useApiMutation(securityApi.updatePrivacySettings);
}

// Custom hook for KYC verification process
export function useKycVerification() {
  const [step, setStep] = useState(1);
  const [verificationData, setVerificationData] = useState({
    id_type: '',
    id_number: '',
    document_images: [] as string[],
    selfie_image: ''
  });

  const submitVerification = useSubmitIdVerification();
  const verificationStatus = useVerificationStatus();

  const updateVerificationData = (field: string, value: any) => {
    setVerificationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const submitKyc = async () => {
    const result = await submitVerification.mutate(verificationData);
    if (result) {
      await verificationStatus.refetch();
    }
    return result;
  };

  return {
    step,
    verificationData,
    updateVerificationData,
    nextStep,
    prevStep,
    submitKyc,
    loading: submitVerification.loading,
    error: submitVerification.error,
    status: verificationStatus.data
  };
}

// =============================================================================
// FR11 - ADMIN & MODERATION HOOKS
// =============================================================================

export function useSuspendUser() {
  return useApiMutation(adminApi.suspendUser);
}

export function useModerateReview() {
  return useApiMutation(adminApi.moderateReview);
}

export function useResolveEscrowDispute() {
  return useApiMutation(adminApi.resolveEscrowDispute);
}

// Custom hook for admin dashboard functionality
export function useAdminDashboard() {
  const suspendUser = useSuspendUser();
  const moderateReview = useModerateReview();
  const resolveDispute = useResolveEscrowDispute();

  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [actionData, setActionData] = useState<any>({});

  const performAction = async (action: string, data: any) => {
    setSelectedAction(action);
    setActionData(data);

    let result = null;
    switch (action) {
      case 'suspend_user':
        result = await suspendUser.mutate(data);
        break;
      case 'moderate_review':
        result = await moderateReview.mutate(data);
        break;
      case 'resolve_dispute':
        result = await resolveDispute.mutate(data);
        break;
    }

    if (result) {
      setSelectedAction(null);
      setActionData({});
    }

    return result;
  };

  return {
    performAction,
    selectedAction,
    actionData,
    loading: suspendUser.loading || moderateReview.loading || resolveDispute.loading,
    error: suspendUser.error || moderateReview.error || resolveDispute.error
  };
}

// =============================================================================
// FR12 - CUSTOMER CARE HOOKS
// =============================================================================

export function useSubmitContactForm() {
  return useApiMutation(supportApi.submitContactForm);
}

export function useChatbot() {
  const [messages, setMessages] = useState<Array<{
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
    actions?: Array<{ type: string; label: string; target: string }>;
  }>>([]);
  const [sessionId, setSessionId] = useState<string>('');

  const sendMessage = useCallback(async (message: string, userId?: string) => {
    // Add user message
    const userMessage = {
      id: `user_${Date.now()}`,
      text: message,
      sender: 'user' as const,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await supportApi.chatWithBot({
        message,
        sessionId: sessionId || undefined,
        userId
      });

      if (response.success) {
        const botMessage = {
          id: `bot_${Date.now()}`,
          text: response.data.response,
          sender: 'bot' as const,
          timestamp: new Date(),
          actions: response.data.actions
        };
        setMessages(prev => [...prev, botMessage]);
        
        if (response.data.session_id) {
          setSessionId(response.data.session_id);
        }
      }
    } catch (error) {
      const errorMessage = {
        id: `error_${Date.now()}`,
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot' as const,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  }, [sessionId]);

  const clearChat = () => {
    setMessages([]);
    setSessionId('');
  };

  return {
    messages,
    sendMessage,
    clearChat,
    sessionId
  };
}

export function useEscalateToSupport() {
  return useApiMutation(supportApi.escalateToSupport);
}

// =============================================================================
// FR13 - ORDER TRACKING HOOKS
// =============================================================================

export function useTrackingInfo(orderId: string) {
  return useApi(
    () => trackingApi.getTrackingInfo(orderId),
    [orderId]
  );
}

export function useDeliveryUpdates() {
  return useApi(() => trackingApi.getDeliveryUpdates());
}

export function useCreateTrackingRecord() {
  return useApiMutation(trackingApi.createTrackingRecord);
}

export function useUpdateTrackingStatus() {
  return useApiMutation(trackingApi.updateTrackingStatus);
}

// Custom hook for order tracking management
export function useOrderTracking(orderId?: string) {
  const trackingInfo = useTrackingInfo(orderId || '');
  const updateStatus = useUpdateTrackingStatus();
  const deliveryUpdates = useDeliveryUpdates();

  const [trackingHistory, setTrackingHistory] = useState<any[]>([]);

  useEffect(() => {
    if (trackingInfo.data?.tracking?.tracking_history) {
      setTrackingHistory(trackingInfo.data.tracking.tracking_history);
    }
  }, [trackingInfo.data]);

  const addTrackingUpdate = async (update: {
    status: string;
    location?: string;
    description?: string;
  }) => {
    if (!orderId) return null;

    const result = await updateStatus.mutate({
      orderId,
      ...update
    });

    if (result) {
      await trackingInfo.refetch();
      await deliveryUpdates.refetch();
    }

    return result;
  };

  return {
    trackingInfo: trackingInfo.data?.tracking || null,
    trackingHistory,
    deliveryUpdates: deliveryUpdates.data?.orders || [],
    addTrackingUpdate,
    loading: trackingInfo.loading || updateStatus.loading || deliveryUpdates.loading,
    error: trackingInfo.error || updateStatus.error || deliveryUpdates.error,
    refetch: trackingInfo.refetch
  };
}

// =============================================================================
// COMPOSITE HOOKS
// =============================================================================

// Hook for managing multiple API states in forms
export function useFormWithApi<T>(initialData: T) {
  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const updateField = (field: keyof T, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when field is updated
    if (errors[field as string]) {
      setErrors(prev => ({
        ...prev,
        [field as string]: ''
      }));
    }
  };

  const markFieldTouched = (field: keyof T) => {
    setTouched(prev => ({
      ...prev,
      [field as string]: true
    }));
  };

  const setFieldError = (field: keyof T, error: string) => {
    setErrors(prev => ({
      ...prev,
      [field as string]: error
    }));
  };

  const resetForm = () => {
    setFormData(initialData);
    setErrors({});
    setTouched({});
  };

  return {
    formData,
    errors,
    touched,
    updateField,
    markFieldTouched,
    setFieldError,
    resetForm
  };
}

// Hook for managing toast notifications with API responses
export function useApiNotifications() {
  const showSuccess = (message: string) => {
    // In a real app, you'd use your toast library here
    console.log('SUCCESS:', message);
  };

  const showError = (message: string) => {
    // In a real app, you'd use your toast library here
    console.error('ERROR:', message);
  };

  const handleApiResponse = (response: any, successMessage?: string) => {
    if (response) {
      showSuccess(successMessage || 'Operation completed successfully');
    }
  };

  const handleApiError = (error: string | null) => {
    if (error) {
      showError(error);
    }
  };

  return {
    showSuccess,
    showError,
    handleApiResponse,
    handleApiError
  };
}
