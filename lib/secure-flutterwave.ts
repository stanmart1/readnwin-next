import { secureAxios } from './secure-axios';

interface FlutterwaveConfig {
  public_key: string;
  tx_ref: string;
  amount: number;
  currency: string;
  payment_options?: string;
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
  meta?: Record<string, unknown>;
}

interface FlutterwaveResponse {
  status: string;
  transaction_id: string;
  tx_ref: string;
  flw_ref: string;
  device_fingerprint?: string;
  amount: number;
  currency: string;
  charged_amount: number;
  app_fee: number;
  merchant_fee: number;
  processor_response: string;
  auth_model: string;
  ip: string;
  narration: string;
  payment_type: string;
  created_at: string;
  account_id: number;
}

interface FlutterwaveCallbackResponse {
  status: string;
  tx_ref: string;
  transaction_id?: string;
}

interface FlutterwaveInlineConfig {
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
  meta: Record<string, unknown>;
  callback: (response: FlutterwaveCallbackResponse) => void;
  onclose: () => void;
}

export class SecureFlutterwave {
  private publicKey: string;
  private secretKey: string;
  private baseUrl: string;

  constructor(publicKey: string, secretKey: string, isProduction = false) {
    this.publicKey = publicKey;
    this.secretKey = secretKey;
    this.baseUrl = isProduction 
      ? 'https://api.flutterwave.com/v3'
      : 'https://ravesandboxapi.flutterwave.com/v3';
  }

  async initializePayment(config: FlutterwaveConfig): Promise<{ link: string; reference: string }> {
    try {
      const payload = {
        ...config,
        public_key: this.publicKey,
        redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/verify`,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/flutterwave/webhook`
      };

      const response = await secureAxios.post(`${this.baseUrl}/payments`, payload, {
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.status === 'success') {
        return {
          link: response.data.data.link,
          reference: config.tx_ref
        };
      }

      throw new Error(response.data.message || 'Payment initialization failed');
    } catch (error) {
      console.error('Flutterwave initialization error:', error);
      throw new Error('Payment service unavailable');
    }
  }

  async verifyPayment(transactionId: string): Promise<FlutterwaveResponse> {
    try {
      const response = await secureAxios.get(
        `${this.baseUrl}/transactions/${transactionId}/verify`,
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === 'success') {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Payment verification failed');
    } catch (error) {
      console.error('Flutterwave verification error:', error);
      throw new Error('Payment verification failed');
    }
  }

  async validateWebhookSignature(payload: string, signature: string): Promise<boolean> {
    const crypto = await import('crypto');
    const hash = crypto
      .createHmac('sha256', this.secretKey)
      .update(payload)
      .digest('hex');
    
    return hash === signature;
  }

  // Secure inline payment method
  generateInlineConfig(config: FlutterwaveConfig): FlutterwaveInlineConfig {
    return {
      public_key: this.publicKey,
      tx_ref: config.tx_ref,
      amount: config.amount,
      currency: config.currency || 'NGN',
      payment_options: config.payment_options || 'card,mobilemoney,ussd,banktransfer',
      customer: {
        email: config.customer.email,
        phone_number: config.customer.phone_number,
        name: config.customer.name || config.customer.email
      },
      customizations: {
        title: config.customizations?.title || 'ReadnWin Payment',
        description: config.customizations?.description || 'Payment for order',
        logo: config.customizations?.logo || `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`
      },
      meta: config.meta || {},
      callback: (response: FlutterwaveCallbackResponse) => {
        console.log('Payment callback:', response);
        if (response.status === 'successful') {
          window.location.href = `/payment/success?tx_ref=${response.tx_ref}`;
        } else {
          window.location.href = `/payment/failed?tx_ref=${response.tx_ref}`;
        }
      },
      onclose: () => {
        console.log('Payment modal closed');
      }
    };
  }
}

// Export singleton instance
export const flutterwaveService = new SecureFlutterwave(
  process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY || '',
  process.env.FLUTTERWAVE_SECRET_KEY || '',
  process.env.NODE_ENV === 'production'
);