-- E-Reader Database Tables Migration
-- Run this script to create all necessary tables for the e-reader functionality

-- Create reading_progress table
CREATE TABLE IF NOT EXISTS reading_progress (
    id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    current_position INTEGER DEFAULT 0,
    percentage NUMERIC(5,2) DEFAULT 0.00,
    time_spent INTEGER DEFAULT 0, -- Total time in seconds
    last_read_at TIMESTAMP DEFAULT NOW(),
    session_start_time TIMESTAMP DEFAULT NOW(),
    words_read INTEGER DEFAULT 0,
    chapters_completed INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_user_book_progress UNIQUE(book_id, user_id),
    CONSTRAINT fk_progress_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    CONSTRAINT fk_progress_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create highlights table
CREATE TABLE IF NOT EXISTS highlights (
    id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    start_offset INTEGER NOT NULL,
    end_offset INTEGER NOT NULL,
    color VARCHAR(20) DEFAULT 'yellow' CHECK (color IN ('yellow', 'green', 'blue', 'pink', 'purple')),
    note TEXT,
    chapter_index INTEGER,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_highlight_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    CONSTRAINT fk_highlight_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'general',
    tags JSONB DEFAULT '[]',
    attached_to_highlight INTEGER,
    position INTEGER DEFAULT 0,
    chapter_index INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_note_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    CONSTRAINT fk_note_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_note_highlight FOREIGN KEY (attached_to_highlight) REFERENCES highlights(id) ON DELETE SET NULL
);

-- Create reading_sessions table for analytics
CREATE TABLE IF NOT EXISTS reading_sessions (
    id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    session_id VARCHAR(100) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration INTEGER DEFAULT 0, -- Duration in seconds
    words_read INTEGER DEFAULT 0,
    progress_start NUMERIC(5,2) DEFAULT 0.00,
    progress_end NUMERIC(5,2) DEFAULT 0.00,
    device_type VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_session_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create reading_analytics table for daily/weekly/monthly stats
CREATE TABLE IF NOT EXISTS reading_analytics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    date DATE NOT NULL,
    total_reading_time INTEGER DEFAULT 0, -- Total time in seconds
    words_read INTEGER DEFAULT 0,
    books_read INTEGER DEFAULT 0,
    pages_read INTEGER DEFAULT 0,
    average_wpm NUMERIC(6,2) DEFAULT 0.00, -- Words per minute
    reading_streak INTEGER DEFAULT 0, -- Consecutive days
    session_count INTEGER DEFAULT 0,
    longest_session INTEGER DEFAULT 0, -- Longest session in seconds
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_user_date_analytics UNIQUE(user_id, date),
    CONSTRAINT fk_analytics_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create reader_settings table for user preferences
CREATE TABLE IF NOT EXISTS reader_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    font_size INTEGER DEFAULT 18 CHECK (font_size >= 12 AND font_size <= 24),
    font_family VARCHAR(100) DEFAULT 'serif',
    line_height NUMERIC(3,2) DEFAULT 1.6 CHECK (line_height >= 1.2 AND line_height <= 2.0),
    font_weight INTEGER DEFAULT 400,
    theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'sepia')),
    reading_width VARCHAR(20) DEFAULT 'medium' CHECK (reading_width IN ('narrow', 'medium', 'wide')),
    margins INTEGER DEFAULT 20 CHECK (margins >= 0 AND margins <= 100),
    padding INTEGER DEFAULT 16 CHECK (padding >= 0 AND padding <= 50),
    justify_text BOOLEAN DEFAULT true,
    show_progress_bar BOOLEAN DEFAULT true,
    show_chapter_numbers BOOLEAN DEFAULT true,
    tts_enabled BOOLEAN DEFAULT false,
    tts_voice VARCHAR(200) DEFAULT '',
    tts_speed NUMERIC(3,2) DEFAULT 1.0 CHECK (tts_speed >= 0.5 AND tts_speed <= 2.0),
    tts_auto_play BOOLEAN DEFAULT false,
    high_contrast BOOLEAN DEFAULT false,
    reduce_motion BOOLEAN DEFAULT false,
    screen_reader_mode BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_settings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create book_access_logs table for security and analytics
