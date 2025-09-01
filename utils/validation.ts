// Validation utilities for ReadnWin application
import { useState, useEffect } from 'react';

// Email validation
export const validateEmail = (email: string): string => {
  if (!email.trim()) {
    return 'Email is required';
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  
  // Check for disposable email domains (basic check)
  const disposableDomains = [
    'tempmail.org', 'guerrillamail.com', '10minutemail.com',
    'mailinator.com', 'yopmail.com', 'temp-mail.org'
  ];
  
  const domain = email.split('@')[1]?.toLowerCase();
  if (domain && disposableDomains.includes(domain)) {
    return 'Please use a valid email address (disposable emails not allowed)';
  }
  
  return '';
};

// Password validation
export const validatePassword = (password: string): string => {
  if (!password.trim()) {
    return 'Password is required';
  }
  
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  
  return '';
};

// Password strength validation
export const validatePasswordStrength = (password: string): { score: number; feedback: string[]; strength: 'weak' | 'medium' | 'strong' } => {
  const feedback: string[] = [];
  let score = 0;
  
  if (password.length >= 8) {
    score++;
  } else {
    feedback.push('At least 8 characters');
  }
  
  if (/[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push('One uppercase letter');
  }
  
  if (/[a-z]/.test(password)) {
    score++;
  } else {
    feedback.push('One lowercase letter');
  }
  
  if (/[0-9]/.test(password)) {
    score++;
  } else {
    feedback.push('One number');
  }
  
  if (/[^A-Za-z0-9]/.test(password)) {
    score++;
  } else {
    feedback.push('One special character');
  }
  
  let strength: 'weak' | 'medium' | 'strong';
  if (score <= 2) {
    strength = 'weak';
  } else if (score <= 4) {
    strength = 'medium';
  } else {
    strength = 'strong';
  }
  
  return { score, feedback, strength };
};

// Username validation
export const validateUsername = (username: string): string => {
  if (!username.trim()) {
    return 'Username is required';
  }
  
  if (username.length < 3) {
    return 'Username must be at least 3 characters long';
  }
  
  if (username.length > 20) {
    return 'Username must be less than 20 characters';
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return 'Username can only contain letters, numbers, underscores, and hyphens';
  }
  
  return '';
};

// Nigerian phone number validation
export const validateNigerianPhone = (phone: string): string => {
  const cleanPhone = phone.replace(/\s/g, '');
  
  if (!cleanPhone) {
    return 'Phone number is required';
  }
  
  // Nigerian phone number patterns
  const patterns = [
    /^\+234[789][01]\d{8}$/, // +234 format
    /^0[789][01]\d{8}$/,     // 0 format
    /^[789][01]\d{8}$/       // Direct format
  ];
  
  if (!patterns.some(pattern => pattern.test(cleanPhone))) {
    return 'Please enter a valid Nigerian phone number (e.g., +2348012345678, 08012345678, or 8012345678)';
  }
  
  return '';
};

// Nigerian postal code validation
export const validatePostalCode = (zipCode: string): string => {
  if (!zipCode.trim()) {
    return 'Postal code is required';
  }
  
  const cleanZipCode = zipCode.replace(/\s/g, '');
  
  // Nigerian postal codes are typically 6 digits
  if (!/^\d{6}$/.test(cleanZipCode)) {
    return 'Please enter a valid 6-digit postal code';
  }
  
  return '';
};

// Address validation
export const validateAddress = (address: string): string => {
  if (!address.trim()) {
    return 'Address is required';
  }
  
  if (address.length < 10) {
    return 'Please enter a complete address (at least 10 characters)';
  }
  
  return '';
};

// City validation
export const validateCity = (city: string): string => {
  if (!city.trim()) {
    return 'City is required';
  }
  
  if (city.length < 2) {
    return 'City name must be at least 2 characters';
  }
  
  return '';
};

// State validation (Nigerian states)
export const validateNigerianState = (state: string): string => {
  if (!state.trim()) {
    return 'State is required';
  }
  
  const nigerianStates = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
    'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
    'Ekiti', 'Enugu', 'Federal Capital Territory', 'Gombe', 'Imo',
    'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi',
    'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo',
    'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
    'Yobe', 'Zamfara'
  ];
  
  if (!nigerianStates.includes(state)) {
    return 'Please select a valid Nigerian state';
  }
  
  return '';
};

// Payment Gateway API Key Validation
export const validateFlutterwaveApiKey = (key: string, keyType: 'publicKey' | 'secretKey' | 'hash' | 'webhookSecret'): string => {
  if (!key.trim()) {
    return `${keyType.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`;
  }
  
  switch (keyType) {
    case 'publicKey':
      if (!key.startsWith('FLWPUBK_')) {
        return 'Public key should start with FLWPUBK_';
      }
      if (key.length < 20) {
        return 'Public key appears to be too short';
      }
      break;
      
    case 'secretKey':
      if (!key.startsWith('FLWSECK_')) {
        return 'Secret key should start with FLWSECK_';
      }
      if (key.length < 20) {
        return 'Secret key appears to be too short';
      }
      break;
      
    case 'hash':
      if (key.length < 32) {
        return 'Hash should be at least 32 characters long';
      }
      break;
      
    case 'webhookSecret':
      if (key.length < 16) {
        return 'Webhook secret should be at least 16 characters long';
      }
      break;
  }
  
  return '';
};

// Bank Account Validation
export const validateBankAccount = (field: string, value: string): string => {
  if (!value.trim()) {
    return `${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`;
  }
  
  switch (field) {
    case 'bankName':
      if (value.length < 2) {
        return 'Bank name should be at least 2 characters';
      }
      break;
      
    case 'accountNumber':
      const cleanAccountNumber = value.replace(/\s/g, '');
      if (!/^\d{10}$/.test(cleanAccountNumber)) {
        return 'Account number should be exactly 10 digits';
      }
      break;
      
    case 'accountName':
      if (value.length < 3) {
        return 'Account name should be at least 3 characters';
      }
      if (!/^[a-zA-Z\s]+$/.test(value)) {
        return 'Account name should only contain letters and spaces';
      }
      break;
      
    case 'accountType':
      const validTypes = ['Savings', 'Current', 'Domiciliary'];
      if (!validTypes.includes(value)) {
        return 'Please select a valid account type';
      }
      break;
  }
  
  return '';
};

// Name validation
export const validateName = (name: string, fieldName: string = 'Name'): string => {
  if (!name.trim()) {
    return `${fieldName} is required`;
  }
  
  if (name.length < 2) {
    return `${fieldName} must be at least 2 characters long`;
  }
  
  if (name.length > 50) {
    return `${fieldName} must be less than 50 characters`;
  }
  
  if (!/^[a-zA-Z\s'-]+$/.test(name)) {
    return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`;
  }
  
  return '';
};

// Form validation hook
export const useFormValidation = (initialValues: Record<string, unknown>, validators: Record<string, (value: unknown) => string>) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});
  
  const validateField = (name: string, value: unknown): string => {
    const validator = validators[name];
    return validator ? validator(value) : '';
  };
  
  const handleChange = (name: string, value: unknown) => {
    setValues((prev: Record<string, unknown>) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev: {[key: string]: string}) => ({ ...prev, [name]: '' }));
    }
    
    // Validate on blur if field has been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev: Record<string, string>) => ({ ...prev, [name]: error }));
    }
  };
  
  const handleBlur = (name: string) => {
    setTouched((prev: Record<string, boolean>) => ({ ...prev, [name]: true }));
    const error = validateField(name, values[name]);
    setErrors((prev: Record<string, string>) => ({ ...prev, [name]: error }));
  };
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    Object.keys(validators).forEach(field => {
      const error = validateField(field, values[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };
  
  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };
  
  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateForm,
    resetForm,
    setValues
  };
};

// Real-time validation hook
export const useRealTimeValidation = (value: string, validator: (value: string) => string) => {
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);
  
  useEffect(() => {
    if (touched) {
      const validationError = validator(value);
      setError(validationError);
    }
  }, [value, touched, validator]);
  
  return { error, touched, setTouched };
};

// Validation state interface
export interface ValidationState {
  [fieldName: string]: {
    isValid: boolean;
    error: string;
    touched: boolean;
  };
}

// Export all validation functions
export const validationUtils = {
  validateEmail,
  validatePassword,
  validatePasswordStrength,
  validateUsername,
  validateNigerianPhone,
  validatePostalCode,
  validateAddress,
  validateCity,
  validateNigerianState,
  validateFlutterwaveApiKey,
  validateBankAccount,
  validateName,
  useFormValidation,
  useRealTimeValidation
}; 