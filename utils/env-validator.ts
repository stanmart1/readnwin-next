const requiredEnvVars = [
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'DB_HOST',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'DB_PORT'
];

const sensitiveEnvVars = [
  'DB_PASSWORD',
  'NEXTAUTH_SECRET',
  'RAVE_LIVE_SECRET_KEY',
  'RESEND_API_KEY',
  'SMTP_PASS'
];

export const validateEnvironment = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      errors.push(`Missing required environment variable: ${envVar}`);
    }
  }
  
  // Validate database connection string format
  if (process.env.DB_HOST && !process.env.DB_HOST.match(/^[\w\.-]+$/)) {
    errors.push('Invalid DB_HOST format');
  }
  
  if (process.env.DB_PORT && !process.env.DB_PORT.match(/^\d+$/)) {
    errors.push('Invalid DB_PORT format');
  }
  
  return { isValid: errors.length === 0, errors };
};

export const sanitizeEnvForLogging = (env: Record<string, any>): Record<string, any> => {
  const sanitized = { ...env };
  
  for (const sensitive of sensitiveEnvVars) {
    if (sanitized[sensitive]) {
      sanitized[sensitive] = '[REDACTED]';
    }
  }
  
  return sanitized;
};