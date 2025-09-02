import { sanitizeHtml, validateEmail, validateId } from './security';

export interface ValidationRule {
  required?: boolean;
  type?: 'string' | 'number' | 'email' | 'id';
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData: any;
}

export function validateAndSanitizeInput(
  data: Record<string, any>,
  rules: Record<string, ValidationRule>
): ValidationResult {
  const errors: string[] = [];
  const sanitizedData: Record<string, any> = {};

  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];

    // Check required fields
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      continue;
    }

    // Skip validation for optional empty fields
    if (!rule.required && (value === undefined || value === null || value === '')) {
      sanitizedData[field] = value;
      continue;
    }

    // Type validation and sanitization
    switch (rule.type) {
      case 'string':
        if (typeof value !== 'string') {
          errors.push(`${field} must be a string`);
          break;
        }
        
        let sanitizedString = sanitizeHtml(value);
        
        if (rule.minLength && sanitizedString.length < rule.minLength) {
          errors.push(`${field} must be at least ${rule.minLength} characters`);
        }
        
        if (rule.maxLength && sanitizedString.length > rule.maxLength) {
          errors.push(`${field} must be no more than ${rule.maxLength} characters`);
        }
        
        if (rule.pattern && !rule.pattern.test(sanitizedString)) {
          errors.push(`${field} format is invalid`);
        }
        
        sanitizedData[field] = sanitizedString;
        break;

      case 'number':
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        
        if (isNaN(numValue)) {
          errors.push(`${field} must be a valid number`);
          break;
        }
        
        if (rule.min !== undefined && numValue < rule.min) {
          errors.push(`${field} must be at least ${rule.min}`);
        }
        
        if (rule.max !== undefined && numValue > rule.max) {
          errors.push(`${field} must be no more than ${rule.max}`);
        }
        
        sanitizedData[field] = numValue;
        break;

      case 'email':
        if (typeof value !== 'string') {
          errors.push(`${field} must be a string`);
          break;
        }
        
        const sanitizedEmail = sanitizeHtml(value.toLowerCase().trim());
        
        if (!validateEmail(sanitizedEmail)) {
          errors.push(`${field} must be a valid email address`);
        }
        
        sanitizedData[field] = sanitizedEmail;
        break;

      case 'id':
        if (typeof value !== 'string') {
          errors.push(`${field} must be a string`);
          break;
        }
        
        const sanitizedId = sanitizeHtml(value);
        
        if (!validateId(sanitizedId)) {
          errors.push(`${field} must be a valid ID`);
        }
        
        sanitizedData[field] = sanitizedId;
        break;

      default:
        // Default sanitization for unknown types
        sanitizedData[field] = typeof value === 'string' ? sanitizeHtml(value) : value;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData
  };
}

// Common validation rules
export const commonRules = {
  email: {
    required: true,
    type: 'email' as const,
    maxLength: 255
  },
  password: {
    required: true,
    type: 'string' as const,
    minLength: 8,
    maxLength: 128
  },
  name: {
    required: true,
    type: 'string' as const,
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z\s'-]+$/
  },
  title: {
    required: true,
    type: 'string' as const,
    minLength: 1,
    maxLength: 255
  },
  description: {
    required: false,
    type: 'string' as const,
    maxLength: 5000
  },
  price: {
    required: true,
    type: 'number' as const,
    min: 0,
    max: 1000000
  },
  id: {
    required: true,
    type: 'id' as const
  }
};

export function validateGoalType(goalType: string): boolean {
  const validGoalTypes = ['annual_books', 'monthly_pages', 'reading_streak', 'daily_hours'];
  return validGoalTypes.includes(goalType);
}