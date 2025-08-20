import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

interface SecureAxiosConfig extends AxiosRequestConfig {
  allowedDomains?: string[];
  maxRedirects?: number;
  validateStatus?: (status: number) => boolean;
}

class SecureAxios {
  private instance: AxiosInstance;
  private allowedDomains: string[];

  constructor(config: SecureAxiosConfig = {}) {
    this.allowedDomains = config.allowedDomains || [];
    
    this.instance = axios.create({
      timeout: 30000, // 30 second timeout
      maxRedirects: config.maxRedirects || 3,
      validateStatus: config.validateStatus || ((status) => status >= 200 && status < 300),
      headers: {
        'User-Agent': 'ReadnWin-App/1.0',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor for security validation
    this.instance.interceptors.request.use(
      (config) => {
        // Validate URL to prevent SSRF
        if (config.url) {
          const url = new URL(config.url, config.baseURL);
          
          // Block private IP ranges
          if (this.isPrivateIP(url.hostname)) {
            throw new Error('Request to private IP address blocked');
          }

          // Check allowed domains if specified
          if (this.allowedDomains.length > 0 && !this.isAllowedDomain(url.hostname)) {
            throw new Error(`Domain ${url.hostname} not in allowed list`);
          }

          // Block dangerous protocols
          if (!['http:', 'https:'].includes(url.protocol)) {
            throw new Error('Only HTTP and HTTPS protocols are allowed');
          }
        }

        // Add CSRF protection headers
        config.headers = {
          ...config.headers,
          'X-CSRF-Token': this.generateCSRFToken(),
          'X-Request-ID': this.generateRequestId()
        };

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for security validation
    this.instance.interceptors.response.use(
      (response) => {
        // Validate response headers
        this.validateResponseHeaders(response);
        return response;
      },
      (error) => {
        // Log security-related errors
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.warn('Authentication/Authorization error:', error.config?.url);
        }
        return Promise.reject(error);
      }
    );
  }

  private isPrivateIP(hostname: string): boolean {
    // Check for localhost and private IP ranges
    const privateRanges = [
      /^localhost$/i,
      /^127\./,
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[01])\./,
      /^192\.168\./,
      /^169\.254\./, // Link-local
      /^::1$/, // IPv6 localhost
      /^fc00:/, // IPv6 private
      /^fe80:/ // IPv6 link-local
    ];

    return privateRanges.some(range => range.test(hostname));
  }

  private isAllowedDomain(hostname: string): boolean {
    return this.allowedDomains.some(domain => {
      if (domain.startsWith('*.')) {
        const baseDomain = domain.slice(2);
        return hostname === baseDomain || hostname.endsWith('.' + baseDomain);
      }
      return hostname === domain;
    });
  }

  private generateCSRFToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private generateRequestId(): string {
    return 'req_' + Math.random().toString(36).substring(2) + '_' + Date.now();
  }

  private validateResponseHeaders(response: AxiosResponse): void {
    const headers = response.headers;
    
    // Check for security headers
    const securityHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection'
    ];

    // Log missing security headers (for monitoring)
    securityHeaders.forEach(header => {
      if (!headers[header]) {
        console.debug(`Missing security header: ${header}`);
      }
    });
  }

  // Public methods that mirror axios API
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.get(url, config);
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.post(url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.put(url, data, config);
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.patch(url, data, config);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.delete(url, config);
  }
}

// Create secure instances for different use cases
export const secureAxios = new SecureAxios({
  allowedDomains: [
    'api.flutterwave.com',
    'checkout.flutterwave.com',
    'api.paystack.co',
    'readnwin.com',
    '*.readnwin.com'
  ]
});

export const internalAxios = new SecureAxios({
  maxRedirects: 0 // No redirects for internal APIs
});

export default secureAxios;