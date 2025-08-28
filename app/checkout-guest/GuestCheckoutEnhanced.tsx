'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { sanitizeForXSS } from '@/utils/security';
import { useToast } from '@/components/ui/Toast';
import { ShoppingBag, Download, Package, AlertCircle, Lock, User, Mail, MapPin, Truck, ChevronRight, Check } from 'lucide-react';
import { useGuestCart } from '@/contexts/GuestCartContext';
import Header from '@/components/Header';

interface CheckoutStep {
  id: number;
  title: string;
  description: string;
  required: boolean;
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
}

const GUEST_SHIPPING_KEY = 'readnwin_guest_shipping';
const GUEST_SHIPPING_METHOD_KEY = 'readnwin_guest_shipping_method';

export default function GuestCheckoutEnhanced() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showToast, ToastContainer } = useToast();
  const {
    cartItems,
    isLoading: cartLoading,
    error: cartError,
    analytics,
    isEbookOnly,
    isPhysicalOnly,
    isMixedCart,
    getSubtotal,
    getTotalSavings,
    getTotalItems,
    transferCartToUser
  } = useGuestCart();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Shipping data state
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Nigeria'
  });
  
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<ShippingMethod | null>(null);
  const [shippingMethods] = useState<ShippingMethod[]>([
    {
      id: 'standard',
      name: 'Standard Delivery',
      description: 'Regular delivery within Lagos',
      price: 1500,
      estimatedDays: '3-5 business days'
    },
    {
      id: 'express',
      name: 'Express Delivery',
      description: 'Fast delivery within Lagos',
      price: 3000,
      estimatedDays: '1-2 business days'
    },
    {
      id: 'nationwide',
      name: 'Nationwide Delivery',
      description: 'Delivery anywhere in Nigeria',
      price: 5000,
      estimatedDays: '5-7 business days'
    }
  ]);
  
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  // Load saved shipping data on mount
  useEffect(() => {
    try {
      const savedAddress = localStorage.getItem(GUEST_SHIPPING_KEY);
      const savedMethod = localStorage.getItem(GUEST_SHIPPING_METHOD_KEY);
      
      if (savedAddress) {
        setShippingAddress(JSON.parse(savedAddress));
      }
      
      if (savedMethod) {
        const method = JSON.parse(savedMethod);
        setSelectedShippingMethod(method);
      }
    } catch (error) {
      console.error('Error loading saved shipping data:', error);
    }
  }, []);

  // Save shipping data to localStorage
  const saveShippingData = () => {
    try {
      localStorage.setItem(GUEST_SHIPPING_KEY, JSON.stringify(shippingAddress));
      if (selectedShippingMethod) {
        localStorage.setItem(GUEST_SHIPPING_METHOD_KEY, JSON.stringify(selectedShippingMethod));
      }
    } catch (error) {
      console.error('Error saving shipping data:', error);
    }
  };

  // Calculate checkout steps based on cart contents
  const getCheckoutSteps = (): CheckoutStep[] => {
    const steps: CheckoutStep[] = [];

    if (!isEbookOnly()) {
      steps.push({
        id: 1,
        title: 'Shipping Address',
        description: 'Enter delivery information',
        required: true
      });
      
      steps.push({
        id: 2,
        title: 'Shipping Method',
        description: 'Choose delivery option',
        required: true
      });
    }

    steps.push({
      id: steps.length + 1,
      title: 'Account & Payment',
      description: 'Sign up or sign in to complete purchase',
      required: true
    });

    return steps;
  };

  const steps = getCheckoutSteps();

  // Redirect authenticated users to regular checkout
  useEffect(() => {
    if (status === 'loading') return;

    if (session) {
      // Transfer guest cart to user account with validation
      if (cartItems.length > 0) {
        try {
          const userId = session.user?.id;
          if (!userId) {
            showToast('Invalid user session. Please sign in again.', 'error');
            return;
          }
          
          const parsedUserId = parseInt(userId, 10);
          if (isNaN(parsedUserId) || parsedUserId <= 0) {
            showToast('Invalid user ID. Please contact support.', 'error');
            return;
          }
          
          transferCartToUser(parsedUserId);
          showToast('Cart transferred successfully!', 'success');
        } catch (error) {
          console.error('Error transferring cart:', error);
          showToast('Failed to transfer cart. Please try again.', 'error');
          return;
        }
      }
      router.push('/checkout-new');
      return;
    }

    if (cartItems.length === 0 && !cartLoading) {
      router.push('/cart-new');
      return;
    }
  }, [session, status, router, cartItems, cartLoading, transferCartToUser]);

  // Validate shipping address
  const validateShippingAddress = (): boolean => {
    const errors: { [key: string]: string } = {};
    
    if (!shippingAddress.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!shippingAddress.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!shippingAddress.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(shippingAddress.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!shippingAddress.phone.trim()) {
      errors.phone = 'Phone number is required';
    }
    
    if (!shippingAddress.addressLine1.trim()) {
      errors.addressLine1 = 'Address is required';
    }
    
    if (!shippingAddress.city.trim()) {
      errors.city = 'City is required';
    }
    
    if (!shippingAddress.state.trim()) {
      errors.state = 'State is required';
    }
    
    if (!shippingAddress.postalCode.trim()) {
      errors.postalCode = 'Postal code is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddressInputChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleContinueFromAddress = () => {
    if (validateShippingAddress()) {
      saveShippingData();
      setCurrentStep(2);
    }
  };

  const handleContinueFromShipping = () => {
    if (!selectedShippingMethod) {
      showToast('Please select a shipping method', 'error');
      return;
    }
    saveShippingData();
    setCurrentStep(isEbookOnly() ? 1 : 3);
  };

  const handleContinueToAuth = () => {
    // Store shipping data and checkout step
    saveShippingData();
    sessionStorage.setItem('guestCheckoutStep', currentStep.toString());
    sessionStorage.setItem('guestCheckoutData', JSON.stringify({
      shippingAddress,
      selectedShippingMethod,
      cartItems
    }));
    router.push('/login?redirect=/checkout-new');
  };

  const handleSignUp = () => {
    // Store shipping data and checkout step
    saveShippingData();
    sessionStorage.setItem('guestCheckoutStep', currentStep.toString());
    sessionStorage.setItem('guestCheckoutData', JSON.stringify({
      shippingAddress,
      selectedShippingMethod,
      cartItems
    }));
    router.push('/register?redirect=/checkout-new');
  };

  const getShippingTotal = () => {
    return selectedShippingMethod ? selectedShippingMethod.price : 0;
  };

  const getFinalTotal = () => {
    return getSubtotal() - getTotalSavings() + getShippingTotal();
  };

  if (status === 'loading' || cartLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cartError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-800">{cartError}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (session) {
    return null; // Will redirect to regular checkout
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {steps.map((stepData, index) => (
              <div key={stepData.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= stepData.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > stepData.id ? <Check className="w-4 h-4" /> : stepData.id}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > stepData.id ? 'bg-blue-600' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-2 space-x-12">
            {steps.map((stepData) => (
              <span key={stepData.id} className={`text-sm ${currentStep >= stepData.id ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                {stepData.title}
              </span>
            ))}
          </div>
        </div>

        {/* Cart Type Indicator */}
        {cartItems.length > 0 && (
          <div className="mb-6 p-4 rounded-lg border bg-blue-50 border-blue-200">
            <div className="flex items-center">
              {isEbookOnly() ? (
                <Download className="h-5 w-5 text-green-600 mr-2" />
              ) : isPhysicalOnly() ? (
                <Package className="h-5 w-5 text-blue-600 mr-2" />
              ) : (
                <ShoppingBag className="h-5 w-5 text-purple-600 mr-2" />
              )}
              <div>
                <h3 className="font-medium text-blue-600">
                  {isEbookOnly() ? 'Digital Books Only' : isPhysicalOnly() ? 'Physical Books Only' : 'Mixed Cart'}
                </h3>
                <p className="text-sm text-gray-600">
                  {isEbookOnly() 
                    ? 'Your cart contains only digital books. No shipping required!' 
                    : isPhysicalOnly() 
                    ? 'Your cart contains physical books. Please provide shipping details.'
                    : 'Your cart contains both digital and physical books.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Steps */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* Step 1: Shipping Address */}
              {currentStep === 1 && !isEbookOnly() && (
                <div className="space-y-6">
                  <div className="flex items-center mb-6">
                    <MapPin className="h-6 w-6 text-blue-600 mr-3" />
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Shipping Address</h2>
                      <p className="text-gray-600">
                        Please provide your shipping address for physical book delivery.
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.firstName}
                        onChange={(e) => handleAddressInputChange('firstName', sanitizeForXSS(e.target.value))}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          validationErrors.firstName ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter first name"
                      />
                      {validationErrors.firstName && (
                        <p className="text-sm text-red-600 mt-1">{validationErrors.firstName}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.lastName}
                        onChange={(e) => handleAddressInputChange('lastName', sanitizeForXSS(e.target.value))}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          validationErrors.lastName ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter last name"
                      />
                      {validationErrors.lastName && (
                        <p className="text-sm text-red-600 mt-1">{validationErrors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={shippingAddress.email}
                        onChange={(e) => handleAddressInputChange('email', sanitizeForXSS(e.target.value))}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          validationErrors.email ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter email address"
                      />
                      {validationErrors.email && (
                        <p className="text-sm text-red-600 mt-1">{validationErrors.email}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={shippingAddress.phone}
                        onChange={(e) => handleAddressInputChange('phone', sanitizeForXSS(e.target.value))}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          validationErrors.phone ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter phone number"
                      />
                      {validationErrors.phone && (
                        <p className="text-sm text-red-600 mt-1">{validationErrors.phone}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.addressLine1}
                      onChange={(e) => handleAddressInputChange('addressLine1', sanitizeForXSS(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        validationErrors.addressLine1 ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Street address, P.O. box, company name"
                    />
                    {validationErrors.addressLine1 && (
                      <p className="text-sm text-red-600 mt-1">{validationErrors.addressLine1}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 2 (Optional)
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.addressLine2}
                      onChange={(e) => handleAddressInputChange('addressLine2', sanitizeForXSS(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Apartment, suite, unit, building, floor, etc."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.city}
                        onChange={(e) => handleAddressInputChange('city', sanitizeForXSS(e.target.value))}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          validationErrors.city ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="City"
                      />
                      {validationErrors.city && (
                        <p className="text-sm text-red-600 mt-1">{validationErrors.city}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.state}
                        onChange={(e) => handleAddressInputChange('state', sanitizeForXSS(e.target.value))}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          validationErrors.state ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="State"
                      />
                      {validationErrors.state && (
                        <p className="text-sm text-red-600 mt-1">{validationErrors.state}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.postalCode}
                        onChange={(e) => handleAddressInputChange('postalCode', sanitizeForXSS(e.target.value))}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          validationErrors.postalCode ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Postal code"
                      />
                      {validationErrors.postalCode && (
                        <p className="text-sm text-red-600 mt-1">{validationErrors.postalCode}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <select
                      value={shippingAddress.country}
                      onChange={(e) => handleAddressInputChange('country', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Nigeria">Nigeria</option>
                    </select>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleContinueFromAddress}
                      className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Continue to Shipping Method
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Shipping Method */}
              {currentStep === 2 && !isEbookOnly() && (
                <div className="space-y-6">
                  <div className="flex items-center mb-6">
                    <Truck className="h-6 w-6 text-blue-600 mr-3" />
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Shipping Method</h2>
                      <p className="text-gray-600">
                        Choose your preferred shipping method for delivery.
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {shippingMethods.map((method) => (
                      <div
                        key={method.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedShippingMethod?.id === method.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedShippingMethod(method)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <input
                              type="radio"
                              checked={selectedShippingMethod?.id === method.id}
                              onChange={() => setSelectedShippingMethod(method)}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-gray-900">
                                {method.name}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {method.description}
                              </p>
                              <p className="text-sm text-gray-500">
                                {method.estimatedDays}
                              </p>
                            </div>
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            ₦{method.price.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Back to Address
                    </button>
                    <button
                      onClick={handleContinueFromShipping}
                      disabled={!selectedShippingMethod}
                      className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Continue to Account
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Final Step: Account Required */}
              {(currentStep === 1 && isEbookOnly()) || (currentStep === 3 && !isEbookOnly()) ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <Lock className="mx-auto h-16 w-16 text-blue-600 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Required</h2>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      To complete your purchase and access your digital books, you need to create an account or sign in to your existing account.
                    </p>
                    {!isEbookOnly() && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-green-800">
                          ✓ Shipping address saved<br />
                          ✓ Shipping method selected<br />
                          Your information will be transferred to complete the order.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Sign Up Option */}
                    <div className="bg-white border-2 border-blue-200 rounded-lg p-6 text-center hover:border-blue-300 transition-colors">
                      <User className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Account</h3>
                      <p className="text-gray-600 mb-4">
                        Sign up for a new account to complete your purchase and access your digital library.
                      </p>
                      <button
                        onClick={handleSignUp}
                        className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                      >
                        Sign Up
                      </button>
                    </div>

                    {/* Sign In Option */}
                    <div className="bg-white border-2 border-gray-200 rounded-lg p-6 text-center hover:border-gray-300 transition-colors">
                      <Mail className="mx-auto h-12 w-12 text-gray-600 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign In</h3>
                      <p className="text-gray-600 mb-4">
                        Already have an account? Sign in to complete your purchase.
                      </p>
                      <button
                        onClick={handleContinueToAuth}
                        className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      >
                        Sign In
                      </button>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-500">
                      Your cart items and shipping information will be saved and transferred to your account.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              {/* Cart Items */}
              <div className="space-y-3 mb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img
                      src={item.book?.cover_image_url || '/placeholder-book.png'}
                      alt={item.book?.title}
                      className="w-12 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {item.book?.title}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      ₦{((item.book?.price || 0) * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Shipping Address Summary */}
              {!isEbookOnly() && shippingAddress.firstName && (
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Shipping To:</h3>
                  <p className="text-sm text-gray-600">
                    {shippingAddress.firstName} {shippingAddress.lastName}<br />
                    {shippingAddress.addressLine1}<br />
                    {shippingAddress.addressLine2 && `${shippingAddress.addressLine2}\n`}
                    {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
                  </p>
                </div>
              )}

              {/* Order Totals */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">₦{getSubtotal().toLocaleString()}</span>
                </div>
                {getTotalSavings() > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Savings</span>
                    <span className="text-green-600">-₦{getTotalSavings().toLocaleString()}</span>
                  </div>
                )}
                {selectedShippingMethod && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping ({selectedShippingMethod.name})</span>
                    <span className="text-gray-900">₦{selectedShippingMethod.price.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">₦{getFinalTotal().toLocaleString()}</span>
                </div>
              </div>

              {/* Guest Notice */}
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                  <span className="text-sm text-yellow-800">
                    Guest checkout - account required to complete purchase
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ToastContainer />
    </div>
  );
} 