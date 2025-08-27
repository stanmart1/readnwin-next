-- Migration: Book Content Tables
-- Description: Add tables for storing parsed book content and chapters

-- Create book_content table for storing parsed book metadata and structure
CREATE TABLE IF NOT EXISTS book_content (
    id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('epub', 'html', 'pdf')),
    content_structure JSONB NOT NULL,
    content_files JSONB NOT NULL,
    word_count INTEGER DEFAULT 0,
    estimated_reading_time INTEGER DEFAULT 0,
    page_count INTEGER DEFAULT 0,
    chapter_count INTEGER DEFAULT 0,
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicates
    UNIQUE(book_id)
);

-- Create book_chapters table for storing individual chapters
CREATE TABLE IF NOT EXISTS book_chapters (
    id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    chapter_number INTEGER NOT NULL,
    chapter_title VARCHAR(255) NOT NULL,
    chapter_content TEXT NOT NULL,
    word_count INTEGER DEFAULT 0,
    reading_time INTEGER DEFAULT 0,
    chapter_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicate chapters
    UNIQUE(book_id, chapter_number)
);

-- Add metadata_extracted_at column to books table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' AND column_name = 'metadata_extracted_at'
    ) THEN
        ALTER TABLE books ADD COLUMN metadata_extracted_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Create function to update book metadata from content
CREATE OR REPLACE FUNCTION update_book_metadata_from_content()
RETURNS TRIGGER AS $$
BEGIN
    -- Update book table with extracted metadata
    UPDATE books SET
        word_count = NEW.word_count,
        estimated_reading_time = NEW.estimated_reading_time,
        pages = NEW.page_count,
        parsing_status = 'completed',
        metadata_extracted_at = NOW()
    WHERE id = NEW.book_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update book metadata
DROP TRIGGER IF EXISTS trigger_update_book_metadata ON book_content;
CREATE TRIGGER trigger_update_book_metadata
    AFTER INSERT OR UPDATE ON book_content
    FOR EACH ROW
    EXECUTE FUNCTION update_book_metadata_from_content();

-- Create function to get book reading statistics
CREATE OR REPLACE FUNCTION get_book_reading_stats(p_book_id INTEGER)
RETURNS TABLE(
    total_words INTEGER,
    total_chapters INTEGER,
    avg_chapter_length INTEGER,
    estimated_reading_time INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(bc.word_count, 0) as total_words,
        COALESCE(bc.chapter_count, 0) as total_chapters,
        CASE 
            WHEN bc.chapter_count > 0 THEN bc.word_count / bc.chapter_count
            ELSE 0
        END as avg_chapter_length,
        COALESCE(bc.estimated_reading_time, 0) as estimated_reading_time
    FROM book_content bc
    WHERE bc.book_id = p_book_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to search book content
CREATE OR REPLACE FUNCTION search_book_content(p_search_term TEXT, p_limit INTEGER DEFAULT 10)
RETURNS TABLE(
    book_id INTEGER,
    book_title VARCHAR(255),
    chapter_number INTEGER,
    chapter_title VARCHAR(255),
    content_snippet TEXT,
    relevance_score REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bc.book_id,
        b.title as book_title,
        bc.chapter_number,
        bc.chapter_title,
        LEFT(bc.chapter_content, 200) as content_snippet,
        ts_rank(to_tsvector('english', bc.chapter_content), plainto_tsquery('english', p_search_term)) as relevance_score
    FROM book_chapters bc
    JOIN books b ON bc.book_id = b.id
    WHERE to_tsvector('english', bc.chapter_content) @@ plainto_tsquery('english', p_search_term)
    ORDER BY relevance_score DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Add full-text search indexes for better performance
CREATE INDEX IF NOT EXISTS idx_book_chapters_content_fts 
ON book_chapters USING gin(to_tsvector('english', chapter_content));

CREATE INDEX IF NOT EXISTS idx_book_chapters_title_fts 
ON book_chapters USING gin(to_tsvector('english', chapter_title));

-- Add comments for documentation
COMMENT ON TABLE book_content IS 'Stores parsed book metadata and content structure';
COMMENT ON TABLE book_chapters IS 'Stores individual book chapters with content';
COMMENT ON FUNCTION update_book_metadata_from_content IS 'Updates book metadata when content is processed';
COMMENT ON FUNCTION get_book_reading_stats IS 'Returns reading statistics for a book';
COMMENT ON FUNCTION search_book_content IS 'Searches book content using full-text search';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_books_metadata_extracted ON books(metadata_extracted_at);
CREATE INDEX IF NOT EXISTS idx_book_content_book_id ON book_content(book_id);
CREATE INDEX IF NOT EXISTS idx_book_content_type ON book_content(content_type);
CREATE INDEX IF NOT EXISTS idx_book_content_language ON book_content(language);
CREATE INDEX IF NOT EXISTS idx_book_content_word_count ON book_content(word_count);
CREATE INDEX IF NOT EXISTS idx_book_content_reading_time ON book_content(estimated_reading_time);
CREATE INDEX IF NOT EXISTS idx_book_chapters_book_id ON book_chapters(book_id);
CREATE INDEX IF NOT EXISTS idx_book_chapters_number ON book_chapters(chapter_number);
CREATE INDEX IF NOT EXISTS idx_book_chapters_book_chapter ON book_chapters(book_id, chapter_number);
CREATE INDEX IF NOT EXISTS idx_book_chapters_word_count ON book_chapters(word_count);