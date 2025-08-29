-- Critical performance indexes for notifications API
-- Run this immediately to fix the 1490ms response time

-- Drop existing inefficient indexes if they exist
DROP INDEX IF EXISTS idx_user_notifications_title_gin;
DROP INDEX IF EXISTS idx_user_notifications_message_gin;

-- Create optimized indexes for the exact query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_isread_created 
ON user_notifications (is_read, created_at DESC) 
WHERE is_read = false;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_type_created 
ON user_notifications (type, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_userid_created 
ON user_notifications (user_id, created_at DESC);

-- Composite index for the most common query: isRead=false with pagination
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_false_created 
ON user_notifications (created_at DESC) 
WHERE is_read = false;

-- Simple text search index (more efficient than GIN for small text fields)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_title_text 
ON user_notifications (title);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_message_text 
ON user_notifications (message);

-- Update table statistics
ANALYZE user_notifications;

-- Show query performance
EXPLAIN (ANALYZE, BUFFERS) 
SELECT id, user_id, type, title, message, is_read, created_at
FROM user_notifications 
WHERE is_read = false 
ORDER BY created_at DESC 
LIMIT 10;