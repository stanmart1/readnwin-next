-- Email Templates Management System
-- This file contains the database schema for managing email templates

-- Email templates table
CREATE TABLE IF NOT EXISTS email_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    subject VARCHAR(500) NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    description TEXT,
    variables JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    category VARCHAR(100) DEFAULT 'general',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email template variables table (for tracking available variables)
CREATE TABLE IF NOT EXISTS email_template_variables (
    id SERIAL PRIMARY KEY,
    template_id INTEGER REFERENCES email_templates(id) ON DELETE CASCADE,
    variable_name VARCHAR(100) NOT NULL,
    variable_type VARCHAR(50) DEFAULT 'string',
    description TEXT,
    is_required BOOLEAN DEFAULT false,
    default_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email template categories
CREATE TABLE IF NOT EXISTS email_template_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email functions table (defines available email functions in the system)
CREATE TABLE IF NOT EXISTS email_functions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(100) DEFAULT 'general',
    required_variables JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email function template assignments (links templates to functions)
CREATE TABLE IF NOT EXISTS email_function_assignments (
    id SERIAL PRIMARY KEY,
    function_id INTEGER REFERENCES email_functions(id) ON DELETE CASCADE,
    template_id INTEGER REFERENCES email_templates(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(function_id, template_id)
);

-- Insert default categories
INSERT INTO email_template_categories (name, description, color, icon) VALUES
('authentication', 'User authentication emails', '#EF4444', 'ri-shield-user-line'),
('orders', 'Order-related emails', '#10B981', 'ri-shopping-cart-line'),
('marketing', 'Marketing and promotional emails', '#8B5CF6', 'ri-mail-line'),
('notifications', 'System notifications', '#F59E0B', 'ri-notification-line'),
('support', 'Customer support emails', '#3B82F6', 'ri-customer-service-line'),
('general', 'General purpose emails', '#6B7280', 'ri-mail-line')
ON CONFLICT (name) DO NOTHING;

-- Insert default email functions
INSERT INTO email_functions (name, slug, description, category, required_variables) VALUES
('Welcome Email', 'welcome', 'Sent to new users when they register', 'authentication', '["userName", "userEmail"]'),
('Password Reset', 'password-reset', 'Sent when users request password reset', 'authentication', '["userName", "resetToken", "resetUrl"]'),
('Order Confirmation', 'order-confirmation', 'Sent when an order is confirmed', 'orders', '["userName", "orderNumber", "orderTotal", "orderItems"]'),
('Order Shipped', 'order-shipped', 'Sent when an order is shipped', 'orders', '["userName", "orderNumber", "trackingNumber", "estimatedDelivery"]'),
('Account Verification', 'account-verification', 'Sent to verify user email address', 'authentication', '["userName", "verificationToken", "verificationUrl"]'),
('Email Confirmation', 'email-confirmation', 'Sent after successful email verification', 'authentication', '["userName", "userEmail"]'),
('Order Status Update', 'order-status-update', 'Sent when order status changes', 'orders', '["userName", "orderNumber", "status", "statusDescription"]'),
('Payment Confirmation', 'payment-confirmation', 'Sent when payment is confirmed', 'orders', '["userName", "orderNumber", "paymentAmount", "paymentMethod"]'),
('Shipping Notification', 'shipping-notification', 'Sent when order is ready for shipping', 'orders', '["userName", "orderNumber", "shippingMethod", "estimatedDelivery"]'),
('Account Deactivation', 'account-deactivation', 'Sent when account is deactivated', 'authentication', '["userName", "deactivationReason", "reactivationUrl"]'),
('Password Changed', 'password-changed', 'Sent when password is successfully changed', 'authentication', '["userName", "changedAt", "ipAddress"]'),
('Login Alert', 'login-alert', 'Sent for suspicious login attempts', 'authentication', '["userName", "loginTime", "ipAddress", "deviceInfo"]'),
('Newsletter Subscription', 'newsletter-subscription', 'Sent when user subscribes to newsletter', 'marketing', '["userName", "subscriptionType", "unsubscribeUrl"]'),
('Promotional Offer', 'promotional-offer', 'Sent for promotional campaigns', 'marketing', '["userName", "offerTitle", "offerDescription", "expiryDate", "discountCode"]'),
('System Maintenance', 'system-maintenance', 'Sent for scheduled maintenance', 'notifications', '["maintenanceType", "startTime", "endTime", "affectedServices"]'),
('Security Alert', 'security-alert', 'Sent for security-related events', 'notifications', '["alertType", "severity", "description", "actionRequired"]')
ON CONFLICT (slug) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_templates_slug ON email_templates(slug);
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates(category);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_email_template_variables_template_id ON email_template_variables(template_id);
CREATE INDEX IF NOT EXISTS idx_email_functions_slug ON email_functions(slug);
CREATE INDEX IF NOT EXISTS idx_email_functions_category ON email_functions(category);
CREATE INDEX IF NOT EXISTS idx_email_function_assignments_function_id ON email_function_assignments(function_id);
CREATE INDEX IF NOT EXISTS idx_email_function_assignments_template_id ON email_function_assignments(template_id);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update the email_function_assignments updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_function_assignments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_email_templates_updated_at
    BEFORE UPDATE ON email_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_email_templates_updated_at();

-- Trigger to automatically update email_function_assignments updated_at
CREATE TRIGGER update_email_function_assignments_updated_at
    BEFORE UPDATE ON email_function_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_email_function_assignments_updated_at(); 