import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Secure Axios Wrapper
 * 
 * This wrapper implements security measures to prevent:
 * - CSRF attacks (Cross-Site Request Forgery)
 * - SSRF attacks (Server-Side Request Forgery)
 * - URL-based attacks
 * - Suspicious response handling
 */

interface SecureAxiosConfig extends AxiosRequestConfig {
  // Additional security options
  allowLocalhost?: boolean;
  maxRedirects?: number;
  timeout?: number;
}

class SecureAxios {
  private instance: AxiosInstance;
  private blockedHosts: Set<string> = new Set();
  private blockedIPs: Set<string> = new Set();

  constructor(config: SecureAxiosConfig = {}) {
    // Initialize blocked hosts and IPs
    this.initializeBlockedHosts();
    
    // Create secure axios instance
    this.instance = axios.create({
      timeout: config.timeout || 10000,
      maxRedirects: config.maxRedirects || 5,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
        ...config.headers
      },
      ...config
    });

    // Add request interceptor for security validation
    this.instance.interceptors.request.use(
      this.validateRequest.bind(this),
      (error) => Promise.reject(error)
    );

    // Add response interceptor for security validation
    this.instance.interceptors.response.use(
      this.validateResponse.bind(this),
      (error) => this.handleResponseError(error)
    );
  }

  /**
   * Initialize blocked hosts and IP ranges
   */
  private initializeBlockedHosts(): void {
    // Block localhost and private IP ranges
    const blockedPatterns = [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '::1',
      '10.0.0.0',
      '172.16.0.0',
      '192.168.0.0',
      '169.254.0.0', // Link-local addresses
      '224.0.0.0',   // Multicast addresses
      '240.0.0.0'    // Reserved addresses
    ];

    blockedPatterns.forEach(host => this.blockedHosts.add(host));
  }

  /**
   * Validate request for security threats
   */
  private validateRequest(config: AxiosRequestConfig): AxiosRequestConfig {
    if (!config.url) {
      throw new Error('Security: URL is required');
    }

    try {
      const url = new URL(config.url, config.baseURL || 'http://localhost');
      const hostname = url.hostname.toLowerCase();

      // Check for blocked hosts
      if (this.isBlockedHost(hostname)) {
        throw new Error(`Security: Blocked request to ${hostname}`);
      }

      // Check for suspicious protocols
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new Error(`Security: Blocked protocol ${url.protocol}`);
      }

      // Check for suspicious ports
      const suspiciousPorts = [21, 22, 23, 25, 53, 80, 443, 3306, 5432, 6379, 27017];
      if (url.port && suspiciousPorts.includes(parseInt(url.port))) {
        console.warn(`Security: Request to suspicious port ${url.port}`);
      }

      // Validate URL length
      if (config.url.length > 2048) {
        throw new Error('Security: URL too long');
      }

      // Add security headers
      config.headers = {
        ...config.headers,
        'X-Requested-With': 'XMLHttpRequest',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY'
      };

    } catch (error) {
      if (error instanceof Error && error.message.includes('Security:')) {
        throw error;
      }
      throw new Error('Security: Invalid URL format');
    }

    return config;
  }

  /**
   * Validate response for security threats
   */
  private validateResponse(response: AxiosResponse): AxiosResponse {
    // Check for suspicious status codes
    if (response.status >= 500 && response.status < 600) {
      console.warn('Security: Received server error response');
    }

    // Check response size to prevent DoS
    const contentLength = response.headers['content-length'];
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB limit
      throw new Error('Security: Response too large');
    }

    // Validate content type
    const contentType = response.headers['content-type'];
    if (contentType && !this.isValidContentType(contentType)) {
      console.warn('Security: Suspicious content type:', contentType);
    }

    return response;
  }

  /**
   * Handle response errors
   */
  private handleResponseError(error: any): never {
    // Log security-related errors
    if (error.message && error.message.includes('Security:')) {
      console.error('Security Error:', error.message);
    }

    // Handle network errors
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Security: Connection refused - possible SSRF attempt');
    }

    if (error.code === 'ENOTFOUND') {
      throw new Error('Security: Host not found - possible DNS rebinding attempt');
    }

    throw error;
  }

  /**
   * Check if host is blocked
   */
  private isBlockedHost(hostname: string): boolean {
    // Check exact matches
    if (this.blockedHosts.has(hostname)) {
      return true;
    }

    // Check IP ranges
    const ipParts = hostname.split('.');
    if (ipParts.length === 4) {
      const [a, b, c, d] = ipParts.map(Number);
      
      // Check private IP ranges
      if (a === 10) return true; // 10.0.0.0/8
      if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
      if (a === 192 && b === 168) return true; // 192.168.0.0/16
      if (a === 127) return true; // 127.0.0.0/8
      if (a === 0) return true; // 0.0.0.0/8
      if (a === 169 && b === 254) return true; // 169.254.0.0/16
      if (a >= 224) return true; // 224.0.0.0/4 (multicast and reserved)
    }

    return false;
  }

  /**
   * Validate content type
   */
  private isValidContentType(contentType: string): boolean {
    const validTypes = [
      'application/json',
      'text/plain',
      'text/html',
      'text/css',
      'application/javascript',
      'image/',
      'audio/',
      'video/'
    ];

    return validTypes.some(type => contentType.includes(type));
  }

  /**
   * Make a GET request
   */
  async get<T = any>(url: string, config?: SecureAxiosConfig): Promise<AxiosResponse<T>> {
    return this.instance.get(url, config);
  }

  /**
   * Make a POST request
   */
  async post<T = any>(url: string, data?: any, config?: SecureAxiosConfig): Promise<AxiosResponse<T>> {
    return this.instance.post(url, data, config);
  }

  /**
   * Make a PUT request
   */
  async put<T = any>(url: string, data?: any, config?: SecureAxiosConfig): Promise<AxiosResponse<T>> {
    return this.instance.put(url, data, config);
  }

  /**
   * Make a DELETE request
   */
  async delete<T = any>(url: string, config?: SecureAxiosConfig): Promise<AxiosResponse<T>> {
    return this.instance.delete(url, config);
  }

  /**
   * Make a PATCH request
   */
  async patch<T = any>(url: string, data?: any, config?: SecureAxiosConfig): Promise<AxiosResponse<T>> {
    return this.instance.patch(url, data, config);
  }

  /**
   * Get the underlying axios instance
   */
  getInstance(): AxiosInstance {
    return this.instance;
  }
}

// Create default secure axios instance
const secureAxios = new SecureAxios();

export default secureAxios;
export { SecureAxios, SecureAxiosConfig };
