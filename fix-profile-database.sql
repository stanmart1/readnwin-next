-- Add missing columns to users table for profile functionality
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS profile_image TEXT DEFAULT '';

-- Update existing users to have empty bio and profile_image if they're null
UPDATE users 
SET 
  bio = COALESCE(bio, ''),
  profile_image = COALESCE(profile_image, avatar_url, '')
WHERE bio IS NULL OR profile_image IS NULL;

-- Create student_info table if it doesn't exist
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

-- Create reading_progress table if it doesn't exist
CREATE TABLE IF NOT EXISTS reading_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  book_id INTEGER,
  pages_read INTEGER DEFAULT 0,
  reading_time DECIMAL(10,2) DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3,2),
  read_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create books table if it doesn't exist (basic structure)
CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  author VARCHAR(255),
  isbn VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create genres table if it doesn't exist
CREATE TABLE IF NOT EXISTS genres (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create book_genres junction table if it doesn't exist
CREATE TABLE IF NOT EXISTS book_genres (
  id SERIAL PRIMARY KEY,
  book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
  genre_id INTEGER REFERENCES genres(id) ON DELETE CASCADE,
  UNIQUE(book_id, genre_id)
);

-- Insert some default genres if the table is empty
INSERT INTO genres (name) VALUES 
  ('Fiction'), ('Non-Fiction'), ('Science Fiction'), ('Romance'), ('Mystery'), 
  ('Biography'), ('History'), ('Self-Help'), ('Technology'), ('Business')
ON CONFLICT (name) DO NOTHING;