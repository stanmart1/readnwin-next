// Safe validation middleware with backwards compatibility
import { validateInput, sanitizeHtmlSafe } from './security-safe';

export interface ValidationRule {
  required?: boolean;
  type?: 'string' | 'number' | 'email' | 'id';
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData: any;
}

// Safe validation that doesn't break existing functionality
export function validateAndSanitize(data: any, rules: Record<string, ValidationRule>): ValidationResult {
  const errors: string[] = [];
  const sanitizedData: any = {};

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

    // Type validation
    if (rule.type && !validateInput(value, rule.type)) {
      errors.push(`${field} must be a valid ${rule.type}`);
      sanitizedData[field] = value; // Keep original for backwards compatibility
      continue;
    }

    // String-specific validations
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        errors.push(`${field} must be at least ${rule.minLength} characters`);
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push(`${field} must be no more than ${rule.maxLength} characters`);
      }
      if (rule.pattern && !rule.pattern.test(value)) {
        errors.push(`${field} format is invalid`);
      }

      // Safe HTML sanitization for string fields
      sanitizedData[field] = sanitizeHtmlSafe(value);
    } else {
      sanitizedData[field] = value;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData
  };
}

// Safe middleware for API routes
export function withValidation(rules: Record<string, ValidationRule>) {
  return function(handler: Function) {
    return async function(req: any, res: any) {
      const validation = validateAndSanitize(req.body, rules);
      
      if (!validation.isValid) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validation.errors
        });
      }

      // Add sanitized data to request
      req.validatedBody = validation.sanitizedData;
      
      return handler(req, res);
    };
  };
}