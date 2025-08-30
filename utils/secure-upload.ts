import { NextRequest } from 'next/server';
import path from 'path';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EBOOK_TYPES = ['application/epub+zip', 'application/pdf', 'text/html'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export const validateFile = (file: File, type: 'image' | 'ebook'): { isValid: boolean; error?: string } => {
  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }

  // Check file size
  const maxSize = type === 'image' ? MAX_IMAGE_SIZE : MAX_FILE_SIZE;
  if (file.size > maxSize) {
    return { isValid: false, error: `File size exceeds ${maxSize / (1024 * 1024)}MB limit` };
  }

  // Check file type
  const allowedTypes = type === 'image' ? ALLOWED_IMAGE_TYPES : ALLOWED_EBOOK_TYPES;
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}` };
  }

  // Check file extension
  const ext = path.extname(file.name).toLowerCase();
  const allowedExts = type === 'image' 
    ? ['.jpg', '.jpeg', '.png', '.webp']
    : ['.epub', '.pdf', '.html'];
  
  if (!allowedExts.includes(ext)) {
    return { isValid: false, error: `Invalid file extension. Allowed: ${allowedExts.join(', ')}` };
  }

  return { isValid: true };
};

export const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 100);
};

export const generateSecureFileName = (originalName: string, userId: number, bookId?: number): string => {
  const ext = path.extname(originalName);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  
  if (bookId) {
    return `book_${bookId}_${userId}_${timestamp}_${random}${ext}`;
  }
  
  return `user_${userId}_${timestamp}_${random}${ext}`;
};