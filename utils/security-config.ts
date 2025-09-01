// Security configuration with safe defaults
export const SECURITY_CONFIG = {
  // Input validation limits
  MAX_STRING_LENGTH: 10000,
  MAX_EMAIL_LENGTH: 254,
  MAX_PASSWORD_LENGTH: 128,
  MIN_PASSWORD_LENGTH: 6,
  
  // File upload limits
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_EBOOK_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_EBOOK_TYPES: ['application/epub+zip', 'application/pdf'],
  
  // Rate limiting (requests per minute)
  RATE_LIMIT_LOGIN: 5,
  RATE_LIMIT_API: 100,
  RATE_LIMIT_UPLOAD: 10,
  
  // Session security
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  CSRF_TOKEN_LENGTH: 32,
  
  // Database security
  MAX_QUERY_PARAMS: 100,
  QUERY_TIMEOUT: 30000, // 30 seconds
  
  // Logging
  LOG_RETENTION_DAYS: 30,
  MAX_LOG_SIZE: 100 * 1024 * 1024, // 100MB
  
  // Environment checks
  REQUIRE_HTTPS_PRODUCTION: true,
  REQUIRE_SECURE_HEADERS: true,
  
  // Content Security Policy
  CSP_DIRECTIVES: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", 'https://checkout.flutterwave.com'],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'https:'],
    'font-src': ["'self'"],
    'connect-src': ["'self'", 'https://api.flutterwave.com'],
    'frame-src': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"]
  }
};

// Environment-specific overrides
if (process.env.NODE_ENV === 'development') {
  SECURITY_CONFIG.REQUIRE_HTTPS_PRODUCTION = false;
  SECURITY_CONFIG.CSP_DIRECTIVES['script-src'].push("'unsafe-eval'");
}