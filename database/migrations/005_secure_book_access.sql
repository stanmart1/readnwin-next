-- Migration: Secure Book Access System
-- Description: Add tables and indexes for secure book file access and session management

-- Create secure file access logs table
CREATE TABLE IF NOT EXISTS secure_file_access_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    file_path TEXT,
    access_status VARCHAR(20) NOT NULL CHECK (access_status IN ('success', 'error', 'denied')),
    error_message TEXT,
    ip_address INET,
    user_agent TEXT,
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for performance
    INDEX idx_secure_file_access_user_id (user_id),
    INDEX idx_secure_file_access_book_id (book_id),
    INDEX idx_secure_file_access_status (access_status),
    INDEX idx_secure_file_access_accessed_at (accessed_at)
);

-- Create book resource access logs table
CREATE TABLE IF NOT EXISTS book_resource_access_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    resource_path TEXT NOT NULL,
    access_count INTEGER DEFAULT 1,
    first_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicates
    UNIQUE(user_id, book_id, resource_path),
    
    -- Indexes for performance
    INDEX idx_book_resource_access_user_id (user_id),
    INDEX idx_book_resource_access_book_id (book_id),
    INDEX idx_book_resource_access_accessed_at (accessed_at)
);

-- Create reading sessions table for session management
CREATE TABLE IF NOT EXISTS reading_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    session_token VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    
    -- Indexes for performance
    INDEX idx_reading_sessions_user_id (user_id),
    INDEX idx_reading_sessions_book_id (book_id),
    INDEX idx_reading_sessions_token (session_token),
    INDEX idx_reading_sessions_expires_at (expires_at),
    INDEX idx_reading_sessions_user_book (user_id, book_id)
);

-- Add storage_path column to books table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' AND column_name = 'storage_path'
    ) THEN
        ALTER TABLE books ADD COLUMN storage_path TEXT;
        
        -- Update existing books with default storage paths
        UPDATE books SET storage_path = '/storage/books/' || id::text WHERE storage_path IS NULL;
    END IF;
END $$;

-- Add visibility column to books table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' AND column_name = 'visibility'
    ) THEN
        ALTER TABLE books ADD COLUMN visibility VARCHAR(20) DEFAULT 'private' 
        CHECK (visibility IN ('public', 'private', 'restricted'));
    END IF;
END $$;

-- Create function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_reading_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM reading_sessions WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to validate book access
CREATE OR REPLACE FUNCTION validate_user_book_access(p_user_id INTEGER, p_book_id INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    has_access BOOLEAN := FALSE;
BEGIN
    -- Check if user owns the book (purchased or in library)
    SELECT EXISTS(
        SELECT 1 FROM user_library 
        WHERE user_id = p_user_id AND book_id = p_book_id
        UNION
        SELECT 1 FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.user_id = p_user_id AND oi.book_id = p_book_id AND o.payment_status = 'paid'
        UNION
        SELECT 1 FROM books b
        WHERE b.id = p_book_id AND (b.price = 0 OR b.visibility = 'public')
    ) INTO has_access;
    
    RETURN has_access;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance on book access queries
CREATE INDEX IF NOT EXISTS idx_books_price_visibility ON books(price, visibility);
CREATE INDEX IF NOT EXISTS idx_books_status_visibility ON books(status, visibility);
CREATE INDEX IF NOT EXISTS idx_user_library_user_book ON user_library(user_id, book_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_payment_status ON orders(user_id, payment_status);
CREATE INDEX IF NOT EXISTS idx_order_items_book_order ON order_items(book_id, order_id);

-- Add comments for documentation
COMMENT ON TABLE secure_file_access_logs IS 'Logs all secure file access attempts for security auditing';
COMMENT ON TABLE book_resource_access_logs IS 'Tracks access to individual book resources (images, fonts, etc.)';
COMMENT ON TABLE reading_sessions IS 'Manages active reading sessions for security and analytics';
COMMENT ON FUNCTION validate_user_book_access IS 'Validates if a user has access to a specific book';
COMMENT ON FUNCTION cleanup_expired_reading_sessions IS 'Removes expired reading sessions';

-- Grant necessary permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON secure_file_access_logs TO app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON book_resource_access_logs TO app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON reading_sessions TO app_user;
-- GRANT EXECUTE ON FUNCTION validate_user_book_access TO app_user;
-- GRANT EXECUTE ON FUNCTION cleanup_expired_reading_sessions TO app_user;