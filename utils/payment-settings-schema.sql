-- Payment Settings and Gateways Schema

-- Payment settings table
CREATE TABLE IF NOT EXISTS payment_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment gateways table
CREATE TABLE IF NOT EXISTS payment_gateways (
  id SERIAL PRIMARY KEY,
  gateway_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT FALSE,
  test_mode BOOLEAN DEFAULT TRUE,
  public_key TEXT,
  secret_key TEXT,
  webhook_secret TEXT,
  hash TEXT,
  status VARCHAR(20) DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error', 'testing')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default payment settings
INSERT INTO payment_settings (id, settings) 
VALUES (1, '{
  "defaultGateway": "flutterwave",
  "supportedGateways": ["flutterwave", "bank_transfer"],
  "currency": "NGN",
  "taxRate": 8.5,
  "shippingCost": 5.99,
  "freeShippingThreshold": 50,
  "webhookUrl": "",
  "testMode": true
}')
ON CONFLICT (id) DO NOTHING;

-- Insert default payment gateways
INSERT INTO payment_gateways (gateway_id, name, description, enabled, test_mode, status) VALUES
('flutterwave', 'Flutterwave', 'Leading payment technology company in Africa', false, true, 'inactive'),
('bank_transfer', 'Bank Transfer', 'Direct bank transfer with proof of payment upload', false, false, 'inactive')
ON CONFLICT (gateway_id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_gateways_gateway_id ON payment_gateways(gateway_id);
CREATE INDEX IF NOT EXISTS idx_payment_gateways_enabled ON payment_gateways(enabled);
CREATE INDEX IF NOT EXISTS idx_payment_gateways_status ON payment_gateways(status); 