-- Migration: Book Files System
-- Description: Add tables for book file management and processing

-- Create book_files table for file management
CREATE TABLE IF NOT EXISTS book_files (
    id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    file_type VARCHAR(20) NOT NULL CHECK (file_type IN ('cover', 'ebook', 'sample', 'audio')),
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_hash VARCHAR(64) NOT NULL,
    file_format VARCHAR(20) NOT NULL CHECK (file_format IN ('epub', 'html', 'pdf', 'image', 'audio')),
    processing_status VARCHAR(20) DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    processing_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for performance
    INDEX idx_book_files_book_id (book_id),
    INDEX idx_book_files_type (file_type),
    INDEX idx_book_files_hash (file_hash),
    INDEX idx_book_files_status (processing_status)
);

-- Create book_parsing_queue table for background processing
CREATE TABLE IF NOT EXISTS book_parsing_queue (
    id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    priority INTEGER DEFAULT 5,
    status VARCHAR(20) DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Indexes for performance
    INDEX idx_book_parsing_queue_book_id (book_id),
    INDEX idx_book_parsing_queue_status (status),
    INDEX idx_book_parsing_queue_priority (priority),
    INDEX idx_book_parsing_queue_created_at (created_at)
);

-- Add missing columns to books table for file management
DO $$ 
BEGIN
    -- Add file_format column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' AND column_name = 'file_format'
    ) THEN
        ALTER TABLE books ADD COLUMN file_format VARCHAR(20) DEFAULT 'unknown';
    END IF;
    
    -- Add file_size column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' AND column_name = 'file_size'
    ) THEN
        ALTER TABLE books ADD COLUMN file_size BIGINT DEFAULT 0;
    END IF;
    
    -- Add file_hash column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' AND column_name = 'file_hash'
    ) THEN
        ALTER TABLE books ADD COLUMN file_hash VARCHAR(64);
    END IF;
    
    -- Add parsing_status column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' AND column_name = 'parsing_status'
    ) THEN
        ALTER TABLE books ADD COLUMN parsing_status VARCHAR(20) DEFAULT 'pending' 
        CHECK (parsing_status IN ('pending', 'processing', 'completed', 'failed'));
    END IF;
    
    -- Add parsing_error column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' AND column_name = 'parsing_error'
    ) THEN
        ALTER TABLE books ADD COLUMN parsing_error TEXT;
    END IF;
    
    -- Add security_token column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' AND column_name = 'security_token'
    ) THEN
        ALTER TABLE books ADD COLUMN security_token VARCHAR(64);
    END IF;
    
    -- Add processing_status column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' AND column_name = 'processing_status'
    ) THEN
        ALTER TABLE books ADD COLUMN processing_status VARCHAR(20) DEFAULT 'pending' 
        CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed'));
    END IF;
    
    -- Add word_count column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' AND column_name = 'word_count'
    ) THEN
        ALTER TABLE books ADD COLUMN word_count INTEGER DEFAULT 0;
    END IF;
    
    -- Add estimated_reading_time column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' AND column_name = 'estimated_reading_time'
    ) THEN
        ALTER TABLE books ADD COLUMN estimated_reading_time INTEGER DEFAULT 0;
    END IF;
    
    -- Add chapters column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' AND column_name = 'chapters'
    ) THEN
        ALTER TABLE books ADD COLUMN chapters JSONB;
    END IF;
    
    -- Add created_by column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' AND column_name = 'created_by'
    ) THEN
        ALTER TABLE books ADD COLUMN created_by INTEGER REFERENCES users(id);
    END IF;
END $$;

-- Create function to update book file processing status
CREATE OR REPLACE FUNCTION update_book_processing_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update book processing status based on file processing status
    IF NEW.processing_status = 'completed' AND NEW.file_type = 'ebook' THEN
        UPDATE books SET parsing_status = 'completed' WHERE id = NEW.book_id;
    ELSIF NEW.processing_status = 'failed' AND NEW.file_type = 'ebook' THEN
        UPDATE books SET parsing_status = 'failed', parsing_error = NEW.processing_error WHERE id = NEW.book_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update book processing status
DROP TRIGGER IF EXISTS trigger_update_book_processing_status ON book_files;
CREATE TRIGGER trigger_update_book_processing_status
    AFTER UPDATE ON book_files
    FOR EACH ROW
    EXECUTE FUNCTION update_book_processing_status();

-- Create function to clean up orphaned files
CREATE OR REPLACE FUNCTION cleanup_orphaned_book_files()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM book_files 
    WHERE book_id NOT IN (SELECT id FROM books);
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE book_files IS 'Stores information about uploaded book files (covers, ebooks, samples)';
COMMENT ON TABLE book_parsing_queue IS 'Queue for background processing of uploaded book files';
COMMENT ON FUNCTION update_book_processing_status IS 'Updates book processing status when file processing completes';
COMMENT ON FUNCTION cleanup_orphaned_book_files IS 'Removes file records for deleted books';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_books_parsing_status ON books(parsing_status);
CREATE INDEX IF NOT EXISTS idx_books_processing_status ON books(processing_status);
CREATE INDEX IF NOT EXISTS idx_books_file_format ON books(file_format);
CREATE INDEX IF NOT EXISTS idx_books_created_by ON books(created_by);