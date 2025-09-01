// Safe database configuration without hardcoded credentials
export function getDatabaseConfig() {
  // Validate required environment variables
  const requiredVars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? {
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
    } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
}

// Safe fallback for development only
export function getDevelopmentConfig() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Development config not allowed in production');
  }
  
  console.warn('⚠️ Using development database configuration. Set proper environment variables for production.');
  
  return {
    host: 'localhost',
    port: 5432,
    database: 'readnwin_dev',
    user: 'postgres',
    password: 'postgres',
    ssl: false,
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
}