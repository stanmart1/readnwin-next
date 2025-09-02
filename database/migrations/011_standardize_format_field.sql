-- Migration: Standardize book format field
-- Replace book_type with format for consistency

-- Add format column if it doesn't exist
ALTER TABLE books ADD COLUMN IF NOT EXISTS format VARCHAR(20);

-- Copy data from book_type to format
UPDATE books SET format = book_type WHERE format IS NULL;

-- Add constraint to format column
ALTER TABLE books ADD CONSTRAINT books_format_check CHECK (format IN ('physical', 'ebook', 'hybrid'));

-- Set default value
ALTER TABLE books ALTER COLUMN format SET DEFAULT 'ebook';

-- Make format NOT NULL
ALTER TABLE books ALTER COLUMN format SET NOT NULL;

-- Drop the old book_type column
ALTER TABLE books DROP COLUMN IF EXISTS book_type;

-- Update indexes
DROP INDEX IF EXISTS idx_books_type;
CREATE INDEX idx_books_format ON books(format);

-- Update any other tables that reference book_type
-- Update cart_items table if it has format column
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cart_items' AND column_name = 'format') THEN
        -- Update cart_items format from books table
        UPDATE cart_items 
        SET format = b.format 
        FROM books b 
        WHERE cart_items.book_id = b.id;
    END IF;
END $$;

-- Update order_items table if it has format column
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'format') THEN
        -- Update order_items format from books table
        UPDATE order_items 
        SET format = b.format 
        FROM books b 
        WHERE order_items.book_id = b.id;
    END IF;
END $$;