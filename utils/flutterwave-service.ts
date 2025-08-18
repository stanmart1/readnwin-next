// Flutterwave Payment Service
import dotenv from 'dotenv';

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
  private secretKey: string;
  private publicKey: string;
  private hash: string;
  private baseUrl: string;
  private testMode: boolean;

  constructor(secretKey?: string, publicKey?: string, hash?: string, testMode?: boolean) {
    // Use environment variables if not provided
    this.secretKey = secretKey || process.env.RAVE_LIVE_SECRET_KEY || '';
    this.publicKey = publicKey || process.env.RAVE_LIVE_PUBLIC_KEY || '';
    this.hash = hash || process.env.FLUTTER_WAVE_HASH || '';
    this.testMode = testMode !== undefined ? testMode : process.env.NODE_ENV !== 'production';
    
    this.baseUrl = this.testMode 
      ? 'https://sandbox-api.flutterwave.com' 
      : 'https://api.flutterwave.com';

    // Validate required environment variables
    if (!this.secretKey) {
      console.error('❌ Flutterwave secret key not found in environment variables');
    }
    if (!this.publicKey) {
      console.error('❌ Flutterwave public key not found in environment variables');
    }
    if (!this.hash) {
      console.error('❌ Flutterwave hash not found in environment variables');
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
        amount: Number(data.amount), // Ensure amount is a number
        currency: data.currency.toUpperCase(), // Ensure currency is uppercase
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
          // Add comprehensive internal service configuration to prevent 400 errors
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

      console.log('🔍 Sending payment data to Flutterwave:', JSON.stringify(paymentData, null, 2));

      const response = await fetch(`${this.baseUrl}/v3/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
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
      public_key: this.publicKey,
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
        // Add comprehensive internal service configuration to prevent 400 errors
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
      callback: () => {},
      onClose: () => {},
    };
  }

  /**
   * Verify payment transaction
   */
  async verifyPayment(transactionId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/v3/transactions/${transactionId}/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
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
      const hash = crypto.createHmac('sha256', secretHash || this.hash)
        .update(payload)
        .digest('hex');
      
      return hash === signature;
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
      const hashString = `${this.publicKey}${data.tx_ref}${data.amount}${data.currency}${data.email}${this.secretKey}`;
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
    return generatedHash === providedHash;
  }

  /**
   * Get service configuration
   */
  getConfig() {
    return {
      secretKey: this.secretKey ? `${this.secretKey.substring(0, 20)}...` : 'NOT SET',
      publicKey: this.publicKey ? `${this.publicKey.substring(0, 20)}...` : 'NOT SET',
      hash: this.hash ? `${this.hash.substring(0, 20)}...` : 'NOT SET',
      baseUrl: this.baseUrl,
      testMode: this.testMode
    };
  }
} 