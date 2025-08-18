-- Bank Transfer Payment System Schema

-- Bank transfer transactions table
CREATE TABLE IF NOT EXISTS bank_transfers (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  transaction_reference VARCHAR(100) UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'NGN',
  bank_name VARCHAR(100),
  account_number VARCHAR(20),
  account_name VARCHAR(100),
  payment_date TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'expired')),
  admin_notes TEXT,
  verified_by INTEGER REFERENCES users(id),
  verified_at TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment proof uploads table
CREATE TABLE IF NOT EXISTS payment_proofs (
  id SERIAL PRIMARY KEY,
  bank_transfer_id INTEGER REFERENCES bank_transfers(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER,
  file_type VARCHAR(50),
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_verified BOOLEAN DEFAULT FALSE,
  verified_by INTEGER REFERENCES users(id),
  verified_at TIMESTAMP,
  admin_notes TEXT
);

-- Bank account details for receiving payments
CREATE TABLE IF NOT EXISTS bank_accounts (
  id SERIAL PRIMARY KEY,
  bank_name VARCHAR(100) NOT NULL,
  account_number VARCHAR(20) NOT NULL,
  account_name VARCHAR(100) NOT NULL,
  account_type VARCHAR(20) DEFAULT 'current',
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bank transfer notifications
CREATE TABLE IF NOT EXISTS bank_transfer_notifications (
  id SERIAL PRIMARY KEY,
  bank_transfer_id INTEGER REFERENCES bank_transfers(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('initiated', 'proof_uploaded', 'verified', 'rejected', 'expired')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bank_transfers_order_id ON bank_transfers(order_id);
CREATE INDEX IF NOT EXISTS idx_bank_transfers_user_id ON bank_transfers(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_transfers_status ON bank_transfers(status);
CREATE INDEX IF NOT EXISTS idx_bank_transfers_transaction_reference ON bank_transfers(transaction_reference);
CREATE INDEX IF NOT EXISTS idx_bank_transfers_expires_at ON bank_transfers(expires_at);

CREATE INDEX IF NOT EXISTS idx_payment_proofs_bank_transfer_id ON payment_proofs(bank_transfer_id);
CREATE INDEX IF NOT EXISTS idx_payment_proofs_upload_date ON payment_proofs(upload_date);

CREATE INDEX IF NOT EXISTS idx_bank_accounts_is_active ON bank_accounts(is_active);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_is_default ON bank_accounts(is_default);

CREATE INDEX IF NOT EXISTS idx_bank_transfer_notifications_user_id ON bank_transfer_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_transfer_notifications_is_read ON bank_transfer_notifications(is_read);

-- Insert default bank account (replace with actual details)
INSERT INTO bank_accounts (bank_name, account_number, account_name, account_type, is_default) VALUES
('First Bank of Nigeria', '1234567890', 'ReadnWin Bookstore', 'current', true),
('Zenith Bank', '0987654321', 'ReadnWin Bookstore', 'current', false)
ON CONFLICT DO NOTHING;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bank_transfers_updated_at BEFORE UPDATE ON bank_transfers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON bank_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 