-- Ecommerce Database Schema for ReadnWin

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  parent_id INTEGER REFERENCES categories(id),
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Authors table
CREATE TABLE IF NOT EXISTS authors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  bio TEXT,
  avatar_url TEXT,
  website_url TEXT,
  social_media JSONB,
  is_verified BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Books/Products table
CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  author_id INTEGER REFERENCES authors(id),
  category_id INTEGER REFERENCES categories(id),
  isbn VARCHAR(20) UNIQUE,
  description TEXT,
  short_description VARCHAR(500),
  cover_image_url TEXT,
  sample_pdf_url TEXT,
  ebook_file_url TEXT,
  format VARCHAR(20) DEFAULT 'ebook' CHECK (format IN ('ebook', 'physical', 'audiobook', 'both')),
  language VARCHAR(10) DEFAULT 'en',
  pages INTEGER,
  publication_date DATE,
  publisher VARCHAR(255),
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  cost_price DECIMAL(10,2),
  weight_grams INTEGER,
  dimensions JSONB, -- {length, width, height}
  stock_quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 10,
  is_featured BOOLEAN DEFAULT FALSE,
  is_bestseller BOOLEAN DEFAULT FALSE,
  is_new_release BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived', 'out_of_stock')),
  seo_title VARCHAR(255),
  seo_description TEXT,
  seo_keywords TEXT,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Book tags for better categorization
CREATE TABLE IF NOT EXISTS book_tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  color VARCHAR(7) DEFAULT '#3B82F6',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Book-tag relationship
CREATE TABLE IF NOT EXISTS book_tag_relations (
  book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES book_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (book_id, tag_id)
);

-- Book reviews and ratings
CREATE TABLE IF NOT EXISTS book_reviews (
  id SERIAL PRIMARY KEY,
  book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  review_text TEXT,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  is_helpful_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(book_id, user_id)
);

-- Shopping cart
CREATE TABLE IF NOT EXISTS cart_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, book_id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id),
  guest_email VARCHAR(255), -- For guest checkout
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  shipping_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  payment_method VARCHAR(50),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
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

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  book_id INTEGER REFERENCES books(id),
  title VARCHAR(255) NOT NULL,
  author_name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  format VARCHAR(20) DEFAULT 'ebook',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Discounts and coupons
CREATE TABLE IF NOT EXISTS discounts (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value DECIMAL(10,2) NOT NULL,
  minimum_order_amount DECIMAL(10,2) DEFAULT 0,
  maximum_discount_amount DECIMAL(10,2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  valid_from TIMESTAMP,
  valid_until TIMESTAMP,
  applicable_categories INTEGER[], -- Array of category IDs
  applicable_books INTEGER[], -- Array of book IDs
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User wishlist
CREATE TABLE IF NOT EXISTS wishlist_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, book_id)
);

-- User reading progress
CREATE TABLE IF NOT EXISTS reading_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
  current_page INTEGER DEFAULT 0,
  total_pages INTEGER,
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  last_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, book_id)
);

-- Reading sessions for detailed analytics
CREATE TABLE IF NOT EXISTS reading_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
  session_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  session_end TIMESTAMP,
  pages_read INTEGER DEFAULT 0,
  duration_minutes INTEGER DEFAULT 0,
  device_info JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment transactions table for payment tracking
CREATE TABLE IF NOT EXISTS payment_transactions (
  id SERIAL PRIMARY KEY,
  transaction_id VARCHAR(255) UNIQUE NOT NULL,
  order_id INTEGER REFERENCES orders(id),
  user_id INTEGER REFERENCES users(id),
  gateway VARCHAR(50) NOT NULL, -- 'flutterwave', 'bank_transfer', etc.
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'NGN',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'successful', 'failed', 'cancelled', 'refunded')),
  gateway_response JSONB,
  payment_method VARCHAR(50),
  reference VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS reading_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
  session_start TIMESTAMP NOT NULL,
  session_end TIMESTAMP,
  start_page INTEGER NOT NULL,
  end_page INTEGER,
  pages_read INTEGER DEFAULT 0,
  reading_time_minutes INTEGER DEFAULT 0,
  reading_speed_wpm DECIMAL(8,2), -- Words per minute
  device_info JSONB, -- Browser/device information
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User bookmarks
CREATE TABLE IF NOT EXISTS user_bookmarks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  title VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, book_id, page_number)
);

