-- Add html_file_path column to books table for new HTML storage system
-- Migration: 003_add_html_file_path.sql

-- Add html_file_path column to books table
ALTER TABLE books 
ADD COLUMN IF NOT EXISTS html_file_path TEXT,
ADD COLUMN IF NOT EXISTS processing_status VARCHAR(20) DEFAULT 'pending';

-- Add index for html_file_path
CREATE INDEX IF NOT EXISTS idx_books_html_file_path ON books(html_file_path);

-- Add index for processing_status
CREATE INDEX IF NOT EXISTS idx_books_processing_status ON books(processing_status); 