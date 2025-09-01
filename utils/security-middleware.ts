import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const validateInput = (data: any, rules: any) => {
  const errors: string[] = [];
  
  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];
    const { required, type, maxLength, pattern } = rule as any;
    
    if (required && (!value || value.toString().trim() === '')) {
      errors.push(`${field} is required`);
      continue;
    }
    
    if (value && type && typeof value !== type) {
      errors.push(`${field} must be ${type}`);
    }
    
    if (value && maxLength && value.toString().length > maxLength) {
      errors.push(`${field} exceeds maximum length`);
    }
    
    if (value && pattern && !pattern.test(value.toString())) {
      errors.push(`${field} format is invalid`);
    }
  }
  
  return { isValid: errors.length === 0, errors };
};

export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
};

export const requireAuth = async (request: NextRequest, allowedRoles?: string[]) => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return { authorized: false, error: 'Authentication required' };
  }
  
  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    return { authorized: false, error: 'Insufficient permissions' };
  }
  
  return { authorized: true, user: session.user };
};

export const validateId = (id: string): number | null => {
  const numId = parseInt(id);
  return isNaN(numId) || numId <= 0 ? null : numId;
};