-- User notes
CREATE TABLE IF NOT EXISTS user_notes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  note_text TEXT NOT NULL,
  note_type VARCHAR(20) DEFAULT 'general' CHECK (note_type IN ('general', 'summary', 'question', 'insight')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User highlights
CREATE TABLE IF NOT EXISTS user_highlights (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  start_position INTEGER NOT NULL,
  end_position INTEGER NOT NULL,
  highlighted_text TEXT NOT NULL,
  highlight_color VARCHAR(20) DEFAULT 'yellow' CHECK (highlight_color IN ('yellow', 'green', 'blue', 'pink', 'orange')),
  note_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reading speed tracking
CREATE TABLE IF NOT EXISTS reading_speed_tracking (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
  session_id INTEGER REFERENCES reading_sessions(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  words_on_page INTEGER NOT NULL,
  time_spent_seconds INTEGER NOT NULL,
  reading_speed_wpm DECIMAL(8,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User library (purchased books)
CREATE TABLE IF NOT EXISTS user_library (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
  order_id INTEGER REFERENCES orders(id),
  purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  download_count INTEGER DEFAULT 0,
  last_downloaded_at TIMESTAMP,
  is_favorite BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, book_id)
);

-- Inventory transactions
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id SERIAL PRIMARY KEY,
  book_id INTEGER REFERENCES books(id),
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('purchase', 'sale', 'adjustment', 'return')),
  quantity INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  reference_id INTEGER, -- Order ID or purchase order ID
  reference_type VARCHAR(50), -- 'order', 'purchase_order', 'adjustment'
  notes TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shipping methods
CREATE TABLE IF NOT EXISTS shipping_methods (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  base_cost DECIMAL(10,2) DEFAULT 0,
  cost_per_item DECIMAL(10,2) DEFAULT 0,
  free_shipping_threshold DECIMAL(10,2),
  estimated_days_min INTEGER,
  estimated_days_max INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tax rates
CREATE TABLE IF NOT EXISTS tax_rates (
  id SERIAL PRIMARY KEY,
  country VARCHAR(2) NOT NULL,
  state VARCHAR(100),
  city VARCHAR(100),
  postal_code VARCHAR(20),
  rate DECIMAL(5,4) NOT NULL,
  tax_name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email templates
CREATE TABLE IF NOT EXISTS email_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  subject VARCHAR(255) NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  variables JSONB, -- Template variables
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System settings for ecommerce
CREATE TABLE IF NOT EXISTS ecommerce_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(255) UNIQUE NOT NULL,
  setting_value TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_books_category_id ON books(category_id);
CREATE INDEX IF NOT EXISTS idx_books_author_id ON books(author_id);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_books_price ON books(price);
CREATE INDEX IF NOT EXISTS idx_books_created_at ON books(created_at);
CREATE INDEX IF NOT EXISTS idx_books_is_featured ON books(is_featured);
CREATE INDEX IF NOT EXISTS idx_books_is_bestseller ON books(is_bestseller);
CREATE INDEX IF NOT EXISTS idx_books_is_new_release ON books(is_new_release);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_book_id ON order_items(book_id);

CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_book_id ON cart_items(book_id);

CREATE INDEX IF NOT EXISTS idx_book_reviews_book_id ON book_reviews(book_id);
CREATE INDEX IF NOT EXISTS idx_book_reviews_user_id ON book_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_book_reviews_rating ON book_reviews(rating);

CREATE INDEX IF NOT EXISTS idx_user_library_user_id ON user_library(user_id);
CREATE INDEX IF NOT EXISTS idx_user_library_book_id ON user_library(book_id);

CREATE INDEX IF NOT EXISTS idx_reading_progress_user_id ON reading_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_book_id ON reading_progress(book_id);

CREATE INDEX IF NOT EXISTS idx_inventory_transactions_book_id ON inventory_transactions(book_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_created_at ON inventory_transactions(created_at);

-- Indexes for new dashboard tables
CREATE INDEX IF NOT EXISTS idx_reading_goals_user_id ON reading_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_goals_goal_type ON reading_goals(goal_type);
CREATE INDEX IF NOT EXISTS idx_reading_goals_is_active ON reading_goals(is_active);

CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_activity_type ON user_activity(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity(created_at);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_type ON user_notifications(type);
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON user_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON user_notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_type ON user_achievements(achievement_type);
CREATE INDEX IF NOT EXISTS idx_user_achievements_earned_at ON user_achievements(earned_at);

-- Reading goals table
CREATE TABLE IF NOT EXISTS reading_goals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  goal_type VARCHAR(50) NOT NULL CHECK (goal_type IN ('annual_books', 'monthly_pages', 'reading_streak', 'daily_hours')),
  target_value INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, goal_type, start_date)
);

-- User activity feed table
CREATE TABLE IF NOT EXISTS user_activity (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('completed', 'review', 'started', 'achievement', 'purchase', 'bookmark', 'goal_reached')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  book_id INTEGER REFERENCES books(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User notifications table
CREATE TABLE IF NOT EXISTS user_notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('achievement', 'book', 'social', 'reminder', 'system')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  achievement_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB
);

-- Insert default categories
INSERT INTO categories (name, slug, description, sort_order) VALUES
('Fiction', 'fiction', 'Literary fiction and novels', 1),
('Non-Fiction', 'non-fiction', 'Educational and informational books', 2),
('Self-Help', 'self-help', 'Personal development and improvement', 3),
('Business', 'business', 'Business and entrepreneurship', 4),
('Science Fiction', 'science-fiction', 'Science fiction and fantasy', 5),
('Mystery & Thriller', 'mystery-thriller', 'Suspense and detective stories', 6),
('Romance', 'romance', 'Love stories and romantic fiction', 7),
('Biography & Memoir', 'biography-memoir', 'Personal stories and biographies', 8),
('History', 'history', 'Historical books and accounts', 9),
('Technology', 'technology', 'Technology and programming', 10);

-- Insert default shipping methods
INSERT INTO shipping_methods (name, description, base_cost, cost_per_item, free_shipping_threshold, estimated_days_min, estimated_days_max) VALUES
('Standard Shipping', 'Standard ground shipping', 5.99, 1.99, 50.00, 3, 7),
('Express Shipping', 'Fast 2-3 day shipping', 12.99, 2.99, 100.00, 2, 3),
('Overnight Shipping', 'Next day delivery', 24.99, 4.99, 200.00, 1, 1),
('Digital Download', 'Instant digital access', 0.00, 0.00, 0.00, 0, 0);

-- Insert default email templates
INSERT INTO email_templates (name, subject, html_content, text_content, variables) VALUES
('order_confirmation', 'Order Confirmation - {{order_number}}', 
'<h1>Thank you for your order!</h1><p>Your order {{order_number}} has been confirmed.</p>',
'Thank you for your order! Your order {{order_number}} has been confirmed.',
'{"order_number": "string", "customer_name": "string", "order_total": "number"}'),
('order_shipped', 'Your order has been shipped - {{order_number}}',
'<h1>Your order is on its way!</h1><p>Order {{order_number}} has been shipped.</p>',
'Your order is on its way! Order {{order_number}} has been shipped.',
'{"order_number": "string", "tracking_number": "string", "estimated_delivery": "date"}'),
('welcome_email', 'Welcome to ReadnWin!',
'<h1>Welcome to ReadnWin!</h1><p>Thank you for joining our community of readers.</p>',
'Welcome to ReadnWin! Thank you for joining our community of readers.',
'{"customer_name": "string"}');

-- Insert default ecommerce settings
INSERT INTO ecommerce_settings (setting_key, setting_value, description) VALUES
('store_name', 'ReadnWin', 'Store name'),
('store_description', 'Your digital bookstore', 'Store description'),
('currency', 'USD', 'Default currency'),
('tax_rate', '0.08', 'Default tax rate'),
('free_shipping_threshold', '50.00', 'Free shipping threshold'),
('low_stock_threshold', '10', 'Low stock alert threshold'),
('max_downloads_per_book', '3', 'Maximum downloads per purchased book'),
('auto_archive_old_orders', '365', 'Days before auto-archiving orders'),
('enable_reviews', 'true', 'Enable customer reviews'),
('require_review_approval', 'true', 'Require admin approval for reviews'); 