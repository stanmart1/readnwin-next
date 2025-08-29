import { Pool } from 'pg';

// Database connection configuration - Using postgres database
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: false,
  // Reduced connection pool to prevent exhaustion
  max: 5, // Reduced max connections
  min: 1, // Reduced min connections
  connectionTimeoutMillis: 10000, // Reduced timeout
  idleTimeoutMillis: 30000, // Reduced idle timeout
  maxUses: 1000, // Reduced max uses
  statement_timeout: 10000, // Reduced statement timeout
  keepAlive: false // Disabled keepalive to reduce connection overhead
});

// Set timezone for all connections to Nigeria (UTC+1)
pool.on('connect', (client) => {
  client.query('SET timezone = \'Africa/Lagos\'');
});

// Handle pool errors without crashing
pool.on('error', (err) => {
  console.error('Database pool error:', err.message);
  // Don't exit process, just log the error
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
  let client;
  
  try {
    // Use pool.query instead of getting a client manually
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Only log slow queries to reduce noise
    if (duration > 2000) {
      console.warn(`⚠️ Slow query (${duration}ms):`, text.substring(0, 50) + '...');
    }
    
    return res;
  } catch (error) {
    const duration = Date.now() - start;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Database error:', { error: errorMessage, duration });
    throw error;
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