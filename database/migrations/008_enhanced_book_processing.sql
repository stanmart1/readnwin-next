-- Migration: Enhanced Book Processing System
-- Description: Add columns and indexes for the enhanced book processing system

-- Add missing columns to books table if they don't exist
DO $$ 
BEGIN
    -- Add ebook_file_url column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' AND column_name = 'ebook_file_url'
    ) THEN
        ALTER TABLE books ADD COLUMN ebook_file_url VARCHAR(500);
    END IF;
    
    -- Add file_format column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' AND column_name = 'file_format'
    ) THEN
        ALTER TABLE books ADD COLUMN file_format VARCHAR(20) DEFAULT 'unknown';
    END IF;
    
    -- Add processing_status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' AND column_name = 'processing_status'
    ) THEN
        ALTER TABLE books ADD COLUMN processing_status VARCHAR(20) DEFAULT 'pending' 
        CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed'));
    END IF;
    
    -- Add parsing_error column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' AND column_name = 'parsing_error'
    ) THEN
        ALTER TABLE books ADD COLUMN parsing_error TEXT;
    END IF;
    
    -- Add word_count column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' AND column_name = 'word_count'
    ) THEN
        ALTER TABLE books ADD COLUMN word_count INTEGER DEFAULT 0;
    END IF;
    
    -- Add estimated_reading_time column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' AND column_name = 'estimated_reading_time'
    ) THEN
        ALTER TABLE books ADD COLUMN estimated_reading_time INTEGER DEFAULT 0;
    END IF;
    
    -- Add pages column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' AND column_name = 'pages'
    ) THEN
        ALTER TABLE books ADD COLUMN pages INTEGER;
    END IF;
END $$;

-- Create book_chapters table if it doesn't exist
CREATE TABLE IF NOT EXISTS book_chapters (
    id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    chapter_number INTEGER NOT NULL,
    chapter_title VARCHAR(500),
    content_html TEXT,
    word_count INTEGER DEFAULT 0,
    reading_time_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(book_id, chapter_number)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_books_processing_status ON books(processing_status);
CREATE INDEX IF NOT EXISTS idx_books_file_format ON books(file_format);
CREATE INDEX IF NOT EXISTS idx_books_ebook_file_url ON books(ebook_file_url);
CREATE INDEX IF NOT EXISTS idx_books_processing_queue ON books(processing_status, created_at) 
    WHERE processing_status IN ('pending', 'processing');

CREATE INDEX IF NOT EXISTS idx_book_chapters_book_id ON book_chapters(book_id);
CREATE INDEX IF NOT EXISTS idx_book_chapters_number ON book_chapters(book_id, chapter_number);

-- Update existing books to have proper processing status
UPDATE books 
SET processing_status = CASE 
    WHEN ebook_file_url IS NOT NULL AND word_count > 0 THEN 'completed'
    WHEN ebook_file_url IS NOT NULL THEN 'pending'
    ELSE 'pending'
END
WHERE processing_status IS NULL OR processing_status = 'unknown';

-- Set file_format based on ebook_file_url
UPDATE books 
SET file_format = CASE 
    WHEN ebook_file_url LIKE '%.epub' THEN 'epub'
    WHEN ebook_file_url LIKE '%.html' OR ebook_file_url LIKE '%.htm' THEN 'html'
    WHEN ebook_file_url LIKE '%.pdf' THEN 'pdf'
    ELSE 'unknown'
END
WHERE file_format = 'unknown' AND ebook_file_url IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN books.processing_status IS 'Status of ebook processing for e-reader compatibility';
COMMENT ON COLUMN books.parsing_error IS 'Error message if processing failed';
COMMENT ON COLUMN books.ebook_file_url IS 'URL to access the ebook file';
COMMENT ON COLUMN books.file_format IS 'Format of the uploaded ebook file';
COMMENT ON TABLE book_chapters IS 'Processed chapters from ebooks for e-reader display';

-- Create function to automatically update book stats when chapters are added
CREATE OR REPLACE FUNCTION update_book_stats_from_chapters()
RETURNS TRIGGER AS $$
BEGIN
    -- Update book statistics based on chapters
    UPDATE books SET
        word_count = (
            SELECT COALESCE(SUM(word_count), 0) 
            FROM book_chapters 
            WHERE book_id = NEW.book_id
        ),
        estimated_reading_time = (
            SELECT COALESCE(SUM(reading_time_minutes), 0) 
            FROM book_chapters 
            WHERE book_id = NEW.book_id
        ),
        pages = (
            SELECT COALESCE(CEIL(SUM(word_count) / 250.0), 0) 
            FROM book_chapters 
            WHERE book_id = NEW.book_id
        ),
        processing_status = 'completed',
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.book_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update book stats when chapters are inserted
DROP TRIGGER IF EXISTS trigger_update_book_stats ON book_chapters;
CREATE TRIGGER trigger_update_book_stats
    AFTER INSERT ON book_chapters
    FOR EACH ROW
    EXECUTE FUNCTION update_book_stats_from_chapters();

-- Create function to clean up chapters when book is deleted
CREATE OR REPLACE FUNCTION cleanup_book_chapters()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM book_chapters WHERE book_id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to clean up chapters
DROP TRIGGER IF EXISTS trigger_cleanup_book_chapters ON books;
CREATE TRIGGER trigger_cleanup_book_chapters
    BEFORE DELETE ON books
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_book_chapters();