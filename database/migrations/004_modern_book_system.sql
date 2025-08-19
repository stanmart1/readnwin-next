-- Modern Book Management System Database Schema
-- Migration: 004_modern_book_system.sql
-- Supports Physical Books, HTML eBooks, and EPUB eBooks

-- Drop and recreate books table with modern structure
DROP TABLE IF EXISTS books CASCADE;

CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    
    -- Basic Information
    title VARCHAR(500) NOT NULL,
    subtitle VARCHAR(500),
    author_id INTEGER REFERENCES authors(id),
    category_id INTEGER REFERENCES categories(id),
    isbn VARCHAR(20) UNIQUE,
    description TEXT,
    short_description VARCHAR(500),
    
    -- Book Type and Format
    book_type VARCHAR(20) NOT NULL DEFAULT 'ebook' CHECK (book_type IN ('physical', 'ebook', 'hybrid')),
    primary_format VARCHAR(20) CHECK (primary_format IN ('epub', 'html', 'pdf', 'hardcover', 'paperback')),
    
    -- Pricing and Inventory
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    original_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'NGN',
    
    -- Physical Book Properties
    weight_grams INTEGER,
    dimensions JSONB, -- {width, height, depth in mm}
    shipping_class VARCHAR(50),
    stock_quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 5,
    inventory_tracking BOOLEAN DEFAULT TRUE,
    
    -- Digital Book Properties
    file_size_bytes BIGINT,
    download_limit INTEGER DEFAULT -1, -- -1 = unlimited
    drm_protected BOOLEAN DEFAULT FALSE,
    
    -- Content and Media
    cover_image_path VARCHAR(500),
    cover_image_url VARCHAR(500),
    sample_content_path VARCHAR(500),
    
    -- Metadata
    language VARCHAR(10) DEFAULT 'en',
    pages INTEGER,
    word_count INTEGER,
    reading_time_minutes INTEGER,
    publication_date DATE,
    publisher VARCHAR(255),
    edition VARCHAR(100),
    
    -- Status and Visibility
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived', 'out_of_stock')),
    is_featured BOOLEAN DEFAULT FALSE,
    is_bestseller BOOLEAN DEFAULT FALSE,
    is_new_release BOOLEAN DEFAULT FALSE,
    visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'members_only')),
    
    -- SEO and Marketing
    seo_title VARCHAR(255),
    seo_description VARCHAR(500),
    seo_keywords TEXT,
    marketing_tags TEXT[],
    
    -- Analytics
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    purchase_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    review_count INTEGER DEFAULT 0,
    
    -- System Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id),
    
    -- Search
    search_vector tsvector
);

