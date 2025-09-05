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
    this.clientSecret = clientSecret || process.env.FLUTTERWAVE_SECRET_KEY || '';
    this.clientId = clientId || process.env.FLUTTERWAVE_PUBLIC_KEY || '';
    this.encryptionKey = encryptionKey || process.env.FLUTTERWAVE_HASH || '';
    this.testMode = testMode !== undefined ? testMode : process.env.NODE_ENV !== 'production';
    
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
      const config = {
        ...data,
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
      
      (window as any).FlutterwaveCheckout(config);
    } else {
      console.error('Flutterwave script not loaded');
    }
  }

  /**
   * Prepare inline payment data
   */
  prepareInlinePaymentData(data: FlutterwavePaymentData): FlutterwaveInlinePaymentData {
    return {
      public_key: this.clientId,
      tx_ref: data.tx_ref,
      amount: Number(data.amount),
      currency: data.currency.toUpperCase(),
      payment_options: 'card,mobilemoney,ussd',
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
        integration: 'flutterwave_v3'
      },
      callback: () => {},
      onClose: () => {},
    };
  }

  /**
   * Verify payment transaction
   */
  async verifyPayment(transactionId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/transactions/${transactionId}/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.clientSecret}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to verify payment');
      }

      const result = await response.json();
      return result;
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