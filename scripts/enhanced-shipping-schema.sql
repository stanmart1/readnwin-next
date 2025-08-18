-- Enhanced Shipping Schema - Simplified Version
-- This removes complex features like weight-based pricing, insurance, carrier integration, etc.

-- Enhanced shipping methods table
CREATE TABLE IF NOT EXISTS shipping_methods (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  base_cost DECIMAL(10,2) DEFAULT 0,
  cost_per_item DECIMAL(10,2) DEFAULT 0,
  free_shipping_threshold DECIMAL(10,2),
  estimated_days_min INTEGER DEFAULT 3,
  estimated_days_max INTEGER DEFAULT 7,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Simple shipping zones table (country/state level only)
CREATE TABLE IF NOT EXISTS shipping_zones (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  countries TEXT[], -- Array of country codes
  states TEXT[], -- Array of state names (optional)
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shipping method zones (which methods are available in which zones)
CREATE TABLE IF NOT EXISTS shipping_method_zones (
  id SERIAL PRIMARY KEY,
  shipping_method_id INTEGER REFERENCES shipping_methods(id) ON DELETE CASCADE,
  shipping_zone_id INTEGER REFERENCES shipping_zones(id) ON DELETE CASCADE,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(shipping_method_id, shipping_zone_id)
);

-- Enhanced user shipping addresses
CREATE TABLE IF NOT EXISTS user_shipping_addresses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address_line_1 VARCHAR(255) NOT NULL,
  address_line_2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20),
  country VARCHAR(100) NOT NULL DEFAULT 'Nigeria',
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced orders table (add shipping_zone_id)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_zone_id INTEGER REFERENCES shipping_zones(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_method_id INTEGER REFERENCES shipping_methods(id);

-- Insert default shipping zones
INSERT INTO shipping_zones (name, description, countries, states) VALUES
('Lagos', 'Lagos State', ARRAY['NG'], ARRAY['Lagos']),
('South West', 'South Western States', ARRAY['NG'], ARRAY['Ogun', 'Ondo', 'Osun', 'Oyo', 'Ekiti']),
('South East', 'South Eastern States', ARRAY['NG'], ARRAY['Abia', 'Anambra', 'Ebonyi', 'Enugu', 'Imo']),
('South South', 'South Southern States', ARRAY['NG'], ARRAY['Akwa Ibom', 'Bayelsa', 'Cross River', 'Delta', 'Edo', 'Rivers']),
('North Central', 'North Central States', ARRAY['NG'], ARRAY['Benue', 'FCT', 'Kogi', 'Kwara', 'Nasarawa', 'Niger', 'Plateau']),
('North East', 'North Eastern States', ARRAY['NG'], ARRAY['Adamawa', 'Bauchi', 'Borno', 'Gombe', 'Taraba', 'Yobe']),
('North West', 'North Western States', ARRAY['NG'], ARRAY['Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Sokoto', 'Zamfara'])
ON CONFLICT DO NOTHING;

-- Insert default shipping methods
INSERT INTO shipping_methods (name, description, base_cost, cost_per_item, free_shipping_threshold, estimated_days_min, estimated_days_max, sort_order) VALUES
('Same Day Delivery', 'Delivery within Lagos on the same day', 5000.00, 500.00, 10000.00, 0, 1, 1),
('Express Delivery', 'Fast delivery within 1-2 business days', 3000.00, 300.00, 8000.00, 1, 2, 2),
('Standard Delivery', 'Regular delivery within 3-5 business days', 1500.00, 200.00, 5000.00, 3, 5, 3),
('Economy Delivery', 'Budget-friendly delivery within 5-7 business days', 800.00, 150.00, 3000.00, 5, 7, 4)
ON CONFLICT DO NOTHING;

-- Link shipping methods to zones (all methods available in all zones for now)
INSERT INTO shipping_method_zones (shipping_method_id, shipping_zone_id)
SELECT sm.id, sz.id 
FROM shipping_methods sm, shipping_zones sz
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shipping_methods_active ON shipping_methods(is_active);
CREATE INDEX IF NOT EXISTS idx_shipping_methods_sort ON shipping_methods(sort_order);
CREATE INDEX IF NOT EXISTS idx_shipping_zones_active ON shipping_zones(is_active);
CREATE INDEX IF NOT EXISTS idx_user_shipping_addresses_user ON user_shipping_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_shipping_addresses_default ON user_shipping_addresses(user_id, is_default);
CREATE INDEX IF NOT EXISTS idx_shipping_method_zones_method ON shipping_method_zones(shipping_method_id);
CREATE INDEX IF NOT EXISTS idx_shipping_method_zones_zone ON shipping_method_zones(shipping_zone_id);

-- Enhanced Payment Proofs Schema Migration
-- Add status field to payment_proofs table for better status management

-- Add status column to payment_proofs table
ALTER TABLE payment_proofs 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected'));

-- Update existing records to have proper status
UPDATE payment_proofs 
SET status = CASE 
  WHEN is_verified = true THEN 'verified'
  ELSE 'pending'
END
WHERE status IS NULL;

-- Make status column NOT NULL after updating existing records
ALTER TABLE payment_proofs 
ALTER COLUMN status SET NOT NULL;

-- Create index on status column for better performance
CREATE INDEX IF NOT EXISTS idx_payment_proofs_status ON payment_proofs(status);
