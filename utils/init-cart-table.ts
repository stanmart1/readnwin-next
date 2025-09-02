import { query } from './database';
import { safeLog } from './security';

export async function initCartTable(): Promise<void> {
  try {
    // Create cart_items table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        book_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, book_id)
      )
    `);

    // Create indexes
    await query(`CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_cart_items_book_id ON cart_items(book_id)`);
    
    safeLog.info('Cart table initialized successfully');
  } catch (error) {
    safeLog.error('Failed to initialize cart table:', error);
    // Don't throw error, just log it
  }
}