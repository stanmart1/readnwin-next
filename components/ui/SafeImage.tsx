'use client';

import React, { useState, useEffect } from 'react';
import { fetchBookCover } from '@/utils/bookCoverFetcher';

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
    if (src && newSrc !== imgSrc) {
      setImgSrc(newSrc);
      setHasError(false);
      setRetryCount(0);
    }
  }, [src, imgSrc]);

  const handleError = async () => {
    if (hasError || retryCount >= 3) {
      if (imgSrc !== fallbackSrc) {
        setImgSrc(fallbackSrc);
      }
      onError?.();
      return;
    }

    setHasError(true);
    setRetryCount(prev => prev + 1);
    
    if (retryCount === 0 && src) {
      // Try API route if not already using it
      if (!src.startsWith('/api/images/covers/')) {
        const filename = src.split('/').pop();
        if (filename) {
          setImgSrc(`/api/images/covers/${filename}`);
          return;
        }
      }
    }
    
    // Try fetching from public sources using book title
    if (retryCount === 1 && bookTitle) {
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
    
    setImgSrc(fallbackSrc);
    onError?.();
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={style}
      onError={handleError}
      loading="lazy"
      {...props}
    />
  );
}