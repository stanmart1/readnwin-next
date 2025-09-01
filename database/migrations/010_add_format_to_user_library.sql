-- Add format column to user_library table to support both Physical and Ebook assignments
-- This allows admins to assign both formats of the same book to users

-- Add format column to user_library table
ALTER TABLE user_library 
ADD COLUMN IF NOT EXISTS format VARCHAR(20) DEFAULT 'ebook';

-- Update existing records to have format based on book format or default to 'ebook'
UPDATE user_library 
SET format = COALESCE(
  (SELECT b.format FROM books b WHERE b.id = user_library.book_id),
  'ebook'
)
WHERE format IS NULL OR format = 'ebook';

-- Create index for better performance on format queries
CREATE INDEX IF NOT EXISTS idx_user_library_format ON user_library(format);

-- Create composite index for user_id, book_id, format to support unique assignments per format
CREATE INDEX IF NOT EXISTS idx_user_library_user_book_format ON user_library(user_id, book_id, format);

-- Update the unique constraint to allow same book with different formats for same user
-- First drop existing constraint if it exists
ALTER TABLE user_library DROP CONSTRAINT IF EXISTS user_library_user_id_book_id_key;

-- Add new unique constraint that includes format
ALTER TABLE user_library 
ADD CONSTRAINT user_library_user_book_format_unique 
UNIQUE (user_id, book_id, format);