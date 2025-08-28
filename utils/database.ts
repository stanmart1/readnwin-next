import { Pool } from 'pg';

// Database connection configuration - Using postgres database
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  // SSL is disabled for the new database since it doesn't support it
  ssl: false,
  // Optimized connection pool configuration for better performance
  max: 10, // Increased from 5 to handle more concurrent connections
  min: 2, // Increased from 1 to maintain more idle connections
  connectionTimeoutMillis: 30000, // Increased to 30 seconds for cloud database
  idleTimeoutMillis: 300000, // Increased to 5 minutes to keep connections alive longer
  maxUses: 10000, // Increased from 7500 to reduce connection cycling
  // Add statement timeout to prevent long-running queries
  statement_timeout: 30000, // 30 seconds
  // Add keepalive settings for cloud database
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000
});

// Set timezone for all connections to Nigeria (UTC+1)
pool.on('connect', (client) => {
  client.query('SET timezone = \'Africa/Lagos\'');
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log slow queries for performance monitoring
    if (duration > 1000) {
      console.warn(`⚠️ Slow query detected (${duration}ms):`, { text: text.substring(0, 100) + '...', duration, rows: res.rowCount });
    } else {
      console.log('Executed query', { text: text.substring(0, 100) + '...', duration, rows: res.rowCount });
    }
    
    return res;
  } catch (error) {
    const duration = Date.now() - start;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Database query error:', { error: errorMessage, duration, text: text.substring(0, 100) + '...' });
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