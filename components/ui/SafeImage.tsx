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
  const [imgSrc, setImgSrc] = useState<string>(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (src && src !== imgSrc) {
      setImgSrc(src);
      setHasError(false);
      setRetryCount(0);
    }
  }, [src]);

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
      if (src.includes('readnwin.com')) {
        const filename = src.split('/').pop();
        if (filename) {
          setImgSrc(`/uploads/covers/${filename}`);
          return;
        }
      }
      
      if (src.startsWith('/uploads/')) {
        setImgSrc(`/api${src}`);
        return;
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