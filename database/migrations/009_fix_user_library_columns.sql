-- Fix User Library Table - Add Missing Columns
-- Add columns that the API expects but are missing from the current schema

-- Add missing columns to user_library table
ALTER TABLE user_library 
ADD COLUMN IF NOT EXISTS order_id INTEGER,
ADD COLUMN IF NOT EXISTS purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_downloaded_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false;

-- Update existing records to have purchase_date = added_at if null
UPDATE user_library 
SET purchase_date = added_at 
WHERE purchase_date IS NULL;

-- Add missing columns to reading_progress table if needed
ALTER TABLE reading_progress 
ADD COLUMN IF NOT EXISTS current_page INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_pages INTEGER DEFAULT 0;

-- Create indexes for better performance on new columns
CREATE INDEX IF NOT EXISTS idx_user_library_order_id ON user_library(order_id);
CREATE INDEX IF NOT EXISTS idx_user_library_purchase_date ON user_library(purchase_date);
CREATE INDEX IF NOT EXISTS idx_user_library_favorites ON user_library(user_id, is_favorite) WHERE is_favorite = true;