interface SecurityConfig {
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordMinLength: number;
  requireStrongPasswords: boolean;
  enableRateLimit: boolean;
  enableCSRF: boolean;
  enableHTTPS: boolean;
  allowedOrigins: string[];
}

const defaultConfig: SecurityConfig = {
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  maxLoginAttempts: 5,
  passwordMinLength: 8,
  requireStrongPasswords: true,
  enableRateLimit: true,
  enableCSRF: true,
  enableHTTPS: process.env.NODE_ENV === 'production',
  allowedOrigins: process.env.NODE_ENV === 'production' 
    ? ['https://readnwin.com', 'https://www.readnwin.com']
    : ['http://localhost:3000']
};

export const getSecurityConfig = (): SecurityConfig => {
  return {
    ...defaultConfig,
    sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '86400000'),
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5'),
    passwordMinLength: parseInt(process.env.PASSWORD_MIN_LENGTH || '8'),
    requireStrongPasswords: process.env.REQUIRE_STRONG_PASSWORDS !== 'false',
    enableRateLimit: process.env.ENABLE_RATE_LIMIT !== 'false',
    enableCSRF: process.env.ENABLE_CSRF !== 'false',
    enableHTTPS: process.env.ENABLE_HTTPS !== 'false'
  };
};

export const validateSecurityConfig = (): { isValid: boolean; errors: string[] } => {
  const config = getSecurityConfig();
  const errors: string[] = [];
  
  if (config.sessionTimeout < 60000) { // Less than 1 minute
    errors.push('Session timeout too short (minimum 1 minute)');
  }
  
  if (config.maxLoginAttempts < 3 || config.maxLoginAttempts > 10) {
    errors.push('Max login attempts should be between 3 and 10');
  }
  
  if (config.passwordMinLength < 8) {
    errors.push('Password minimum length should be at least 8');
  }
  
  if (process.env.NODE_ENV === 'production' && !config.enableHTTPS) {
    errors.push('HTTPS must be enabled in production');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};