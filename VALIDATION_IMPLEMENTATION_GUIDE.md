# Validation Implementation Guide

## Overview

This guide provides step-by-step instructions for implementing the validation improvements across the three critical pages: Payment Gateway Management, Authentication, and Checkout.

## Step 1: Payment Gateway Management Improvements

### 1.1 Import Validation Functions

Add to `app/admin/PaymentGatewayManagement.tsx`:

```typescript
import { validateFlutterwaveApiKey, validateBankAccount } from '@/utils/validation';
```

### 1.2 Add Validation State

```typescript
const [validationErrors, setValidationErrors] = useState<{[gatewayId: string]: {[field: string]: string}}>({});
```

### 1.3 Update API Key Input Fields

Replace the existing API key input fields with validated versions:

```typescript
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Public Key {gateway.testMode && '(Test)'} *
  </label>
  <div className="relative">
    <input
      type={showApiKeys[`${gateway.id}_public`] ? 'text' : 'password'}
      value={gateway.apiKeys.publicKey}
      onChange={(e) => updateApiKey(gateway.id, 'publicKey', e.target.value)}
      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 ${
        validationErrors[gateway.id]?.publicKey ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
      }`}
      placeholder={`${gateway.name} Public Key`}
    />
    <button
      type="button"
      onClick={() => setShowApiKeys(prev => ({ ...prev, [`${gateway.id}_public`]: !prev[`${gateway.id}_public`] }))}
      className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
    >
      <i className={showApiKeys[`${gateway.id}_public`] ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
    </button>
  </div>
  {validationErrors[gateway.id]?.publicKey && (
    <p className="mt-1 text-sm text-red-600 flex items-center">
      <i className="ri-error-warning-line mr-1"></i>
      {validationErrors[gateway.id].publicKey}
    </p>
  )}
</div>
```

### 1.4 Update Bank Account Fields

```typescript
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Account Number *
  </label>
  <input
    type="text"
    value={gateway.bankAccount?.accountNumber || ''}
    onChange={(e) => updateBankAccount(gateway.id, 'accountNumber', e.target.value)}
    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      validationErrors[gateway.id]?.accountNumber ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
    }`}
    placeholder="Enter 10-digit Account Number"
    maxLength={10}
  />
  {validationErrors[gateway.id]?.accountNumber && (
    <p className="mt-1 text-sm text-red-600 flex items-center">
      <i className="ri-error-warning-line mr-1"></i>
      {validationErrors[gateway.id].accountNumber}
    </p>
  )}
</div>
```

### 1.5 Add Validation to Save Functions

```typescript
const saveGatewaySettings = async (gatewayId: string) => {
  const gateway = paymentGateways.find(g => g.id === gatewayId);
  if (!gateway) {
    toast.error('Gateway not found');
    return;
  }

  // Validate gateway before saving
  if (!validateGateway(gateway)) {
    toast.error('Please fix validation errors before saving');
    return;
  }

  // ... rest of save logic
};
```

## Step 2: Authentication Page Improvements

### 2.1 Login Page Enhancements

Add to `app/login/page.tsx`:

```typescript
import { validateEmail, validatePassword } from '@/utils/validation';

// Update validateForm function
const validateForm = () => {
  const errors: { [key: string]: string } = {};
  
  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;
  
  const passwordError = validatePassword(password);
  if (passwordError) errors.password = passwordError;
  
  setFieldErrors(errors);
  return Object.keys(errors).length === 0;
};
```

### 2.2 Register Page Enhancements

Add to `app/register/page.tsx`:

```typescript
import { 
  validateEmail, 
  validatePassword, 
  validatePasswordStrength, 
  validateUsername,
  validateName 
} from '@/utils/validation';

// Add password strength state
const [passwordStrength, setPasswordStrength] = useState<{
  score: number;
  feedback: string[];
  strength: 'weak' | 'medium' | 'strong';
}>({ score: 0, feedback: [], strength: 'weak' });

// Update validateForm function
const validateForm = () => {
  const errors: { [key: string]: string } = {};
  
  const firstNameError = validateName(formData.firstName, 'First name');
  if (firstNameError) errors.firstName = firstNameError;
  
  const lastNameError = validateName(formData.lastName, 'Last name');
  if (lastNameError) errors.lastName = lastNameError;
  
  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;
  
  const usernameError = validateUsername(formData.username);
  if (usernameError) errors.username = usernameError;
  
  const passwordError = validatePassword(formData.password);
  if (passwordError) errors.password = passwordError;
  
  if (!formData.confirmPassword.trim()) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  if (!agreedToTerms) {
    errors.terms = 'You must agree to the Terms of Service and Privacy Policy';
  }
  
  setFieldErrors(errors);
  return Object.keys(errors).length === 0;
};

// Add password strength indicator
const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const newPassword = e.target.value;
  handleInputChange(e);
  
  if (newPassword) {
    const strength = validatePasswordStrength(newPassword);
    setPasswordStrength(strength);
  } else {
    setPasswordStrength({ score: 0, feedback: [], strength: 'weak' });
  }
};
```

