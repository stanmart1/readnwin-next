-- Overhaul Book Management System Database Schema
-- Migration: 003_overhaul_book_system.sql
-- Based on book-system-guide.md specifications

-- Drop existing content-related columns to rebuild them properly
ALTER TABLE books 
DROP COLUMN IF EXISTS content,
DROP COLUMN IF EXISTS content_metadata,
DROP COLUMN IF EXISTS word_count,
DROP COLUMN IF EXISTS estimated_reading_time,
DROP COLUMN IF EXISTS chapters,
DROP COLUMN IF EXISTS html_file_path;

-- Add new enhanced columns for book management as per specification
ALTER TABLE books 
ADD COLUMN IF NOT EXISTS book_type VARCHAR(20) DEFAULT 'ebook' CHECK (book_type IN ('physical', 'ebook', 'both')),
ADD COLUMN IF NOT EXISTS file_format VARCHAR(20) CHECK (file_format IN ('epub', 'html')),
ADD COLUMN IF NOT EXISTS file_path TEXT, -- Store path to uploaded file
ADD COLUMN IF NOT EXISTS file_size BIGINT,
ADD COLUMN IF NOT EXISTS file_hash VARCHAR(64),
ADD COLUMN IF NOT EXISTS parsing_status VARCHAR(20) DEFAULT 'pending' CHECK (parsing_status IN ('pending', 'processing', 'completed', 'failed')),
ADD COLUMN IF NOT EXISTS parsing_error TEXT,
ADD COLUMN IF NOT EXISTS metadata_extracted_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS security_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS access_control JSONB DEFAULT '{"require_auth": true, "allow_download": false}'::jsonb;

-- Create metadata table for e-books as per specification
CREATE TABLE IF NOT EXISTS book_metadata (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    page_count INTEGER DEFAULT 0,
    estimated_read_time INTEGER DEFAULT 0, -- in minutes
    file_size BIGINT,
    format VARCHAR(20) CHECK (format IN ('epub', 'html')),
    word_count INTEGER DEFAULT 0,
    chapter_count INTEGER DEFAULT 0,
    language VARCHAR(10) DEFAULT 'en',
    publisher VARCHAR(255),
    publication_date DATE,
    isbn VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create table of contents table as per specification
CREATE TABLE IF NOT EXISTS book_table_of_contents (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    chapter_title VARCHAR(500) NOT NULL,
    chapter_order INTEGER NOT NULL,
    page_number INTEGER,
    html_anchor VARCHAR(255),
    word_count INTEGER DEFAULT 0,
    reading_time INTEGER DEFAULT 0, -- in minutes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create book content table for parsed content storage
CREATE TABLE IF NOT EXISTS book_content (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('epub', 'html')),
    content_structure JSONB NOT NULL, -- Stores chapter structure, TOC, etc.
    content_files JSONB NOT NULL, -- Stores file paths and metadata
    word_count INTEGER DEFAULT 0,
    estimated_reading_time INTEGER DEFAULT 0, -- in minutes
    page_count INTEGER DEFAULT 0,
    chapter_count INTEGER DEFAULT 0,
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create book chapters table for detailed chapter information
CREATE TABLE IF NOT EXISTS book_chapters (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    chapter_number INTEGER NOT NULL,
    chapter_title VARCHAR(500) NOT NULL,
    chapter_path VARCHAR(500), -- Path to chapter file
    word_count INTEGER DEFAULT 0,
    page_start INTEGER,
    page_end INTEGER,
    reading_time INTEGER DEFAULT 0, -- in minutes
    chapter_content TEXT, -- For small chapters, store content directly
    chapter_metadata JSONB, -- Additional chapter metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create book files table for secure file storage
CREATE TABLE IF NOT EXISTS book_files (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    file_type VARCHAR(20) NOT NULL CHECK (file_type IN ('cover', 'ebook', 'sample', 'processed')),
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100),
    file_hash VARCHAR(64),
    is_processed BOOLEAN DEFAULT FALSE,
    processing_metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create book access logs table for security tracking
CREATE TABLE IF NOT EXISTS book_access_logs (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    access_type VARCHAR(20) NOT NULL CHECK (access_type IN ('read', 'download', 'preview')),
    ip_address INET,
    user_agent TEXT,
    access_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_duration INTEGER, -- in seconds
    pages_read INTEGER DEFAULT 0
);

-- Create book parsing queue table for background processing
CREATE TABLE IF NOT EXISTS book_parsing_queue (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
    status VARCHAR(20) DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_books_type ON books(book_type);
CREATE INDEX IF NOT EXISTS idx_books_format ON books(file_format);
CREATE INDEX IF NOT EXISTS idx_books_parsing_status ON books(parsing_status);
CREATE INDEX IF NOT EXISTS idx_book_metadata_book_id ON book_metadata(book_id);
CREATE INDEX IF NOT EXISTS idx_book_toc_book_id ON book_table_of_contents(book_id);
CREATE INDEX IF NOT EXISTS idx_book_toc_order ON book_table_of_contents(book_id, chapter_order);
CREATE INDEX IF NOT EXISTS idx_book_chapters_book_id ON book_chapters(book_id);
CREATE INDEX IF NOT EXISTS idx_book_chapters_number ON book_chapters(book_id, chapter_number);
CREATE INDEX IF NOT EXISTS idx_book_files_book_id ON book_files(book_id);
CREATE INDEX IF NOT EXISTS idx_book_files_hash ON book_files(file_hash);
CREATE INDEX IF NOT EXISTS idx_book_access_logs_book_id ON book_access_logs(book_id);
CREATE INDEX IF NOT EXISTS idx_book_access_logs_user_id ON book_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_book_parsing_queue_status ON book_parsing_queue(status);
CREATE INDEX IF NOT EXISTS idx_book_parsing_queue_priority ON book_parsing_queue(priority, created_at);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_book_metadata_updated_at BEFORE UPDATE ON book_metadata FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_book_content_updated_at BEFORE UPDATE ON book_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_book_files_updated_at BEFORE UPDATE ON book_files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_book_parsing_queue_updated_at BEFORE UPDATE ON book_parsing_queue FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE book_metadata IS 'Stores e-book metadata including page count, reading time, and format information';
COMMENT ON TABLE book_table_of_contents IS 'Stores table of contents with chapter titles, order, and page numbers';
COMMENT ON TABLE book_content IS 'Stores parsed book content structure and metadata';
COMMENT ON TABLE book_chapters IS 'Stores individual chapter content and metadata';
COMMENT ON TABLE book_files IS 'Tracks all uploaded files with original and stored names, paths, and hashes';
COMMENT ON TABLE book_access_logs IS 'Logs user access to books for security and analytics';
COMMENT ON TABLE book_parsing_queue IS 'Manages background parsing tasks for uploaded books';
