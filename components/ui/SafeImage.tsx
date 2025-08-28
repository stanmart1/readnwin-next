'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface SafeImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackSrc?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  style?: React.CSSProperties;
}

export default function SafeImage({
  src,
  alt,
  width,
  height,
  className = '',
  fallbackSrc = '/placeholder-book.png',
  priority = false,
  fill = false,
  sizes,
  style,
  ...props
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  // Reset error state when src changes
  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      
      // Try API route if direct path fails
      if (imgSrc && imgSrc.startsWith('/uploads/')) {
        const apiPath = `/api${imgSrc}`;
        setImgSrc(apiPath);
        return;
      }
      
      // Use fallback image
      setImgSrc(fallbackSrc);
    }
  };

  const imageProps = {
    src: imgSrc,
    alt,
    onError: handleError,
    className,
    priority,
    style,
    ...props
  };

  if (fill) {
    return <Image {...imageProps} fill sizes={sizes} />;
  }

  return (
    <Image
      {...imageProps}
      width={width || 200}
      height={height || 250}
      sizes={sizes}
    />
  );
}