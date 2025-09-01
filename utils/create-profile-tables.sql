-- Profile-related tables for ReadnWin

-- Add missing columns to users table if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_student BOOLEAN DEFAULT FALSE;

-- Student information table
CREATE TABLE IF NOT EXISTS student_info (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  school_name VARCHAR(255),
  matriculation_number VARCHAR(100),
  department VARCHAR(255),
  course VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Reading progress table
CREATE TABLE IF NOT EXISTS reading_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
  pages_read INTEGER DEFAULT 0,
  reading_time INTEGER DEFAULT 0, -- in minutes
  completed BOOLEAN DEFAULT FALSE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  read_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, book_id)
);

-- Genres table
CREATE TABLE IF NOT EXISTS genres (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Book genres relationship table
CREATE TABLE IF NOT EXISTS book_genres (
  id SERIAL PRIMARY KEY,
  book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
  genre_id INTEGER REFERENCES genres(id) ON DELETE CASCADE,
  UNIQUE(book_id, genre_id)
);

-- Insert some default genres
INSERT INTO genres (name, description) VALUES
('Fiction', 'Fictional stories and novels'),
('Non-Fiction', 'Factual and informational books'),
('Science Fiction', 'Science fiction and futuristic stories'),
('Fantasy', 'Fantasy and magical stories'),
('Mystery', 'Mystery and detective stories'),
('Romance', 'Romantic stories'),
('Thriller', 'Thriller and suspense stories'),
('Biography', 'Life stories of real people'),
('History', 'Historical books and accounts'),
('Self-Help', 'Personal development and self-improvement'),
('Business', 'Business and entrepreneurship'),
('Technology', 'Technology and computing'),
('Health', 'Health and wellness'),
('Education', 'Educational and academic content'),
('Children', 'Books for children'),
('Young Adult', 'Books for young adults'),
('Poetry', 'Poetry and verse'),
('Drama', 'Plays and dramatic works'),
('Philosophy', 'Philosophical works'),
('Religion', 'Religious and spiritual texts')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_info_user_id ON student_info(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_user_id ON reading_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_book_id ON reading_progress(book_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_completed ON reading_progress(completed);
CREATE INDEX IF NOT EXISTS idx_reading_progress_read_date ON reading_progress(read_date);
CREATE INDEX IF NOT EXISTS idx_book_genres_book_id ON book_genres(book_id);
CREATE INDEX IF NOT EXISTS idx_book_genres_genre_id ON book_genres(genre_id);
CREATE INDEX IF NOT EXISTS idx_genres_name ON genres(name);