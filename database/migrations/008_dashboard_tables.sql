-- Dashboard Tables Migration
-- Create missing tables for dashboard functionality

-- Reading Progress Table
CREATE TABLE IF NOT EXISTS reading_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    book_id INTEGER NOT NULL,
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    current_chapter_id VARCHAR(255),
    current_position INTEGER DEFAULT 0,
    pages_read INTEGER DEFAULT 0,
    total_reading_time_seconds INTEGER DEFAULT 0,
    last_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, book_id)
);

-- Reading Sessions Table
CREATE TABLE IF NOT EXISTS reading_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    book_id INTEGER NOT NULL,
    session_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_end TIMESTAMP NULL,
    duration_seconds INTEGER DEFAULT 0,
    pages_read INTEGER DEFAULT 0,
    progress_start DECIMAL(5,2) DEFAULT 0,
    progress_end DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Library Table
CREATE TABLE IF NOT EXISTS user_library (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    book_id INTEGER NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    access_type VARCHAR(50) DEFAULT 'purchased',
    status VARCHAR(50) DEFAULT 'active',
    UNIQUE(user_id, book_id)
);

-- Book Reviews Table
CREATE TABLE IF NOT EXISTS book_reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    book_id INTEGER NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, book_id)
);

-- User Goals Table
CREATE TABLE IF NOT EXISTS user_goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    goal_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_value INTEGER NOT NULL,
    current_value INTEGER DEFAULT 0,
    target_date DATE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Activities Table
CREATE TABLE IF NOT EXISTS user_activities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    activity_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Notifications Table
CREATE TABLE IF NOT EXISTS user_notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reading_progress_user_id ON reading_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_book_id ON reading_progress(book_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_user_id ON reading_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_library_user_id ON user_library(user_id);
CREATE INDEX IF NOT EXISTS idx_book_reviews_user_id ON book_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON user_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_unread ON user_notifications(user_id, is_read);

-- Insert some default goals for existing users
INSERT INTO user_goals (user_id, goal_type, title, description, target_value, target_date)
SELECT 
    id as user_id,
    'books_per_month' as goal_type,
    'Read 2 Books This Month' as title,
    'Complete reading 2 books by the end of this month' as description,
    2 as target_value,
    DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day' as target_date
FROM users 
WHERE NOT EXISTS (
    SELECT 1 FROM user_goals WHERE user_id = users.id AND goal_type = 'books_per_month'
)
ON CONFLICT DO NOTHING;

INSERT INTO user_goals (user_id, goal_type, title, description, target_value, target_date)
SELECT 
    id as user_id,
    'reading_time' as goal_type,
    'Read 10 Hours This Month' as title,
    'Spend 10 hours reading this month' as description,
    36000 as target_value, -- 10 hours in seconds
    DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day' as target_date
FROM users 
WHERE NOT EXISTS (
    SELECT 1 FROM user_goals WHERE user_id = users.id AND goal_type = 'reading_time'
)
ON CONFLICT DO NOTHING;

INSERT INTO user_goals (user_id, goal_type, title, description, target_value, target_date)
SELECT 
    id as user_id,
    'yearly_books' as goal_type,
    'Read 24 Books This Year' as title,
    'Complete reading 24 books by the end of this year' as description,
    24 as target_value,
    DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year' - INTERVAL '1 day' as target_date
FROM users 
WHERE NOT EXISTS (
    SELECT 1 FROM user_goals WHERE user_id = users.id AND goal_type = 'yearly_books'
)
ON CONFLICT DO NOTHING;