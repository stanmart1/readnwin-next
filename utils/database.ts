import { Pool } from 'pg';
import { validateEnvironment } from './env-validator';

// Validate environment variables at startup
const envValidation = validateEnvironment();
if (!envValidation.isValid) {
  console.error('Environment validation failed:', envValidation.errors);
  process.exit(1);
}

// Database connection configuration with security enhancements
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 5,
  min: 1,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  maxUses: 1000,
  statement_timeout: 10000,
  keepAlive: false,
  application_name: 'readnwin_app',
  query_timeout: 30000
});

// Set timezone for all connections to Nigeria (UTC+1)
pool.on('connect', (client) => {
  client.query('SET timezone = \'Africa/Lagos\'');
});

// Handle pool errors without crashing
pool.on('error', (err) => {
  const sanitizedError = err.message.replace(/password|secret|key/gi, '[REDACTED]');
  console.error('Database pool error:', sanitizedError);
  // Don't exit process, just log the error
});

// Log successful connection in development
pool.on('connect', (client) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Database client connected');
  }
});

// Handle process cleanup
process.on('SIGINT', async () => {
  console.log('Closing database pool...');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Closing database pool...');
  await pool.end();
  process.exit(0);
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  
  // Validate query length to prevent DoS
  if (text.length > 10000) {
    throw new Error('Query too long');
  }
  
  // Block dangerous operations in production
  if (process.env.NODE_ENV === 'production') {
    const dangerousPatterns = /\b(DROP|TRUNCATE|ALTER|CREATE|GRANT|REVOKE)\b/i;
    if (dangerousPatterns.test(text)) {
      console.error('Dangerous query blocked:', text.substring(0, 100));
      throw new Error('Operation not permitted');
    }
  }
  
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      
      if (duration > 2000) {
        console.warn(`⚠️ Slow query (${duration}ms):`, text.substring(0, 50) + '...');
      }
      
      return res;
    } catch (error) {
      const isLastAttempt = attempt === 3;
      const isConnectionError = error instanceof Error && 
        (error.message.includes('connect') || error.message.includes('ECONNREFUSED') || 
         error.message.includes('timeout'));
      
      if (isConnectionError && !isLastAttempt) {
        console.warn(`Database connection attempt ${attempt} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }
      
      const duration = Date.now() - start;
      const sanitizedError = error instanceof Error ? error.message.replace(/password|secret|key/gi, '[REDACTED]') : 'Unknown error';
      console.error('Database error:', { error: sanitizedError, duration, query: text.substring(0, 100) });
      throw error;
    }
  }
};

export const getClient = () => {
  return pool.connect();
};

// Transaction helper function
export const transaction = async (callback: (client: any) => Promise<any>) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Test connection function
export const testConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
};

export { pool };
export default pool; 