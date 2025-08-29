'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  variant?: 'spinner' | 'dots' | 'bars';
}

export function LoadingSpinner({ size = 'md', text, variant = 'spinner' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-3 h-3 xs:w-4 xs:h-4',
    md: 'w-5 h-5 xs:w-6 xs:h-6', 
    lg: 'w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8',
    xl: 'w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12'
  };

  return (
    <div className="flex flex-col items-center px-2">
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}></div>
      {text && <p className="mt-1 xs:mt-2 text-xs xs:text-sm text-gray-600 text-center break-words leading-relaxed">{text}</p>}
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4 py-4">
          {Array.from({ length: columns }).map((_, j) => (
            <div key={j} className="h-4 bg-gray-200 rounded flex-1"></div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="animate-pulse bg-gray-50 rounded-lg p-2 xs:p-3 sm:p-4">
      <div className="h-3 xs:h-4 bg-gray-200 rounded w-3/4 mb-1 xs:mb-2"></div>
      <div className="h-2 xs:h-3 bg-gray-200 rounded w-1/2 mb-1 xs:mb-2"></div>
      <div className="h-2 xs:h-3 bg-gray-200 rounded w-2/3"></div>
    </div>
  );
}

export function SkeletonLoader() {
  return <div className="animate-pulse bg-gray-200 rounded"></div>;
}

interface LoadingButtonProps {
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export function LoadingButton({ 
  loading = false, 
  children, 
  onClick, 
  disabled = false, 
  className = '', 
  type = 'button' 
}: LoadingButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={`inline-flex items-center justify-center px-3 xs:px-4 py-1.5 xs:py-2 border border-transparent text-xs xs:text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      {loading && (
        <div className="animate-spin rounded-full h-3 w-3 xs:h-4 xs:w-4 border-2 border-white border-t-transparent mr-1 xs:mr-2"></div>
      )}
      <span className="truncate">{children}</span>
    </button>
  );
}