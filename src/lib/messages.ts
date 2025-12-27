// Client-side message handling utilities
// This file provides utilities to handle the user-friendly messages from the server

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  success?: boolean;
}

export interface ServerMessage {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
}

// Message types for different operations
export const MESSAGE_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
} as const;

// Helper function to extract message from API response
export function extractMessage(response: any): string {
  if (typeof response === 'string') {
    return response;
  }

  // Handle Zod validation errors from the server
  if (Array.isArray(response) && response[0]?.path && response[0]?.message) {
    return response
      .map(err => `${err.path.join('.')} - ${err.message}`)
      .join('; ');
  }
  
  if (response?.message) {
    return response.message;
  }
  
  if (response?.error?.message) {
    return response.error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}

// Helper function to determine if response contains a success message
export function hasSuccessMessage(response: any): boolean {
  return !!(response?.message && !response?.error);
}

// Helper function to get appropriate toast variant based on response
export function getToastVariant(response: any): 'default' | 'destructive' {
  if (response?.error || response?.status >= 400) {
    return 'destructive';
  }
  
  return 'default';
}

// Helper function to create toast configuration
export function createToastConfig(response: any, customTitle?: string) {
  const message = extractMessage(response);
  const variant = getToastVariant(response);
  
  return {
    title: customTitle || (variant === 'destructive' ? 'Error' : 'Success'),
    description: message,
    variant,
  };
}

// Enhanced API response handler for mutations
export function handleApiResponse(
  response: any,
  successTitle?: string,
  errorTitle?: string
) {
  const message = extractMessage(response);
  const variant = getToastVariant(response);
  
  return {
    title: variant === 'destructive' ? (errorTitle || 'Error') : (successTitle || 'Success'),
    description: message,
    variant,
  };
}

// Helper for handling file upload responses
export function handleFileUploadResponse(response: any) {
  if (response?.error) {
    return {
      title: 'Upload Failed',
      description: extractMessage(response),
      variant: 'destructive' as const,
    };
  }
  
  return {
    title: 'Upload Successful',
    description: 'File uploaded successfully',
    variant: 'default' as const,
  };
}

// Helper for handling form submission responses
export function handleFormSubmissionResponse(
  response: any,
  operation: string
) {
  const message = extractMessage(response);
  const variant = getToastVariant(response);
  
  const titles = {
    create: variant === 'destructive' ? 'Creation Failed' : 'Created Successfully',
    update: variant === 'destructive' ? 'Update Failed' : 'Updated Successfully',
    delete: variant === 'destructive' ? 'Deletion Failed' : 'Deleted Successfully',
    approve: variant === 'destructive' ? 'Approval Failed' : 'Approved Successfully',
    reject: variant === 'destructive' ? 'Rejection Failed' : 'Rejected Successfully',
    submit: variant === 'destructive' ? 'Submission Failed' : 'Submitted Successfully',
  };
  
  return {
    title: titles[operation as keyof typeof titles] || 'Operation Complete',
    description: message,
    variant,
  };
}

// Enhanced mutation wrapper for consistent error handling
export function createMutationHandler(
  operation: string,
  onSuccess?: (data: any) => void,
  onError?: (error: any) => void
) {
  return {
    onSuccess: (response: any) => {
      const toastConfig = handleFormSubmissionResponse(response, operation);
      // You can import useToast here or pass it as parameter
      // toast(toastConfig);
      onSuccess?.(response);
    },
    onError: (error: any) => {
      const message = extractMessage(error);
      const toastConfig = {
        title: `${operation.charAt(0).toUpperCase() + operation.slice(1)} Failed`,
        description: message,
        variant: 'destructive' as const,
      };
      // toast(toastConfig);
      onError?.(error);
    },
  };
}

// Helper for handling network errors specifically
export function handleNetworkError(error: any): string {
  if (error?.message?.includes('fetch')) {
    return 'Unable to connect to the server. Please check your internet connection and try again.';
  }
  
  if (error?.message?.includes('timeout')) {
    return 'The request took too long to complete. Please try again.';
  }
  
  return extractMessage(error);
}

// Helper for handling validation errors
export function handleValidationError(error: any): string {
  if (error?.message?.includes('validation')) {
    return 'Please check your input and ensure all required fields are filled correctly.';
  }
  
  return extractMessage(error);
}

// Helper for handling authentication errors
export function handleAuthError(error: any): string {
  if (error?.status === 401) {
    return 'Your session has expired. Please log in again.';
  }
  
  if (error?.status === 403) {
    return 'You do not have permission to perform this action.';
  }
  
  return extractMessage(error);
} 