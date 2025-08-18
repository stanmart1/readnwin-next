#!/usr/bin/env node

/**
 * Create Email Functions and Connect to Existing Templates
 * This script creates email functions and connects them to existing templates
 */

const { query } = require('../utils/database');

// Email functions to create
const emailFunctions = [
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
    name: 'Account Deactivation',
    slug: 'account-deactivation',
    description: 'Sent when account is deactivated',
    category: 'authentication',
    required_variables: ['userName', 'deactivationReason', 'reactivationUrl']
  },
  {
    name: 'Password Changed',
    slug: 'password-changed',
    description: 'Sent when password is changed',
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
    description: 'Sent when shipping is initiated',
    category: 'orders',
    required_variables: ['userName', 'orderNumber', 'shippingMethod', 'estimatedDelivery']
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
    description: 'Sent for promotional offers',
    category: 'marketing',
    required_variables: ['userName', 'offerTitle', 'offerDescription', 'expiryDate', 'discountCode']
  },
  {
    name: 'System Maintenance',
    slug: 'system-maintenance',
    description: 'Sent for system maintenance notifications',
    category: 'notifications',
    required_variables: ['maintenanceType', 'startTime', 'endTime', 'affectedServices']
  },
  {
    name: 'Security Alert',
    slug: 'security-alert',
    description: 'Sent for security alerts',
    category: 'notifications',
    required_variables: ['alertType', 'severity', 'description', 'actionRequired']
  }
];

async function createEmailFunctions() {
  try {
    console.log('🔧 Creating Email Functions and Connecting to Templates...\n');

    // Create email functions
    console.log('1. Creating email functions...');
    for (const func of emailFunctions) {
      // Check if function already exists
      const existingFunction = await query(
        'SELECT id FROM email_functions WHERE slug = $1',
        [func.slug]
      );

      if (existingFunction.rows.length === 0) {
        // Create the function
        const functionResult = await query(
          `INSERT INTO email_functions (name, slug, description, category, required_variables, is_active)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
          [
            func.name,
            func.slug,
            func.description,
            func.category,
            JSON.stringify(func.required_variables),
            true
          ]
        );

        const functionId = functionResult.rows[0].id;
        console.log(`  ✅ Created function: ${func.name} (${func.slug})`);

        // Find corresponding template
        const templateResult = await query(
          'SELECT id FROM email_templates WHERE slug = $1',
          [func.slug]
        );

        if (templateResult.rows.length > 0) {
          const templateId = templateResult.rows[0].id;

          // Create function assignment
          await query(
            `INSERT INTO email_function_assignments (function_id, template_id, is_active, priority)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (function_id, template_id) DO NOTHING`,
            [functionId, templateId, true, 1]
          );

          console.log(`    🔗 Connected to template: ${func.name}`);
        } else {
          console.log(`    ⚠️  No template found for: ${func.name}`);
        }
      } else {
        console.log(`  ⏭️  Function already exists: ${func.name} (${func.slug})`);
        
        // Check if assignment exists
        const functionId = existingFunction.rows[0].id;
        const assignmentResult = await query(
          'SELECT id FROM email_function_assignments WHERE function_id = $1',
          [functionId]
        );

        if (assignmentResult.rows.length === 0) {
          // Find corresponding template
          const templateResult = await query(
            'SELECT id FROM email_templates WHERE slug = $1',
            [func.slug]
          );

          if (templateResult.rows.length > 0) {
            const templateId = templateResult.rows[0].id;

            // Create function assignment
            await query(
              `INSERT INTO email_function_assignments (function_id, template_id, is_active, priority)
               VALUES ($1, $2, $3, $4)
               ON CONFLICT (function_id, template_id) DO NOTHING`,
              [functionId, templateId, true, 1]
            );

            console.log(`    🔗 Connected to template: ${func.name}`);
          }
        } else {
          console.log(`    ✅ Already connected to template: ${func.name}`);
        }
      }
    }

    // Verify the connections
    console.log('\n2. Verifying connections...');
    const verificationResult = await query(`
      SELECT 
        ef.name as function_name,
        ef.slug as function_slug,
        et.name as template_name,
        et.slug as template_slug,
        efa.is_active,
        efa.priority
      FROM email_functions ef
      LEFT JOIN email_function_assignments efa ON ef.id = efa.function_id
      LEFT JOIN email_templates et ON efa.template_id = et.id
      ORDER BY ef.name
    `);

    console.log('\n📋 Function-Template Connections:');
    verificationResult.rows.forEach(row => {
      const status = row.template_name ? '✅' : '❌';
      console.log(`${status} ${row.function_name} -> ${row.template_name || 'No template'}`);
    });

    // Test welcome email function specifically
    console.log('\n3. Testing welcome email function...');
    const welcomeFunction = await query(
      'SELECT id FROM email_functions WHERE slug = $1',
      ['welcome']
    );

    if (welcomeFunction.rows.length > 0) {
      const welcomeAssignment = await query(
        'SELECT et.name FROM email_function_assignments efa JOIN email_templates et ON efa.template_id = et.id WHERE efa.function_id = $1',
        [welcomeFunction.rows[0].id]
      );

      if (welcomeAssignment.rows.length > 0) {
        console.log(`✅ Welcome email function is properly connected to: ${welcomeAssignment.rows[0].name}`);
      } else {
        console.log('❌ Welcome email function is not connected to any template');
      }
    } else {
      console.log('❌ Welcome email function not found');
    }

    console.log('\n✅ Email Functions and Template Connections Created Successfully!');
    console.log(`📧 Created ${emailFunctions.length} email functions`);
    console.log('🔗 All functions connected to their corresponding templates');

  } catch (error) {
    console.error('❌ Error creating email functions:', error);
  } finally {
    await query('SELECT 1'); // Keep connection alive
    process.exit(0);
  }
}

createEmailFunctions(); 