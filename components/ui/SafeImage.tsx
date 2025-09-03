'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { fetchBookCover } from '@/utils/bookCoverFetcher';
import { decodeHtmlEntities } from '@/utils/htmlUtils';

interface SafeImageProps {
  src?: string | null;
  alt: string;
  bookTitle?: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackSrc?: string;
  onError?: () => void;
  style?: React.CSSProperties;
}

export default function SafeImage({
  src,
  alt,
  bookTitle,
  width,
  height,
  className = '',
  fallbackSrc = '/placeholder-book.jpg',
  onError,
  style,
  ...props
}: SafeImageProps) {
  const getImageSrc = (originalSrc?: string | null) => {
    if (!originalSrc) return fallbackSrc;
    
    // If already using API route, return as is
    if (originalSrc.startsWith('/api/images/covers/')) {
      return originalSrc;
    }
    
    // Handle legacy paths - convert to API route
    if (originalSrc.includes('/uploads/covers/') || originalSrc.includes('covers/')) {
      const filename = originalSrc.split('/').pop();
      return `/api/images/covers/${filename}`;
    }
    
    return originalSrc;
  };

  const [imgSrc, setImgSrc] = useState<string>(getImageSrc(src));
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const newSrc = getImageSrc(src);
    if (src && newSrc !== imgSrc && newSrc !== fallbackSrc) {
      setImgSrc(newSrc);
      setHasError(false);
      setRetryCount(0);
    }
  }, [src, imgSrc, fallbackSrc]);

  const handleError = async () => {
    // Prevent infinite loops by checking if we're already using fallback
    if (imgSrc === fallbackSrc || retryCount >= 2) {
      setHasError(true);
      onError?.();
      return;
    }

    const newRetryCount = retryCount + 1;
    setRetryCount(newRetryCount);
    
    // First retry: try API route if not already using it
    if (newRetryCount === 1 && src && !src.startsWith('/api/images/covers/')) {
      const filename = src.split('/').pop();
      if (filename) {
        setImgSrc(`/api/images/covers/${filename}`);
        return;
      }
    }
    
    // Second retry: try fetching from public sources using book title
    if (newRetryCount === 2 && bookTitle) {
      try {
        const publicCover = await fetchBookCover(bookTitle);
        if (publicCover) {
          setImgSrc(publicCover);
          return;
        }
      } catch (error) {
        console.warn('Failed to fetch public cover:', error);
      }
    }
    
    // Final fallback
    setHasError(true);
    setImgSrc(fallbackSrc);
    onError?.();
  };

  return (
    <Image
      src={imgSrc}
      alt={decodeHtmlEntities(alt)}
      width={width || 200}
      height={height || 300}
      className={className}
      style={style}
      onError={handleError}
      {...props}
    />
  );
}