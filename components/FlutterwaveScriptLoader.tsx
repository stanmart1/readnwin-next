'use client';

import { useEffect } from 'react';

interface FlutterwaveConfig {
  disable_forter?: boolean;
  disable_fingerprint?: boolean;
  disable_metrics?: boolean;
  disable_analytics?: boolean;
  disable_tracking?: boolean;
  source?: string;
  integration?: string;
  [key: string]: unknown;
}

interface FlutterwaveCheckoutConfig {
  meta?: Record<string, unknown>;
  config?: Record<string, unknown>;
  [key: string]: unknown;
}

declare global {
  interface Window {
    FlutterwaveCheckout: (config: FlutterwaveCheckoutConfig) => unknown;
    FlutterwaveConfig?: FlutterwaveConfig;
  }
}

export default function FlutterwaveScriptLoader() {
  useEffect(() => {
    // Suppress Flutterwave internal service errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const message = args[0]?.toString() || '';
      // Only suppress specific Flutterwave internal service errors
      if (
        message.includes('forter/events') ||
        message.includes('metrics.flutterwave.com') ||
        message.includes('api.fpjs.io') ||
        (message.includes('API key not found') && message.includes('flutterwave')) ||
        (message.includes('400 (Bad Request)') && message.includes('flutterwave'))
      ) {
        // Suppress these errors silently
        return;
      }
      // Log other errors normally (including analytics errors)
      originalConsoleError.apply(console, args);
    };

    // Check if script is already loaded
    if (typeof window !== 'undefined' && window.FlutterwaveCheckout) {
      return;
    }

    // Set global Flutterwave configuration to disable problematic services
    if (typeof window !== 'undefined') {
      window.FlutterwaveConfig = {
        disable_forter: true,
        disable_fingerprint: true,
        disable_metrics: true,
        disable_analytics: true,
        disable_tracking: true,
        source: 'readnwin_web',
        integration: 'flutterwave_v3'
      };
    }

    // Load Flutterwave script
    const script = document.createElement('script');
    script.src = 'https://checkout.flutterwave.com/v3.js';
    script.async = true;
    script.onload = () => {
      console.log('Flutterwave script loaded successfully');
      
      // Configure global Flutterwave settings to prevent internal service errors
      if (typeof window !== 'undefined' && window.FlutterwaveCheckout) {
        // Override the default FlutterwaveCheckout to add internal service configuration
        const originalFlutterwaveCheckout = window.FlutterwaveCheckout;
        window.FlutterwaveCheckout = function(config: FlutterwaveCheckoutConfig) {
          // Add comprehensive internal service configuration to prevent 400 errors
          const enhancedConfig = {
            ...config,
            meta: {
              ...config.meta,
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
              ...config.config,
              disable_forter: true,
              disable_fingerprint: true,
              disable_metrics: true
            }
          };
          
          console.log('Flutterwave payment initialized with enhanced configuration');
          return originalFlutterwaveCheckout(enhancedConfig);
        };
      }
    };
    script.onerror = () => {
      console.error('Failed to load Flutterwave script');
    };

    document.head.appendChild(script);

    // Cleanup function
    return () => {
      // Restore original console.error
      console.error = originalConsoleError;
      
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return null; // This component doesn't render anything
} 