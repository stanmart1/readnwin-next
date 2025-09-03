-- Create comprehensive image storage system with caching
-- This replaces file-based storage with database storage

-- Main images table for storing all image data
CREATE TABLE IF NOT EXISTS images (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  image_data BYTEA NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'profile', 'cover', 'work', 'payment_proof', 'blog', etc.
  entity_type VARCHAR(50), -- 'user', 'book', 'work', 'order', 'blog_post', etc.
  entity_id INTEGER, -- ID of the related entity
  alt_text TEXT,
  is_active BOOLEAN DEFAULT true,
  uploaded_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Image cache table for frequently accessed images
CREATE TABLE IF NOT EXISTS image_cache (
  id SERIAL PRIMARY KEY,
  image_id INTEGER REFERENCES images(id) ON DELETE CASCADE,
  cache_key VARCHAR(255) UNIQUE NOT NULL,
  cached_data BYTEA NOT NULL,
  content_type VARCHAR(100) NOT NULL,
  cache_size INTEGER NOT NULL,
  access_count INTEGER DEFAULT 0,
  last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Image variants table for different sizes/formats
CREATE TABLE IF NOT EXISTS image_variants (
  id SERIAL PRIMARY KEY,
  image_id INTEGER REFERENCES images(id) ON DELETE CASCADE,
  variant_type VARCHAR(50) NOT NULL, -- 'thumbnail', 'medium', 'large', 'webp', etc.
  width INTEGER,
  height INTEGER,
  file_size INTEGER NOT NULL,
  image_data BYTEA NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cache statistics for monitoring
CREATE TABLE IF NOT EXISTS cache_statistics (
  id SERIAL PRIMARY KEY,
  cache_hits INTEGER DEFAULT 0,
  cache_misses INTEGER DEFAULT 0,
  total_requests INTEGER DEFAULT 0,
  cache_size_bytes BIGINT DEFAULT 0,
  last_cleared TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_images_category ON images(category);
CREATE INDEX IF NOT EXISTS idx_images_entity ON images(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_images_filename ON images(filename);
CREATE INDEX IF NOT EXISTS idx_image_cache_key ON image_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_image_cache_accessed ON image_cache(last_accessed);
CREATE INDEX IF NOT EXISTS idx_image_variants_type ON image_variants(image_id, variant_type);

-- Insert initial cache statistics record
INSERT INTO cache_statistics (cache_hits, cache_misses, total_requests, cache_size_bytes)
VALUES (0, 0, 0, 0)
ON CONFLICT DO NOTHING;

-- Add image_id column to existing tables to link with new image system
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_id INTEGER REFERENCES images(id);
ALTER TABLE books ADD COLUMN IF NOT EXISTS cover_image_id INTEGER REFERENCES images(id);
ALTER TABLE works ADD COLUMN IF NOT EXISTS image_id INTEGER REFERENCES images(id);
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS featured_image_id INTEGER REFERENCES images(id);