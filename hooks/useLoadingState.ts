'use client';

import { useState } from 'react';

export function useLoadingState() {
  const [loadingState, setLoadingState] = useState({
    isLoading: false,
    message: '',
    type: 'spinner' as 'spinner' | 'progress',
    progress: undefined as number | undefined
  });

  const startLoading = (message: string, type: 'spinner' | 'progress' = 'spinner') => {
    setLoadingState({ isLoading: true, message, type, progress: undefined });
  };

  const stopLoading = () => {
    setLoadingState({ isLoading: false, message: '', type: 'spinner', progress: undefined });
  };

  const updateProgress = (progress: number, message?: string) => {
    setLoadingState(prev => ({ 
      ...prev, 
      progress, 
      message: message || prev.message 
    }));
  };

  return { loadingState, startLoading, stopLoading, updateProgress };
}

export function useSkeletonLoading() {
  const [isLoading, setIsLoading] = useState(false);

  const startSkeleton = () => setIsLoading(true);
  const stopSkeleton = () => setIsLoading(false);

  return { isLoading, startSkeleton, stopSkeleton };
}