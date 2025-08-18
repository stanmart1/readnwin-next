const { query } = require('./database');

async function initEmailFunctions() {
  try {
    console.log('🔄 Initializing email functions and assignments...');

    // Create email_functions table
    await query(`
      CREATE TABLE IF NOT EXISTS email_functions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        slug VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        category VARCHAR(100) DEFAULT 'general',
        required_variables JSONB DEFAULT '[]',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created email_functions table');

    // Create email_function_assignments table
    await query(`
      CREATE TABLE IF NOT EXISTS email_function_assignments (
        id SERIAL PRIMARY KEY,
        function_id INTEGER REFERENCES email_functions(id) ON DELETE CASCADE,
        template_id INTEGER REFERENCES email_templates(id) ON DELETE CASCADE,
        is_active BOOLEAN DEFAULT true,
        priority INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(function_id, template_id)
      )
    `);
    console.log('✅ Created email_function_assignments table');

    // Create indexes
    await query('CREATE INDEX IF NOT EXISTS idx_email_functions_slug ON email_functions(slug)');
    await query('CREATE INDEX IF NOT EXISTS idx_email_functions_category ON email_functions(category)');
    await query('CREATE INDEX IF NOT EXISTS idx_email_function_assignments_function_id ON email_function_assignments(function_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_email_function_assignments_template_id ON email_function_assignments(template_id)');
    console.log('✅ Created indexes');

    // Create trigger function for updated_at
    await query(`
      CREATE OR REPLACE FUNCTION update_email_function_assignments_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    // Create trigger
    await query(`
      CREATE TRIGGER update_email_function_assignments_updated_at
          BEFORE UPDATE ON email_function_assignments
          FOR EACH ROW
          EXECUTE FUNCTION update_email_function_assignments_updated_at()
    `);
    console.log('✅ Created trigger for updated_at');

    // Insert default email functions
    const defaultFunctions = [
      {
        name: 'Welcome Email',
        slug: 'welcome',
        description: 'Sent to new users when they register',
        category: 'authentication',
        required_variables: ['userName', 'userEmail']
      },
      {
        name: 'Password Reset',
        slug: 'password-reset',
        description: 'Sent when users request password reset',
        category: 'authentication',
        required_variables: ['userName', 'resetToken', 'resetUrl']
      },
      {
        name: 'Order Confirmation',
        slug: 'order-confirmation',
        description: 'Sent when an order is confirmed',
        category: 'orders',
        required_variables: ['userName', 'orderNumber', 'orderTotal', 'orderItems']
      },
      {
        name: 'Order Shipped',
        slug: 'order-shipped',
        description: 'Sent when an order is shipped',
        category: 'orders',
        required_variables: ['userName', 'orderNumber', 'trackingNumber', 'estimatedDelivery']
      },
      {
        name: 'Account Verification',
        slug: 'account-verification',
        description: 'Sent to verify user email address',
        category: 'authentication',
        required_variables: ['userName', 'verificationToken', 'verificationUrl']
      },
      {
        name: 'Email Confirmation',
        slug: 'email-confirmation',
        description: 'Sent after successful email verification',
        category: 'authentication',
        required_variables: ['userName', 'userEmail']
      },
      {
        name: 'Order Status Update',
        slug: 'order-status-update',
        description: 'Sent when order status changes',
        category: 'orders',
        required_variables: ['userName', 'orderNumber', 'status', 'statusDescription']
      },
      {
        name: 'Payment Confirmation',
        slug: 'payment-confirmation',
        description: 'Sent when payment is confirmed',
        category: 'orders',
        required_variables: ['userName', 'orderNumber', 'paymentAmount', 'paymentMethod']
      },
      {
        name: 'Shipping Notification',
        slug: 'shipping-notification',
        description: 'Sent when order is ready for shipping',
        category: 'orders',
        required_variables: ['userName', 'orderNumber', 'shippingMethod', 'estimatedDelivery']
      },
      {
        name: 'Account Deactivation',
        slug: 'account-deactivation',
        description: 'Sent when account is deactivated',
        category: 'authentication',
        required_variables: ['userName', 'deactivationReason', 'reactivationUrl']
      },
      {
        name: 'Password Changed',
        slug: 'password-changed',
        description: 'Sent when password is successfully changed',
        category: 'authentication',
        required_variables: ['userName', 'changedAt', 'ipAddress']
      },
      {
        name: 'Login Alert',
        slug: 'login-alert',
        description: 'Sent for suspicious login attempts',
        category: 'authentication',
        required_variables: ['userName', 'loginTime', 'ipAddress', 'deviceInfo']
      },
      {
        name: 'Newsletter Subscription',
        slug: 'newsletter-subscription',
        description: 'Sent when user subscribes to newsletter',
        category: 'marketing',
        required_variables: ['userName', 'subscriptionType', 'unsubscribeUrl']
      },
      {
        name: 'Promotional Offer',
        slug: 'promotional-offer',
        description: 'Sent for promotional campaigns',
        category: 'marketing',
        required_variables: ['userName', 'offerTitle', 'offerDescription', 'expiryDate', 'discountCode']
      },
      {
        name: 'System Maintenance',
        slug: 'system-maintenance',
        description: 'Sent for scheduled maintenance',
        category: 'notifications',
        required_variables: ['maintenanceType', 'startTime', 'endTime', 'affectedServices']
      },
      {
        name: 'Security Alert',
        slug: 'security-alert',
        description: 'Sent for security-related events',
        category: 'notifications',
        required_variables: ['alertType', 'severity', 'description', 'actionRequired']
      }
    ];

    for (const func of defaultFunctions) {
      await query(`
        INSERT INTO email_functions (name, slug, description, category, required_variables)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (slug) DO NOTHING
      `, [func.name, func.slug, func.description, func.category, JSON.stringify(func.required_variables)]);
    }
    console.log('✅ Inserted default email functions');

    console.log('🎉 Email functions initialization completed successfully!');
  } catch (error) {
    console.error('❌ Error initializing email functions:', error);
    process.exit(1);
  }
}

// Run the initialization
initEmailFunctions(); 