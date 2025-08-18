import { ErrorDetails } from '@/components/ui/EnhancedErrorDisplay';

export interface ApiError {
  code?: string;
  message: string;
  details?: string;
  status?: number;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  
  private constructor() {}
  
  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  categorizeError(error: any): ErrorDetails {
    const timestamp = new Date().toISOString();
    
    // Network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        code: 'NETWORK_CONNECTION_ERROR',
        message: 'Unable to connect to the server. Please check your internet connection.',
        details: error.message,
        timestamp,
        suggestions: [
          'Check your internet connection',
          'Try refreshing the page',
          'Check if the service is available'
        ]
      };
    }

    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      return {
        code: 'NETWORK_FETCH_ERROR',
        message: 'Failed to load data from the server.',
        details: error.message,
        timestamp,
        suggestions: [
          'Check your internet connection',
          'Try refreshing the page',
          'Contact support if the problem persists'
        ]
      };
    }

    // API errors
    if (error.status) {
      switch (error.status) {
        case 400:
          return {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request. Please check your input and try again.',
            details: error.message || 'Bad Request',
            timestamp,
            suggestions: [
              'Please check your input and try again',
              'Make sure all required fields are filled',
              'Verify the format of your data'
            ]
          };
        case 401:
          return {
            code: 'AUTH_UNAUTHORIZED',
            message: 'You are not authorized to perform this action. Please log in again.',
            details: error.message || 'Unauthorized',
            timestamp,
            suggestions: [
              'Please log in again',
              'Check your credentials',
              'Contact support if the problem persists'
            ]
          };
        case 403:
          return {
            code: 'PERMISSION_DENIED',
            message: 'You do not have permission to perform this action.',
            details: error.message || 'Forbidden',
            timestamp,
            suggestions: [
              'You may not have permission to perform this action',
              'Contact your administrator',
              'Check your account privileges'
            ]
          };
        case 404:
          return {
            code: 'RESOURCE_NOT_FOUND',
            message: 'The requested resource was not found.',
            details: error.message || 'Not Found',
            timestamp,
            suggestions: [
              'Check if the URL is correct',
              'The resource may have been moved or deleted',
              'Try navigating back to the previous page'
            ]
          };
        case 429:
          return {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please wait a moment and try again.',
            details: error.message || 'Too Many Requests',
            timestamp,
            suggestions: [
              'Please wait a moment and try again',
              'Reduce the frequency of your requests',
              'Contact support if you need to make many requests'
            ]
          };
        case 500:
          return {
            code: 'SERVER_ERROR',
            message: 'The server encountered an error. Please try again later.',
            details: error.message || 'Internal Server Error',
            timestamp,
            suggestions: [
              'The server is experiencing issues',
              'Try again in a few minutes',
              'Contact support if the problem persists'
            ]
          };
        case 502:
        case 503:
        case 504:
          return {
            code: 'SERVICE_UNAVAILABLE',
            message: 'The service is temporarily unavailable. Please try again later.',
            details: error.message || 'Service Unavailable',
            timestamp,
            suggestions: [
              'The service is temporarily unavailable',
              'Try again in a few minutes',
              'Contact support if the problem persists'
            ]
          };
        default:
          return {
            code: `HTTP_${error.status}`,
            message: 'An error occurred while processing your request.',
            details: error.message || `HTTP ${error.status} Error`,
            timestamp,
            suggestions: [
              'Try refreshing the page',
              'Check your internet connection',
              'Contact support if the problem persists'
            ]
          };
      }
    }

    // Validation errors
    if (error.code === 'VALIDATION_ERROR' || error.type === 'validation') {
      return {
        code: 'VALIDATION_ERROR',
        message: 'Please check your input and try again.',
        details: error.message,
        timestamp,
        suggestions: [
          'Please check your input and try again',
          'Make sure all required fields are filled',
          'Verify the format of your data'
        ]
      };
    }

    // Authentication errors
    if (error.code === 'AUTH_ERROR' || error.type === 'authentication') {
      return {
        code: 'AUTH_ERROR',
        message: 'Authentication failed. Please log in again.',
        details: error.message,
        timestamp,
        suggestions: [
          'Please log in again',
          'Check your credentials',
          'Contact support if the problem persists'
        ]
      };
    }

    // Permission errors
    if (error.code === 'PERMISSION_ERROR' || error.type === 'permission') {
      return {
        code: 'PERMISSION_ERROR',
        message: 'You do not have permission to perform this action.',
        details: error.message,
        timestamp,
        suggestions: [
          'You may not have permission to perform this action',
          'Contact your administrator',
          'Check your account privileges'
        ]
      };
    }

    // Database errors
    if (error.code?.startsWith('DB_') || error.type === 'database') {
      return {
        code: 'DATABASE_ERROR',
        message: 'A database error occurred. Please try again.',
        details: error.message,
        timestamp,
        suggestions: [
          'Try again in a few moments',
          'Contact support if the problem persists',
          'The issue may be temporary'
        ]
      };
    }

    // File upload errors
    if (error.code === 'FILE_UPLOAD_ERROR' || error.type === 'file_upload') {
      return {
        code: 'FILE_UPLOAD_ERROR',
        message: 'Failed to upload file. Please try again.',
        details: error.message,
        timestamp,
        suggestions: [
          'Check if the file is not too large',
          'Verify the file format is supported',
          'Try uploading a different file'
        ]
      };
    }

    // Payment errors
    if (error.code?.startsWith('PAYMENT_') || error.type === 'payment') {
      return {
        code: 'PAYMENT_ERROR',
        message: 'Payment processing failed. Please try again.',
        details: error.message,
        timestamp,
        suggestions: [
          'Check your payment information',
          'Verify your card details',
          'Try a different payment method'
        ]
      };
    }

    // Default error
    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred. Please try again.',
      details: error.message || error.toString(),
      timestamp,
      suggestions: [
        'Try refreshing the page',
        'Check your internet connection',
        'Contact support if the problem persists'
      ]
    };
  }

  handleApiError(response: Response, error?: any): ErrorDetails {
    const apiError: ApiError = {
      status: response.status,
      message: 'An error occurred while processing your request.',
      details: error?.message || `HTTP ${response.status} Error`
    };

    try {
      // Try to parse error response
      if (response.headers.get('content-type')?.includes('application/json')) {
        return response.json().then((data) => {
          apiError.message = data.error || data.message || apiError.message;
          apiError.details = data.details || apiError.details;
          apiError.code = data.code;
          return this.categorizeError(apiError);
        });
      }
    } catch (parseError) {
      // If parsing fails, continue with default error
    }

    return this.categorizeError(apiError);
  }

  async handleFetchError(response: Response): Promise<ErrorDetails> {
    if (!response.ok) {
      return this.handleApiError(response);
    }
    
    return this.categorizeError(new Error('Unknown fetch error'));
  }

  logError(error: ErrorDetails, context?: string) {
    console.error('Error occurred:', {
      code: error.code,
      message: error.message,
      details: error.details,
      timestamp: error.timestamp,
      context
    });

    // In production, you might want to send this to an error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: send to error tracking service
      // errorTrackingService.captureError(error, context);
    }
  }

  createRetryAction(action: () => Promise<any>, maxRetries = 3): () => Promise<any> {
    return async () => {
      let lastError: any;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          return await action();
        } catch (error) {
          lastError = error;
          
          if (attempt === maxRetries) {
            throw error;
          }
          
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
      
      throw lastError;
    };
  }
}

export const errorHandler = ErrorHandler.getInstance(); 