CREATE TABLE IF NOT EXISTS book_access_logs (
    id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    access_type VARCHAR(50) NOT NULL, -- 'read', 'download', 'export'
    ip_address INET,
    user_agent TEXT,
    accessed_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_access_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    CONSTRAINT fk_access_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reading_progress_user_book ON reading_progress(user_id, book_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_last_read ON reading_progress(last_read_at);
CREATE INDEX IF NOT EXISTS idx_highlights_user_book ON highlights(user_id, book_id);
CREATE INDEX IF NOT EXISTS idx_highlights_created ON highlights(created_at);
CREATE INDEX IF NOT EXISTS idx_notes_user_book ON notes(user_id, book_id);
CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category);
CREATE INDEX IF NOT EXISTS idx_notes_created ON notes(created_at);
CREATE INDEX IF NOT EXISTS idx_notes_tags ON notes USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_sessions_user_date ON reading_sessions(user_id, start_time);
CREATE INDEX IF NOT EXISTS idx_analytics_user_date ON reading_analytics(user_id, date);
CREATE INDEX IF NOT EXISTS idx_access_logs_user_date ON book_access_logs(user_id, accessed_at);
CREATE INDEX IF NOT EXISTS idx_access_logs_book ON book_access_logs(book_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at column
CREATE TRIGGER update_reading_progress_updated_at BEFORE UPDATE ON reading_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_updated_at BEFORE UPDATE ON reading_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON reader_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default reader settings for existing users (optional)
-- INSERT INTO reader_settings (user_id)
-- SELECT id FROM users
-- WHERE NOT EXISTS (SELECT 1 FROM reader_settings WHERE reader_settings.user_id = users.id);

-- Create view for reading statistics
CREATE OR REPLACE VIEW reading_stats_view AS
SELECT
    u.id as user_id,
    u.name as user_name,
    COUNT(DISTINCT rp.book_id) as books_started,
    COUNT(DISTINCT CASE WHEN rp.percentage >= 100 THEN rp.book_id END) as books_completed,
    SUM(rp.time_spent) as total_reading_time,
    AVG(rp.percentage) as average_progress,
    COUNT(DISTINCT h.id) as total_highlights,
    COUNT(DISTINCT n.id) as total_notes,
    MAX(rp.last_read_at) as last_activity
FROM users u
LEFT JOIN reading_progress rp ON u.id = rp.user_id
LEFT JOIN highlights h ON u.id = h.user_id
LEFT JOIN notes n ON u.id = n.user_id
GROUP BY u.id, u.name;

-- Create view for book popularity
CREATE OR REPLACE VIEW book_popularity_view AS
SELECT
    b.id as book_id,
    b.title,
    b.author,
    COUNT(DISTINCT rp.user_id) as readers_count,
    AVG(rp.percentage) as average_progress,
    COUNT(DISTINCT h.id) as total_highlights,
    COUNT(DISTINCT n.id) as total_notes,
    AVG(rp.time_spent) as average_reading_time
FROM books b
LEFT JOIN reading_progress rp ON b.id = rp.book_id
LEFT JOIN highlights h ON b.id = h.book_id
LEFT JOIN notes n ON b.id = n.book_id
WHERE rp.percentage > 0 OR h.id IS NOT NULL OR n.id IS NOT NULL
GROUP BY b.id, b.title, b.author
ORDER BY readers_count DESC, average_progress DESC;

-- Sample data insertion (uncomment if you want to test with sample data)
/*
-- Insert sample reader settings for user ID 1
INSERT INTO reader_settings (user_id) VALUES (1) ON CONFLICT (user_id) DO NOTHING;

-- Insert sample reading progress
INSERT INTO reading_progress (book_id, user_id, current_position, percentage, time_spent, words_read)
VALUES (1, 1, 1500, 25.5, 3600, 1200) ON CONFLICT (book_id, user_id) DO NOTHING;

-- Insert sample highlight
INSERT INTO highlights (book_id, user_id, text, start_offset, end_offset, color, note)
VALUES (1, 1, 'This is an important passage about the main character.', 1200, 1260, 'yellow', 'Key character development moment');

-- Insert sample note
INSERT INTO notes (book_id, user_id, title, content, category, tags)
VALUES (1, 1, 'Character Analysis', 'The protagonist shows significant growth in this chapter.', 'analysis', '["character", "development", "growth"]');
*/