### 2.3 Add Password Strength Indicator Component

```typescript
const PasswordStrengthIndicator = ({ strength, feedback }: {
  strength: 'weak' | 'medium' | 'strong';
  feedback: string[];
}) => {
  const getColor = () => {
    switch (strength) {
      case 'weak': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'strong': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getWidth = () => {
    switch (strength) {
      case 'weak': return 'w-1/3';
      case 'medium': return 'w-2/3';
      case 'strong': return 'w-full';
      default: return 'w-0';
    }
  };

  return (
    <div className="mt-2">
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div className={`h-2 rounded-full transition-all duration-300 ${getWidth()} ${
            strength === 'weak' ? 'bg-red-500' : 
            strength === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
          }`}></div>
        </div>
        <span className={`text-sm font-medium ${getColor()}`}>
          {strength.charAt(0).toUpperCase() + strength.slice(1)}
        </span>
      </div>
      {feedback.length > 0 && (
        <div className="mt-2 text-xs text-gray-600">
          <p className="font-medium mb-1">Password requirements:</p>
          <ul className="space-y-1">
            {feedback.map((item, index) => (
              <li key={index} className="flex items-center">
                <i className="ri-close-line text-red-500 mr-1"></i>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
```

## Step 3: Checkout Flow Improvements

### 3.1 Add Validation to Checkout Components

Add to `components/checkout/NewCheckoutFlow.tsx`:

```typescript
import { 
  validateEmail, 
  validateName, 
  validateNigerianPhone, 
  validateAddress, 
  validateCity, 
  validateNigerianState, 
  validatePostalCode 
} from '@/utils/validation';

// Update CustomerInformationStep
function CustomerInformationStep({ formData, updateFormData }: {
  formData: CheckoutFormData;
  updateFormData: (section: keyof CheckoutFormData, data: any) => void;
}) {
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateField = (field: string, value: string) => {
    let error = '';
    
    switch (field) {
      case 'first_name':
        error = validateName(value, 'First name');
        break;
      case 'last_name':
        error = validateName(value, 'Last name');
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'phone':
        error = validateNigerianPhone(value);
        break;
    }
    
    setErrors(prev => ({ ...prev, [field]: error }));
    return error;
  };

  const handleFieldChange = (field: string, value: string) => {
    updateFormData('shipping', { [field]: value });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFieldBlur = (field: string, value: string) => {
    validateField(field, value);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name *
          </label>
          <input
            type="text"
            required
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.first_name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
            }`}
            value={formData.shipping.first_name}
            onChange={(e) => handleFieldChange('first_name', e.target.value)}
            onBlur={(e) => handleFieldBlur('first_name', e.target.value)}
          />
          {errors.first_name && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <i className="ri-error-warning-line mr-1"></i>
              {errors.first_name}
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            required
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.last_name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
            }`}
            value={formData.shipping.last_name}
            onChange={(e) => handleFieldChange('last_name', e.target.value)}
            onBlur={(e) => handleFieldBlur('last_name', e.target.value)}
          />
          {errors.last_name && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <i className="ri-error-warning-line mr-1"></i>
              {errors.last_name}
            </p>
          )}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address *
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="email"
            required
            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
            }`}
            value={formData.shipping.email}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            onBlur={(e) => handleFieldBlur('email', e.target.value)}
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <i className="ri-error-warning-line mr-1"></i>
            {errors.email}
          </p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number *
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="tel"
            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.phone ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
            }`}
            value={formData.shipping.phone}
            onChange={(e) => handleFieldChange('phone', e.target.value)}
            onBlur={(e) => handleFieldBlur('phone', e.target.value)}
            placeholder="+234 801 234 5678"
          />
        </div>
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <i className="ri-error-warning-line mr-1"></i>
            {errors.phone}
          </p>
        )}
      </div>
    </div>
  );
}
```

### 3.2 Update Shipping Address Validation

