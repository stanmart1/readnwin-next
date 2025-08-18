-- Enhanced Book Management System Database Schema
-- Migration: 001_enhanced_book_system.sql

-- Update books table with enhanced structure
ALTER TABLE books 
ADD COLUMN IF NOT EXISTS audiobook_file_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS weight_grams INTEGER,
ADD COLUMN IF NOT EXISTS dimensions JSONB,
ADD COLUMN IF NOT EXISTS shipping_class VARCHAR(50),
ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id),
ADD COLUMN IF NOT EXISTS updated_by INTEGER REFERENCES users(id);

-- Create book formats table for multiple formats per book
CREATE TABLE IF NOT EXISTS book_formats (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    format VARCHAR(20) NOT NULL CHECK (format IN ('ebook', 'physical', 'audiobook')),
    file_url VARCHAR(500),
    file_size BIGINT,
    file_type VARCHAR(100),
    is_available BOOLEAN DEFAULT TRUE,
    price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create book uploads tracking table
CREATE TABLE IF NOT EXISTS book_uploads (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id),
    upload_type VARCHAR(20) NOT NULL CHECK (upload_type IN ('cover', 'ebook', 'audiobook', 'sample')),
    file_name VARCHAR(255),
    file_path VARCHAR(500),
    file_size BIGINT,
    mime_type VARCHAR(100),
    upload_status VARCHAR(20) DEFAULT 'pending' CHECK (upload_status IN ('pending', 'processing', 'completed', 'failed')),
    processing_metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_book_formats_book_id ON book_formats(book_id);
CREATE INDEX IF NOT EXISTS idx_book_formats_format ON book_formats(format);
CREATE INDEX IF NOT EXISTS idx_book_uploads_book_id ON book_uploads(book_id);
CREATE INDEX IF NOT EXISTS idx_book_uploads_status ON book_uploads(upload_status);
CREATE INDEX IF NOT EXISTS idx_books_format ON books(format);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_books_created_by ON books(created_by); 