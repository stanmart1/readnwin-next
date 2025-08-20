export interface ErrorDetails {
  message: string;
  type: 'network' | 'validation' | 'server' | 'unknown';
  code?: string;
  timestamp: string;
}

export const errorHandler = {
  categorizeError: (error: any): ErrorDetails => {
    const timestamp = new Date().toISOString();
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        message: 'Network connection failed',
        type: 'network',
        timestamp
      };
    }
    
    if (error?.status >= 400 && error?.status < 500) {
      return {
        message: error.message || 'Validation error',
        type: 'validation',
        code: error.status?.toString(),
        timestamp
      };
    }
    
    if (error?.status >= 500) {
      return {
        message: 'Server error occurred',
        type: 'server',
        code: error.status?.toString(),
        timestamp
      };
    }
    
    return {
      message: error?.message || 'An unexpected error occurred',
      type: 'unknown',
      timestamp
    };
  },

  logError: (error: ErrorDetails, context?: string) => {
    console.error(`[${error.type.toUpperCase()}] ${context || 'Error'}:`, error);
  }
};