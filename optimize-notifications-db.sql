-- Optimize notifications database performance
-- Run this to improve the slow /api/admin/notifications endpoint

-- Add indexes for user_notifications table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_notifications_created_at 
ON user_notifications (created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_notifications_is_read 
ON user_notifications (is_read);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_notifications_type 
ON user_notifications (type);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_notifications_user_id 
ON user_notifications (user_id);

-- Composite index for common filter combinations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_notifications_read_created 
ON user_notifications (is_read, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_notifications_type_created 
ON user_notifications (type, created_at DESC);

-- Text search index for title and message
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_notifications_title_gin 
ON user_notifications USING gin(to_tsvector('english', title));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_notifications_message_gin 
ON user_notifications USING gin(to_tsvector('english', message));

-- Analyze table to update statistics
ANALYZE user_notifications;

-- Show current table size and index usage
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats 
WHERE tablename = 'user_notifications';

-- Show index sizes
SELECT 
    indexname,
    indexdef,
    pg_size_pretty(pg_relation_size(indexname::regclass)) as size
FROM pg_indexes 
WHERE tablename = 'user_notifications';