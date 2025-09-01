-- Fix cart database issues
-- Run this SQL script to ensure proper table structure

-- Ensure cart_items table exists with proper structure
CREATE TABLE IF NOT EXISTS cart_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  book_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  format VARCHAR(20) DEFAULT 'ebook',
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_user_book UNIQUE(user_id, book_id)
);

-- Add missing columns to cart_items if they don't exist
DO $$ 
BEGIN
  -- Add format column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cart_items' AND column_name = 'format') THEN
    ALTER TABLE cart_items ADD COLUMN format VARCHAR(20) DEFAULT 'ebook';
  END IF;
  
  -- Add added_at column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cart_items' AND column_name = 'added_at') THEN
    ALTER TABLE cart_items ADD COLUMN added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
  END IF;
  
  -- Add updated_at column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cart_items' AND column_name = 'updated_at') THEN
    ALTER TABLE cart_items ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
  END IF;
END $$;

-- Ensure books table has required columns
DO $$ 
BEGIN
  -- Add format column to books if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'books' AND column_name = 'format') THEN
    ALTER TABLE books ADD COLUMN format VARCHAR(20) DEFAULT 'ebook';
  END IF;
  
  -- Add stock_quantity column to books if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'books' AND column_name = 'stock_quantity') THEN
    ALTER TABLE books ADD COLUMN stock_quantity INTEGER DEFAULT 0;
  END IF;
  
  -- Add original_price column to books if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'books' AND column_name = 'original_price') THEN
    ALTER TABLE books ADD COLUMN original_price DECIMAL(10,2);
  END IF;
END $$;

-- Update existing cart items to have default format if NULL
UPDATE cart_items SET format = 'ebook' WHERE format IS NULL;

-- Update existing books to have default format if NULL
UPDATE books SET format = 'ebook' WHERE format IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_book_id ON cart_items(book_id);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);

-- Verify table structures
SELECT 'cart_items columns:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'cart_items'
ORDER BY ordinal_position;

SELECT 'books columns:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'books'
ORDER BY ordinal_position;