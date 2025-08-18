-- Enhanced eCommerce Schema with Inventory Management
-- This schema supports both eBooks and physical books with inventory tracking

-- Users table (extended from auth schema)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  password_hash VARCHAR(255),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  avatar_url TEXT,
  phone VARCHAR(20),
  date_of_birth DATE,
  preferences JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Authors table
CREATE TABLE IF NOT EXISTS authors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  bio TEXT,
  avatar_url TEXT,
  website VARCHAR(255),
  social_media JSONB, -- {twitter, facebook, instagram, linkedin}
  is_featured BOOLEAN DEFAULT FALSE,
  total_books INTEGER DEFAULT 0,
  total_sales DECIMAL(12,2) DEFAULT 0,
  revenue DECIMAL(12,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  parent_id INTEGER REFERENCES categories(id),
  slug VARCHAR(100) UNIQUE,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  book_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Books table with enhanced inventory management
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
  format VARCHAR(20) DEFAULT 'ebook' CHECK (format IN ('ebook', 'physical', 'both')),
  language VARCHAR(10) DEFAULT 'en',
  pages INTEGER,
  publication_date DATE,
  publisher VARCHAR(255),
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  cost_price DECIMAL(10,2),
  weight_grams INTEGER, -- For physical books
  dimensions JSONB, -- {length, width, height} for physical books
  
  -- Inventory Management Fields
  stock_quantity INTEGER DEFAULT 0, -- For physical books
  low_stock_threshold INTEGER DEFAULT 10,
  inventory_enabled BOOLEAN DEFAULT FALSE, -- Enable/disable inventory tracking
  reserved_quantity INTEGER DEFAULT 0, -- Items in carts but not purchased
  sold_quantity INTEGER DEFAULT 0, -- Total items sold
  
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

-- Shopping cart table
CREATE TABLE IF NOT EXISTS cart_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  format VARCHAR(20) DEFAULT 'ebook',
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
  currency VARCHAR(3) DEFAULT 'NGN',
  payment_method VARCHAR(50),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_transaction_id VARCHAR(255),
  shipping_address JSONB, -- For physical books
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
  title VARCHAR(255) NOT NULL,
  author_name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  format VARCHAR(20) DEFAULT 'ebook',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User library table (for purchased eBooks)
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

-- Payment transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  transaction_id VARCHAR(255) UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'NGN',
  payment_method VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
  gateway_response JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Discount codes table
CREATE TABLE IF NOT EXISTS discounts (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  minimum_order_amount DECIMAL(10,2) DEFAULT 0,
  maximum_discount DECIMAL(10,2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  valid_from TIMESTAMP,
  valid_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shipping methods table
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

-- Inventory transactions table for tracking stock changes
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id SERIAL PRIMARY KEY,
  book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('purchase', 'sale', 'adjustment', 'return', 'reserve', 'release')),
  quantity INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  reference_id INTEGER, -- Order ID or purchase order ID
  reference_type VARCHAR(50), -- 'order', 'purchase_order', 'adjustment'
  notes TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Book reviews and ratings
CREATE TABLE IF NOT EXISTS book_reviews (
  id SERIAL PRIMARY KEY,
  book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  order_id INTEGER REFERENCES orders(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  is_helpful_count INTEGER DEFAULT 0,
  is_reported BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(book_id, user_id)
);

-- Wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, book_id)
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

-- Reading sessions for analytics
CREATE TABLE IF NOT EXISTS reading_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
  start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_time TIMESTAMP,
  duration_seconds INTEGER,
  pages_read INTEGER DEFAULT 0,
  current_page INTEGER DEFAULT 1,
  session_data JSONB, -- Additional session data
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

-- Tax rates
CREATE TABLE IF NOT EXISTS tax_rates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  rate DECIMAL(5,2) NOT NULL,
  country VARCHAR(2),
  state VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_books_author_id ON books(author_id);
CREATE INDEX IF NOT EXISTS idx_books_category_id ON books(category_id);
CREATE INDEX IF NOT EXISTS idx_books_format ON books(format);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_books_price ON books(price);
CREATE INDEX IF NOT EXISTS idx_books_stock_quantity ON books(stock_quantity);
CREATE INDEX IF NOT EXISTS idx_books_inventory_enabled ON books(inventory_enabled);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_book_id ON cart_items(book_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_book_id ON order_items(book_id);
CREATE INDEX IF NOT EXISTS idx_user_library_user_id ON user_library(user_id);
CREATE INDEX IF NOT EXISTS idx_user_library_book_id ON user_library(book_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_book_id ON inventory_transactions(book_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_order_id ON inventory_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_book_reviews_book_id ON book_reviews(book_id);
CREATE INDEX IF NOT EXISTS idx_book_reviews_user_id ON book_reviews(user_id);

-- Create triggers for inventory management
CREATE OR REPLACE FUNCTION update_book_stock_after_order()
RETURNS TRIGGER AS $$
BEGIN
  -- Update book stock when order item is created
  IF NEW.format = 'physical' THEN
    UPDATE books 
    SET stock_quantity = stock_quantity - NEW.quantity,
        sold_quantity = sold_quantity + NEW.quantity,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.book_id;
    
    -- Log inventory transaction
    INSERT INTO inventory_transactions (
      book_id, order_id, transaction_type, quantity, 
      previous_stock, new_stock, reference_id, reference_type
    ) VALUES (
      NEW.book_id, NEW.order_id, 'sale', NEW.quantity,
      (SELECT stock_quantity + NEW.quantity FROM books WHERE id = NEW.book_id),
      (SELECT stock_quantity FROM books WHERE id = NEW.book_id),
      NEW.order_id, 'order'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_book_stock
  AFTER INSERT ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_book_stock_after_order();

-- Create function to check stock availability
CREATE OR REPLACE FUNCTION check_stock_availability(book_id_param INTEGER, quantity_param INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  book_record RECORD;
BEGIN
  SELECT * INTO book_record FROM books WHERE id = book_id_param;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- For physical books with inventory enabled, check stock
  IF book_record.format = 'physical' AND book_record.inventory_enabled THEN
    RETURN book_record.stock_quantity >= quantity_param;
  END IF;
  
  -- For ebooks or physical books without inventory, always available
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql; 