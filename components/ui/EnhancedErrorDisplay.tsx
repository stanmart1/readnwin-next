'use client';

export interface ErrorDetails {
  message: string;
  type: 'network' | 'validation' | 'server' | 'unknown';
  code?: string;
  timestamp: string;
}

interface EnhancedErrorDisplayProps {
  error: ErrorDetails;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function EnhancedErrorDisplay({ 
  error, 
  onRetry, 
  onDismiss, 
  className = '' 
}: EnhancedErrorDisplayProps) {
  const getErrorColor = () => {
    switch (error.type) {
      case 'network': return 'bg-red-50 border-red-200 text-red-800';
      case 'validation': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'server': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getErrorColor()} ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Error</h3>
          <p className="text-sm mt-1">{error.message}</p>
        </div>
        <div className="flex space-x-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-3 py-1 text-xs bg-white rounded border hover:bg-gray-50"
            >
              Retry
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="px-3 py-1 text-xs bg-white rounded border hover:bg-gray-50"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
}