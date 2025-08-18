-- Migration: Add Payment Processing and Paid statuses to orders table
-- Date: 2025-01-27
-- Description: Updates the orders table to support new payment-related statuses

-- Drop the existing CHECK constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Add the new CHECK constraint with updated status values
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'confirmed', 'payment_processing', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'));

-- Update any existing orders that might need the new statuses
-- This is optional and depends on your business logic
-- UPDATE orders SET status = 'payment_processing' WHERE status = 'confirmed' AND payment_status = 'pending';

-- Log the migration
INSERT INTO migration_log (migration_name, applied_at, description) 
VALUES ('002_add_payment_statuses', CURRENT_TIMESTAMP, 'Added payment_processing and paid statuses to orders table'); 