-- Create missing tables for book management system

-- Authors table
CREATE TABLE IF NOT EXISTS authors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  bio TEXT,
  avatar_url VARCHAR(500),
  website_url VARCHAR(500),
  social_media JSONB,
  is_verified BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  description TEXT,
  parent_id INTEGER REFERENCES categories(id),
  image_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Books table (enhanced)
CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  subtitle VARCHAR(500),
  author_id INTEGER REFERENCES authors(id),
  category_id INTEGER REFERENCES categories(id),
  isbn VARCHAR(50),
  description TEXT,
  short_description TEXT,
  cover_image_url VARCHAR(500),
  sample_pdf_url VARCHAR(500),
  ebook_file_url VARCHAR(500),
  format VARCHAR(50) DEFAULT 'ebook',
  file_format VARCHAR(50),
  language VARCHAR(10) DEFAULT 'en',
  pages INTEGER,
  publication_date DATE,
  publisher VARCHAR(255),
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  cost_price DECIMAL(10,2),
  weight_grams INTEGER,
  dimensions JSONB,
  stock_quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 10,
  is_featured BOOLEAN DEFAULT false,
  is_bestseller BOOLEAN DEFAULT false,
  is_new_release BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'published',
  seo_title VARCHAR(255),
  seo_description TEXT,
  seo_keywords TEXT,
  view_count INTEGER DEFAULT 0,
  inventory_enabled BOOLEAN DEFAULT false,
  word_count INTEGER DEFAULT 0,
  estimated_reading_time INTEGER DEFAULT 0,
  processing_status VARCHAR(50) DEFAULT 'pending',
  chapters JSONB,
  file_size BIGINT,
  file_hash VARCHAR(255),
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(100) UNIQUE NOT NULL,
  user_id INTEGER,
  guest_email VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  shipping_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'NGN',
  payment_method VARCHAR(100),
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_transaction_id VARCHAR(255),
  shipping_address JSONB,
  billing_address JSONB,
  shipping_method VARCHAR(100),
  tracking_number VARCHAR(255),
  estimated_delivery_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  book_id INTEGER REFERENCES books(id),
  title VARCHAR(500) NOT NULL,
  author_name VARCHAR(255),
  price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  total_price DECIMAL(10,2) NOT NULL,
  format VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cart items table
CREATE TABLE IF NOT EXISTS cart_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, book_id)
);

-- User library table
CREATE TABLE IF NOT EXISTS user_library (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
  order_id INTEGER REFERENCES orders(id),
  purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  download_count INTEGER DEFAULT 0,
  last_downloaded_at TIMESTAMP,
  is_favorite BOOLEAN DEFAULT false,
  access_type VARCHAR(50) DEFAULT 'full',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, book_id)
);

-- Book reviews table
CREATE TABLE IF NOT EXISTS book_reviews (
  id SERIAL PRIMARY KEY,
  book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  review_text TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  is_helpful_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(book_id, user_id)
);

-- Reading progress table
CREATE TABLE IF NOT EXISTS reading_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
  current_page INTEGER DEFAULT 0,
  total_pages INTEGER,
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  last_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, book_id)
);

-- Insert default categories if none exist
INSERT INTO categories (name, slug, description, sort_order) 
SELECT * FROM (VALUES 
  ('Fiction', 'fiction', 'Fictional stories and novels', 1),
  ('Non-Fiction', 'non-fiction', 'Educational and informational books', 2),
  ('Romance', 'romance', 'Love stories and romantic novels', 3),
  ('Mystery', 'mystery', 'Mystery and thriller books', 4),
  ('Science Fiction', 'science-fiction', 'Sci-fi and futuristic stories', 5),
  ('Biography', 'biography', 'Life stories and memoirs', 6),
  ('Self-Help', 'self-help', 'Personal development books', 7),
  ('Business', 'business', 'Business and entrepreneurship', 8)
) AS v(name, slug, description, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM categories LIMIT 1);

-- Insert default author if none exist
INSERT INTO authors (name, email, status) 
SELECT 'Unknown Author', 'unknown@example.com', 'active'
WHERE NOT EXISTS (SELECT 1 FROM authors LIMIT 1);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_books_author_id ON books(author_id);
CREATE INDEX IF NOT EXISTS idx_books_category_id ON books(category_id);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_user_library_user_id ON user_library(user_id);
CREATE INDEX IF NOT EXISTS idx_book_reviews_book_id ON book_reviews(book_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_user_id ON reading_progress(user_id);