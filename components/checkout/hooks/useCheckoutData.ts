import { useState, useEffect, useCallback } from 'react';
import { ShippingMethod, PaymentGateway } from '@/types/ecommerce';

export function useCheckoutData() {
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [paymentGateways, setPaymentGateways] = useState<PaymentGateway[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [shippingResponse, paymentResponse] = await Promise.all([
        fetch('/api/admin/shipping/methods'),
        fetch('/api/payment-gateways')
      ]);

      if (shippingResponse.ok) {
        const shippingData = await shippingResponse.json();
        setShippingMethods(shippingData.methods || []);
      }

      if (paymentResponse.ok) {
        const paymentData = await paymentResponse.json();
        setPaymentGateways(paymentData.gateways || []);
      }
    } catch (err) {
      setError('Failed to load checkout data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    shippingMethods,
    paymentGateways,
    isLoading,
    error,
    reload: loadData
  };
}