```typescript
function ShippingAddressStep({ formData, updateFormData }: {
  formData: CheckoutFormData;
  updateFormData: (section: keyof CheckoutFormData, data: any) => void;
}) {
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateField = (field: string, value: string) => {
    let error = '';
    
    switch (field) {
      case 'address':
        error = validateAddress(value);
        break;
      case 'city':
        error = validateCity(value);
        break;
      case 'state':
        error = validateNigerianState(value);
        break;
      case 'zip_code':
        error = validatePostalCode(value);
        break;
    }
    
    setErrors(prev => ({ ...prev, [field]: error }));
    return error;
  };

  const handleFieldChange = (field: string, value: string) => {
    updateFormData('shipping', { [field]: value });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFieldBlur = (field: string, value: string) => {
    validateField(field, value);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Street Address *
        </label>
        <div className="relative">
          <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            required
            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.address ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
            }`}
            value={formData.shipping.address}
            onChange={(e) => handleFieldChange('address', e.target.value)}
            onBlur={(e) => handleFieldBlur('address', e.target.value)}
            placeholder="123 Main Street, Apartment 4B"
          />
        </div>
        {errors.address && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <i className="ri-error-warning-line mr-1"></i>
            {errors.address}
          </p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City *
          </label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              required
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.city ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
              }`}
              value={formData.shipping.city}
              onChange={(e) => handleFieldChange('city', e.target.value)}
              onBlur={(e) => handleFieldBlur('city', e.target.value)}
              placeholder="Lagos"
            />
          </div>
          {errors.city && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <i className="ri-error-warning-line mr-1"></i>
              {errors.city}
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            State *
          </label>
          <select
            required
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.state ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
            }`}
            value={formData.shipping.state}
            onChange={(e) => handleFieldChange('state', e.target.value)}
            onBlur={(e) => handleFieldBlur('state', e.target.value)}
          >
            <option value="">Select State</option>
            <option value="Lagos">Lagos</option>
            <option value="Abuja">Abuja (FCT)</option>
            <option value="Kano">Kano</option>
            <option value="Rivers">Rivers</option>
            <option value="Oyo">Oyo</option>
            <option value="Kaduna">Kaduna</option>
            <option value="Ogun">Ogun</option>
            <option value="Imo">Imo</option>
            <option value="Plateau">Plateau</option>
            <option value="Delta">Delta</option>
          </select>
          {errors.state && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <i className="ri-error-warning-line mr-1"></i>
              {errors.state}
            </p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ZIP/Postal Code *
          </label>
          <input
            type="text"
            required
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.zip_code ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
            }`}
            value={formData.shipping.zip_code}
            onChange={(e) => handleFieldChange('zip_code', e.target.value)}
            onBlur={(e) => handleFieldBlur('zip_code', e.target.value)}
            placeholder="100001"
            maxLength={6}
          />
          {errors.zip_code && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <i className="ri-error-warning-line mr-1"></i>
              {errors.zip_code}
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country *
          </label>
          <select
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.shipping.country}
            onChange={(e) => updateFormData('shipping', { country: e.target.value })}
          >
            <option value="NG">Nigeria</option>
          </select>
        </div>
      </div>
    </div>
  );
}
```

## Step 4: Testing the Implementation

### 4.1 Test Payment Gateway Validation

1. Try entering invalid Flutterwave API keys
2. Test bank account number validation
3. Verify error messages appear correctly
4. Test that save is blocked with validation errors

### 4.2 Test Authentication Validation

1. Test email format validation
2. Test password strength requirements
3. Test Nigerian phone number formats
4. Verify real-time validation feedback

### 4.3 Test Checkout Validation

1. Test address field validation
2. Test phone number validation
3. Test postal code validation
4. Verify step progression with validation

## Step 5: Performance Considerations

### 5.1 Debounce Real-time Validation

```typescript
const useDebouncedValidation = (value: string, validator: (value: string) => string, delay: number = 500) => {
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);
  
  useEffect(() => {
    if (!touched) return;
    
    const timeoutId = setTimeout(() => {
      const validationError = validator(value);
      setError(validationError);
    }, delay);
    
    return () => clearTimeout(timeoutId);
  }, [value, touched, validator, delay]);
  
  return { error, touched, setTouched };
};
```

### 5.2 Optimize Validation Functions

```typescript
// Memoize validation functions for better performance
const memoizedValidators = useMemo(() => ({
  email: validateEmail,
  password: validatePassword,
  phone: validateNigerianPhone,
  // ... other validators
}), []);
```

## Conclusion

This implementation provides comprehensive validation across all three critical pages while maintaining good user experience through real-time feedback and clear error messages. The validation is specifically tailored for the Nigerian market and includes security best practices for payment gateway configuration.

Remember to test thoroughly in different scenarios and gather user feedback to refine the validation rules and error messages as needed. 