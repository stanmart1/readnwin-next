-- Add role column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';

-- Update existing users to have admin role if they don't have one
UPDATE users SET role = 'admin' WHERE role IS NULL OR role = '';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);