'use client';

import { useEffect } from 'react';
import { suppressConsoleErrors } from '@/utils/errorHandler';

export default function ErrorSuppressor() {
  useEffect(() => {
    // Only suppress errors in production
    if (process.env.NODE_ENV === 'production') {
      suppressConsoleErrors();
    }
  }, []);

  return null;
}