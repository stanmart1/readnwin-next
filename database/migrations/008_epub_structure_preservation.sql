-- Migration: EPUB Structure Preservation System
-- Description: Enhanced schema to preserve original EPUB/HTML structure without conversion

-- Add columns to book_files for original structure preservation
DO $$ 
BEGIN
    -- Add original_structure column to store EPUB/HTML structure as-is
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'book_files' AND column_name = 'original_structure'
    ) THEN
        ALTER TABLE book_files ADD COLUMN original_structure JSONB;
    END IF;
    
    -- Add extraction_path for EPUB extracted files
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'book_files' AND column_name = 'extraction_path'
    ) THEN
        ALTER TABLE book_files ADD COLUMN extraction_path TEXT;
    END IF;
    
    -- Add preserve_structure flag
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'book_files' AND column_name = 'preserve_structure'
    ) THEN
        ALTER TABLE book_files ADD COLUMN preserve_structure BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- Create epub_structure table for detailed EPUB structure
CREATE TABLE IF NOT EXISTS epub_structure (
    id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    file_id INTEGER NOT NULL REFERENCES book_files(id) ON DELETE CASCADE,
    
    -- EPUB metadata
    title VARCHAR(500),
    creator VARCHAR(255),
    language VARCHAR(10),
    identifier VARCHAR(255),
    publisher VARCHAR(255),
    publication_date DATE,
    
    -- Structure information
    spine_order JSONB NOT NULL, -- Array of file references in reading order
    manifest JSONB NOT NULL,    -- All files in EPUB with metadata
    navigation JSONB,           -- Table of contents structure
    
    -- File paths
    opf_path TEXT,              -- Path to content.opf
    ncx_path TEXT,              -- Path to toc.ncx
    nav_path TEXT,              -- Path to nav.xhtml
    
    -- Processing info
    extracted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    structure_version INTEGER DEFAULT 1,
    
    UNIQUE(book_id, file_id)
);

-- Create html_structure table for HTML books
CREATE TABLE IF NOT EXISTS html_structure (
    id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    file_id INTEGER NOT NULL REFERENCES book_files(id) ON DELETE CASCADE,
    
    -- HTML metadata
    title VARCHAR(500),
    author VARCHAR(255),
    language VARCHAR(10),
    
    -- Structure information
    chapter_structure JSONB,    -- Chapter hierarchy and navigation
    asset_files JSONB,          -- CSS, images, etc.
    
    -- Processing info
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    structure_version INTEGER DEFAULT 1,
    
    UNIQUE(book_id, file_id)
);

-- Update book_content table to support structure preservation
DO $$ 
BEGIN
    -- Add structure_preserved flag
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'book_content' AND column_name = 'structure_preserved'
    ) THEN
        ALTER TABLE book_content ADD COLUMN structure_preserved BOOLEAN DEFAULT TRUE;
    END IF;
    
    -- Add original_format to track source format
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'book_content' AND column_name = 'original_format'
    ) THEN
        ALTER TABLE book_content ADD COLUMN original_format VARCHAR(20);
    END IF;
END $$;

-- Create function to get EPUB structure for e-reader
CREATE OR REPLACE FUNCTION get_epub_structure(p_book_id INTEGER)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'spine', es.spine_order,
        'manifest', es.manifest,
        'navigation', es.navigation,
        'metadata', jsonb_build_object(
            'title', es.title,
            'creator', es.creator,
            'language', es.language,
            'publisher', es.publisher
        ),
        'paths', jsonb_build_object(
            'opf', es.opf_path,
            'ncx', es.ncx_path,
            'nav', es.nav_path
        )
    ) INTO result
    FROM epub_structure es
    WHERE es.book_id = p_book_id;
    
    RETURN COALESCE(result, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- Create function to get HTML structure for e-reader
CREATE OR REPLACE FUNCTION get_html_structure(p_book_id INTEGER)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'chapters', hs.chapter_structure,
        'assets', hs.asset_files,
        'metadata', jsonb_build_object(
            'title', hs.title,
            'author', hs.author,
            'language', hs.language
        )
    ) INTO result
    FROM html_structure hs
    WHERE hs.book_id = p_book_id;
    
    RETURN COALESCE(result, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- Create function to get book structure by format
CREATE OR REPLACE FUNCTION get_book_structure(p_book_id INTEGER)
RETURNS JSONB AS $$
DECLARE
    book_format VARCHAR(20);
    result JSONB;
BEGIN
    -- Get book format
    SELECT file_format INTO book_format
    FROM books WHERE id = p_book_id;
    
    -- Return appropriate structure
    IF book_format = 'epub' THEN
        result := get_epub_structure(p_book_id);
    ELSIF book_format = 'html' THEN
        result := get_html_structure(p_book_id);
    ELSE
        result := '{}'::jsonb;
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_epub_structure_book_id ON epub_structure(book_id);
CREATE INDEX IF NOT EXISTS idx_epub_structure_file_id ON epub_structure(file_id);
CREATE INDEX IF NOT EXISTS idx_html_structure_book_id ON html_structure(book_id);
CREATE INDEX IF NOT EXISTS idx_html_structure_file_id ON html_structure(file_id);
CREATE INDEX IF NOT EXISTS idx_book_files_preserve_structure ON book_files(preserve_structure);
CREATE INDEX IF NOT EXISTS idx_book_content_structure_preserved ON book_content(structure_preserved);

-- Add comments for documentation
COMMENT ON TABLE epub_structure IS 'Stores original EPUB structure and metadata for preservation';
COMMENT ON TABLE html_structure IS 'Stores original HTML book structure and metadata for preservation';
COMMENT ON FUNCTION get_epub_structure IS 'Returns EPUB structure for e-reader consumption';
COMMENT ON FUNCTION get_html_structure IS 'Returns HTML structure for e-reader consumption';
COMMENT ON FUNCTION get_book_structure IS 'Returns appropriate book structure based on format';