-- Book Formats Table (supports multiple formats per book)
CREATE TABLE book_formats (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    format_type VARCHAR(20) NOT NULL CHECK (format_type IN ('epub', 'html', 'pdf', 'mobi', 'azw3')),
    file_path VARCHAR(500) NOT NULL, -- Persistent volume path
    file_size_bytes BIGINT NOT NULL,
    file_hash VARCHAR(64) NOT NULL,
    mime_type VARCHAR(100),
    is_primary BOOLEAN DEFAULT FALSE,
    is_available BOOLEAN DEFAULT TRUE,
    processing_status VARCHAR(20) DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    processing_error TEXT,
    quality_score INTEGER DEFAULT 0 CHECK (quality_score BETWEEN 0 AND 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Book Content Structure (for parsed ebooks)
CREATE TABLE book_content_structure (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    format_id INTEGER REFERENCES book_formats(id) ON DELETE CASCADE,
    
    -- Content Organization
    table_of_contents JSONB, -- Structured TOC
    chapter_count INTEGER DEFAULT 0,
    section_count INTEGER DEFAULT 0,
    
    -- Content Metadata
    content_metadata JSONB, -- Author, publisher, etc. from file
    navigation_structure JSONB, -- Navigation points
    
    -- Processing Information
    extraction_method VARCHAR(50), -- 'epub-parser', 'html-parser', etc.
    extraction_version VARCHAR(20),
    extraction_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Book Chapters (detailed chapter information)
CREATE TABLE book_chapters (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    structure_id INTEGER REFERENCES book_content_structure(id) ON DELETE CASCADE,
    
    -- Chapter Information
    chapter_number INTEGER NOT NULL,
    chapter_title VARCHAR(500),
    chapter_subtitle VARCHAR(500),
    
    -- Content Location
    content_path VARCHAR(500), -- Path to chapter content file
    content_html TEXT, -- For small chapters or HTML books
    content_start_offset INTEGER, -- For EPUB chapters
    content_end_offset INTEGER,
    
    -- Chapter Metadata
    word_count INTEGER DEFAULT 0,
    reading_time_minutes INTEGER DEFAULT 0,
    page_start INTEGER,
    page_end INTEGER,
    
    -- Navigation
    previous_chapter_id INTEGER REFERENCES book_chapters(id),
    next_chapter_id INTEGER REFERENCES book_chapters(id),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Book Assets (images, stylesheets, etc.)
CREATE TABLE book_assets (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    format_id INTEGER REFERENCES book_formats(id) ON DELETE CASCADE,
    
    asset_type VARCHAR(50) NOT NULL, -- 'image', 'stylesheet', 'font', 'audio', 'video'
    asset_path VARCHAR(500) NOT NULL, -- Persistent volume path
    original_path VARCHAR(500), -- Original path in ebook
    file_size_bytes BIGINT,
    mime_type VARCHAR(100),
    is_cover BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reading Progress (enhanced)
CREATE TABLE reading_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    
    -- Progress Tracking
    current_chapter_id INTEGER REFERENCES book_chapters(id),
    current_position INTEGER DEFAULT 0, -- Character offset or scroll position
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    
    -- Reading Statistics
    total_reading_time_seconds INTEGER DEFAULT 0,
    session_count INTEGER DEFAULT 0,
    words_read INTEGER DEFAULT 0,
    pages_read INTEGER DEFAULT 0,
    
    -- Timestamps
    started_at TIMESTAMP,
    last_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- Reading Preferences (per book)
    reading_settings JSONB, -- Font size, theme, etc.
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, book_id)
);

-- User Highlights
CREATE TABLE user_highlights (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    chapter_id INTEGER REFERENCES book_chapters(id) ON DELETE SET NULL,
    
    -- Highlight Content
    highlighted_text TEXT NOT NULL,
    start_offset INTEGER NOT NULL,
    end_offset INTEGER NOT NULL,
    
    -- Highlight Properties
    color VARCHAR(20) DEFAULT 'yellow' CHECK (color IN ('yellow', 'green', 'blue', 'pink', 'purple', 'orange')),
    note TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    
    -- Context
    context_before TEXT, -- Text before highlight for context
    context_after TEXT, -- Text after highlight for context
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Notes
CREATE TABLE user_notes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    chapter_id INTEGER REFERENCES book_chapters(id) ON DELETE SET NULL,
    highlight_id INTEGER REFERENCES user_highlights(id) ON DELETE SET NULL,
    
    -- Note Content
    title VARCHAR(255),
    content TEXT NOT NULL,
    note_type VARCHAR(20) DEFAULT 'general' CHECK (note_type IN ('general', 'question', 'insight', 'quote', 'summary')),
    
    -- Position
    position_offset INTEGER,
    page_number INTEGER,
    
    -- Organization
    tags TEXT[],
    category VARCHAR(100),
    is_favorite BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reading Sessions
CREATE TABLE reading_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    
    -- Session Information
    session_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_end TIMESTAMP,
    duration_seconds INTEGER,
    
    -- Reading Progress During Session
    start_position INTEGER,
    end_position INTEGER,
    words_read INTEGER DEFAULT 0,
    pages_read INTEGER DEFAULT 0,
    
    -- Device and Context
    device_type VARCHAR(50), -- 'desktop', 'mobile', 'tablet'
    user_agent TEXT,
    ip_address INET,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Book Collections (user-created collections)
CREATE TABLE book_collections (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    cover_image_path VARCHAR(500),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Collection Books (many-to-many)
CREATE TABLE collection_books (
    id SERIAL PRIMARY KEY,
    collection_id INTEGER REFERENCES book_collections(id) ON DELETE CASCADE,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(collection_id, book_id)
);

-- Create indexes for performance
CREATE INDEX idx_books_type ON books(book_type);
CREATE INDEX idx_books_status ON books(status);
CREATE INDEX idx_books_featured ON books(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_books_search ON books USING gin(search_vector);
CREATE INDEX idx_books_category ON books(category_id);
CREATE INDEX idx_books_author ON books(author_id);

CREATE INDEX idx_book_formats_book ON book_formats(book_id);
CREATE INDEX idx_book_formats_type ON book_formats(format_type);
CREATE INDEX idx_book_formats_hash ON book_formats(file_hash);

CREATE INDEX idx_book_chapters_book ON book_chapters(book_id);
CREATE INDEX idx_book_chapters_number ON book_chapters(book_id, chapter_number);

CREATE INDEX idx_reading_progress_user ON reading_progress(user_id);
CREATE INDEX idx_reading_progress_book ON reading_progress(book_id);
CREATE INDEX idx_reading_progress_active ON reading_progress(user_id, last_read_at) WHERE completed_at IS NULL;

CREATE INDEX idx_user_highlights_user ON user_highlights(user_id);
CREATE INDEX idx_user_highlights_book ON user_highlights(book_id);

CREATE INDEX idx_user_notes_user ON user_notes(user_id);
CREATE INDEX idx_user_notes_book ON user_notes(book_id);

CREATE INDEX idx_reading_sessions_user ON reading_sessions(user_id);
CREATE INDEX idx_reading_sessions_book ON reading_sessions(book_id);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_book_formats_updated_at BEFORE UPDATE ON book_formats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_book_content_structure_updated_at BEFORE UPDATE ON book_content_structure FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reading_progress_updated_at BEFORE UPDATE ON reading_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_highlights_updated_at BEFORE UPDATE ON user_highlights FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_notes_updated_at BEFORE UPDATE ON user_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_book_collections_updated_at BEFORE UPDATE ON book_collections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create search trigger for books
CREATE OR REPLACE FUNCTION update_book_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := to_tsvector('english', 
        COALESCE(NEW.title, '') || ' ' ||
        COALESCE(NEW.subtitle, '') || ' ' ||
        COALESCE(NEW.description, '') || ' ' ||
        COALESCE(NEW.isbn, '') || ' ' ||
        COALESCE(NEW.publisher, '')
    );
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_book_search_vector_trigger 
    BEFORE INSERT OR UPDATE ON books 
    FOR EACH ROW EXECUTE FUNCTION update_book_search_vector();