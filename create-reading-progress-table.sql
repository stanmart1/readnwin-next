-- Create reading_progress table for tracking user reading progress
CREATE TABLE IF NOT EXISTS reading_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    book_id INTEGER NOT NULL,
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    current_position INTEGER DEFAULT 0,
    current_page INTEGER DEFAULT 0,
    total_pages INTEGER DEFAULT 0,
    current_chapter_id VARCHAR(255),
    last_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    time_spent INTEGER DEFAULT 0,
    total_reading_time_seconds INTEGER DEFAULT 0,
    reading_speed_wpm INTEGER DEFAULT 0,
    notes TEXT,
    bookmarks JSONB DEFAULT '[]',
    highlights JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(user_id, book_id),
    CONSTRAINT fk_reading_progress_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_reading_progress_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    CONSTRAINT check_progress_percentage CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    CONSTRAINT check_current_position CHECK (current_position >= 0),
    CONSTRAINT check_time_spent CHECK (time_spent >= 0)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reading_progress_user_id ON reading_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_book_id ON reading_progress(book_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_last_read ON reading_progress(last_read_at DESC);
CREATE INDEX IF NOT EXISTS idx_reading_progress_completed ON reading_progress(completed_at) WHERE completed_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reading_progress_active ON reading_progress(user_id, last_read_at DESC) WHERE progress_percentage > 0 AND progress_percentage < 100;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_reading_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reading_progress_updated_at 
    BEFORE UPDATE ON reading_progress 
    FOR EACH ROW 
    EXECUTE FUNCTION update_reading_progress_updated_at();

-- Insert some sample data for testing (optional)
-- This will only insert if there are existing users and books
INSERT INTO reading_progress (user_id, book_id, progress_percentage, current_position, total_pages, last_read_at, time_spent)
SELECT 
    u.id as user_id,
    b.id as book_id,
    CASE 
        WHEN random() < 0.3 THEN 100 -- 30% completed books
        WHEN random() < 0.6 THEN (random() * 80 + 10)::DECIMAL(5,2) -- 30% in progress
        ELSE 0 -- 40% not started
    END as progress_percentage,
    CASE 
        WHEN random() < 0.6 THEN (random() * 200)::INTEGER
        ELSE 0
    END as current_position,
    (random() * 300 + 100)::INTEGER as total_pages,
    CURRENT_TIMESTAMP - (random() * INTERVAL '30 days') as last_read_at,
    (random() * 7200)::INTEGER as time_spent -- 0-2 hours in seconds
FROM users u
CROSS JOIN books b
WHERE EXISTS (SELECT 1 FROM user_library ul WHERE ul.user_id = u.id AND ul.book_id = b.id)
AND NOT EXISTS (SELECT 1 FROM reading_progress rp WHERE rp.user_id = u.id AND rp.book_id = b.id)
LIMIT 50; -- Limit to prevent too much sample data