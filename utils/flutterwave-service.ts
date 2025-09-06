// Flutterwave Payment Service
import dotenv from 'dotenv';
import { timeSafeEqual } from './security-safe';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

export interface FlutterwavePaymentData {
  amount: number;
  currency: string;
  email: string;
  phone_number?: string;
  tx_ref: string;
  redirect_url?: string;
  customer: {
    email: string;
    phone_number?: string;
    name?: string;
  };
  customizations?: {
    title?: string;
    description?: string;
    logo?: string;
  };
  meta?: Record<string, any>;
}

// Inline payment data interface
export interface FlutterwaveInlinePaymentData {
  public_key: string;
  tx_ref: string;
  amount: number;
  currency: string;
  payment_options: string;
  customer: {
    email: string;
    phone_number?: string;
    name: string;
  };
  customizations: {
    title: string;
    description: string;
    logo: string;
  };
  meta?: Record<string, any>;
  callback: (response: any) => void;
  onClose: () => void;
}

export interface FlutterwaveTransaction {
  id: number;
  tx_ref: string;
  flw_ref: string;
  amount: number;
  currency: string;
  status: string;
  payment_type: string;
  customer: {
    id: number;
    email: string;
    phone_number: string;
    name: string;
  };
  meta: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export class FlutterwaveService {
  private clientId: string;
  private clientSecret: string;
  private encryptionKey: string;
  private baseUrl: string;
  private testMode: boolean;

  constructor(
    clientSecret?: string,
    clientId?: string,
    encryptionKey?: string,
    testMode?: boolean
  ) {
    this.clientSecret = clientSecret || '';
    this.clientId = clientId || '';
    this.encryptionKey = encryptionKey || '';
    this.testMode = testMode !== undefined ? testMode : false;
    
    this.baseUrl = 'https://api.flutterwave.com/v3';

    console.log('🔍 FlutterwaveService initialized:', {
      hasSecretKey: !!this.clientSecret,
      hasPublicKey: !!this.clientId,
      hasHash: !!this.encryptionKey,
      testMode: this.testMode,
      secretKeyPrefix: this.clientSecret ? this.clientSecret.substring(0, 10) + '...' : 'NOT SET'
    });

    // Validate required credentials
    if (!this.clientSecret) {
      console.error('❌ Flutterwave client secret not found');
    }
    if (!this.clientId) {
      console.error('❌ Flutterwave client ID not found');
    }
  }

  /**
   * Initialize a payment transaction
   */
  async initializePayment(data: FlutterwavePaymentData): Promise<any> {
    try {
      // Ensure all required fields are present and properly formatted
      const paymentData = {
        tx_ref: data.tx_ref,
        amount: Number(data.amount),
        currency: data.currency.toUpperCase(),
        redirect_url: data.redirect_url,
        customer: {
          email: data.customer.email,
          phone_number: data.customer.phone_number || '',
          name: data.customer.name || data.customer.email
        },
        customizations: data.customizations || {
          title: 'ReadnWin Payment',
          description: 'Payment for your order',
          logo: 'https://readnwin.com/logo.png'
        },
        meta: {
          ...data.meta,
          source: 'readnwin_web',
          integration: 'flutterwave_v3'
        }
      };

      console.log('🔍 Sending payment data to Flutterwave:', JSON.stringify(paymentData, null, 2));

      const response = await fetch(`${this.baseUrl}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.clientSecret}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Flutterwave API error:', errorData);
        throw new Error(errorData.message || 'Failed to initialize payment');
      }

      const result = await response.json();
      console.log('✅ Flutterwave API response:', JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.error('Error initializing Flutterwave payment:', error);
      throw new Error(`Failed to initialize payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Initialize inline payment (modal/popup)
   */
  initializeInlinePayment(data: FlutterwaveInlinePaymentData): void {
    // Check if Flutterwave script is loaded
    if (typeof window !== 'undefined' && (window as any).FlutterwaveCheckout) {
      const originalCallback = data.callback;
      const originalOnClose = data.onClose;
      
      const config = {
        ...data,
        // Wrap the callback to ensure proper data handling
        callback: (response: any) => {
          console.log('🔍 Flutterwave raw callback response:', response);
          
          // Normalize the response to ensure consistent format
          const normalizedResponse = {
            status: response.status || response.data?.status || 'unknown',
            tx_ref: response.tx_ref || response.data?.tx_ref,
            transaction_id: response.transaction_id || response.data?.id,
            data: response.data || response,
            transaction: response.transaction || response.data,
            meta: response.meta || data.meta || {},
            ...response
          };
          
          console.log('🔍 Normalized Flutterwave response:', normalizedResponse);
          
          if (originalCallback) {
            originalCallback(normalizedResponse);
          }
        },
        onclose: () => {
          console.log('🔍 Flutterwave modal closed');
          if (originalOnClose) {
            originalOnClose();
          }
        },
        // Add comprehensive internal service configuration to prevent 400 errors
        meta: {
          ...data.meta,
          disable_forter: true,
          disable_fingerprint: true,
          disable_metrics: true,
          disable_analytics: true,
          disable_tracking: true,
          disable_fraud_detection: true,
          disable_device_fingerprinting: true,
          source: 'readnwin_web',
          integration: 'flutterwave_v3',
          version: '3.11.14'
        },
        // Add additional configuration to prevent service loading
        config: {
          disable_forter: true,
          disable_fingerprint: true,
          disable_metrics: true,
          disable_analytics: true,
          disable_tracking: true
        }
      };
      
      console.log('🔍 Flutterwave config being sent:', config);
      (window as any).FlutterwaveCheckout(config);
    } else {
      console.error('Flutterwave script not loaded');
      throw new Error('Flutterwave script not loaded');
    }
  }

  /**
   * Prepare inline payment data
   */
  prepareInlinePaymentData(data: FlutterwavePaymentData): FlutterwaveInlinePaymentData {
    const inlineData = {
      public_key: this.clientId,
      tx_ref: data.tx_ref,
      amount: Number(data.amount),
      currency: data.currency.toUpperCase(),
      payment_options: 'card,banktransfer,ussd',
      customer: {
        email: data.customer.email,
        phone_number: data.customer.phone_number || '',
        name: data.customer.name || data.customer.email,
      },
      customizations: {
        title: data.customizations?.title || 'ReadnWin Payment',
        description: data.customizations?.description || 'Payment for your order',
        logo: data.customizations?.logo || 'https://readnwin.com/logo.png',
      },
      meta: {
        ...data.meta,
        source: 'readnwin_web',
        integration: 'flutterwave_v3',
        // Ensure order metadata is preserved for callback
        order_id: data.meta?.order_id,
        order_number: data.meta?.order_number,
        user_id: data.meta?.user_id
      },
      callback: () => {},
      onClose: () => {},
    };
    
    console.log('🔍 Prepared inline payment data:', inlineData);
    return inlineData;
  }

  /**
   * Verify payment transaction
   */
  async verifyPayment(transactionId: string): Promise<any> {
    try {
      console.log('🔍 Verifying payment with Flutterwave:', transactionId);
      
      const response = await fetch(`${this.baseUrl}/transactions/${transactionId}/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.clientSecret}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('🔍 Flutterwave verify response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Flutterwave verify error:', errorData);
        throw new Error(errorData.message || 'Failed to verify payment');
      }

      const result = await response.json();
      console.log('✅ Flutterwave verify result:', result);
      
      // Normalize the response format
      return {
        status: result.status,
        data: result.data,
        message: result.message,
        // Extract the actual payment status from the nested data
        payment_status: result.data?.status || result.status,
        transaction_data: result.data
      };
    } catch (error) {
      console.error('Error verifying Flutterwave payment:', error);
      throw new Error(`Failed to verify payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate webhook signature
   */
  validateWebhookSignature(payload: string, signature: string, secretHash?: string): boolean {
    try {
      const crypto = require('crypto');
      const hash = crypto.createHmac('sha256', secretHash || this.encryptionKey)
        .update(payload)
        .digest('hex');
      
      return timeSafeEqual(hash, signature);
    } catch (error) {
      console.error('Error validating webhook signature:', error);
      return false;
    }
  }

  /**
   * Generate payment hash for verification
   */
  generatePaymentHash(data: any): string {
    try {
      const crypto = require('crypto');
      const hashString = `${this.clientId}${data.tx_ref}${data.amount}${data.currency}${data.email}${this.clientSecret}`;
      return crypto.createHash('sha256').update(hashString).digest('hex');
    } catch (error) {
      console.error('Error generating Flutterwave payment hash:', error);
      return '';
    }
  }

  /**
   * Verify payment hash
   */
  verifyPaymentHash(data: any, providedHash: string): boolean {
    const generatedHash = this.generatePaymentHash(data);
    return timeSafeEqual(generatedHash, providedHash);
  }

  /**
   * Get service configuration
   */
  getConfig() {
    return {
      clientId: this.clientId ? `${this.clientId.substring(0, 20)}...` : 'NOT SET',
      clientSecret: this.clientSecret ? `${this.clientSecret.substring(0, 20)}...` : 'NOT SET',
      encryptionKey: this.encryptionKey ? `${this.encryptionKey.substring(0, 20)}...` : 'NOT SET',
      baseUrl: this.baseUrl,
      testMode: this.testMode
    };
  }
} 