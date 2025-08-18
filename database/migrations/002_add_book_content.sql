-- Add book content column for storing parsed markdown content
-- Migration: 002_add_book_content.sql

-- Add content column to books table
ALTER TABLE books 
ADD COLUMN IF NOT EXISTS content TEXT,
ADD COLUMN IF NOT EXISTS content_metadata JSONB,
ADD COLUMN IF NOT EXISTS word_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS estimated_reading_time INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS chapters JSONB;

-- Add index for content search
CREATE INDEX IF NOT EXISTS idx_books_content ON books USING gin(to_tsvector('english', content));

-- Add index for word count
CREATE INDEX IF NOT EXISTS idx_books_word_count ON books(word_count);

-- Add index for reading time
CREATE INDEX IF NOT EXISTS idx_books_reading_time ON books(estimated_reading_time); 