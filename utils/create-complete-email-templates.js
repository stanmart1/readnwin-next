const { Pool } = require('pg');

// Database configuration for Aiven Cloud PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || 'avnadmin',
  host: process.env.DB_HOST || 'readnwin-nextjs-book-nextjs.b.aivencloud.com',
  database: process.env.DB_NAME || 'defaultdb',
  password: process.env.DB_PASSWORD || 'AVNS_Xv38UAMF77xN--vUfeX',
  port: parseInt(process.env.DB_PORT || '28428'),
  ssl: {
    rejectUnauthorized: false,
    ca: process.env.DB_CA_CERT, // Add CA certificate if provided
  },
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Increased timeout for cloud connections
  statement_timeout: 30000, // 30 second statement timeout
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ Database connected successfully to Aiven Cloud PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  // Don't exit process in production, just log the error
  if (process.env.NODE_ENV === 'development') {
    console.error('Database connection error details:', err);
  }
});

async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('✅ Executed query', { text: text.substring(0, 50) + '...', duration, rows: res.rowCount });
    return res;
  } catch (error) {
    const duration = Date.now() - start;
    console.error('❌ Query failed', { text: text.substring(0, 50) + '...', duration, error: error.message });
    throw error;
  }
}

async function createCompleteEmailTemplates() {
  try {
    console.log('🔄 Creating Complete Email Template System...\n');

    // Define all email templates with their corresponding functions
    const emailTemplates = [
      // Authentication Templates
      {
        name: 'Welcome Email',
        slug: 'welcome',
        subject: 'Welcome to ReadnWin! 📚 Your Reading Journey Begins',
        category: 'authentication',
        description: 'Sent to new users when they register',
        variables: { userName: 'string', userEmail: 'string' },
        functionSlug: 'welcome'
      },
      {
        name: 'Password Reset',
        slug: 'password-reset',
        subject: 'Reset Your ReadnWin Password 🔐',
        category: 'authentication',
        description: 'Sent when users request password reset',
        variables: { userName: 'string', resetToken: 'string', resetUrl: 'string' },
        functionSlug: 'password-reset'
      },
      {
        name: 'Account Verification',
        slug: 'account-verification',
        subject: 'Verify Your ReadnWin Account ✉️',
        category: 'authentication',
        description: 'Sent to verify user email address',
        variables: { userName: 'string', verificationToken: 'string', verificationUrl: 'string' },
        functionSlug: 'account-verification'
      },
      {
        name: 'Email Confirmation',
        slug: 'email-confirmation',
        subject: 'Email Confirmed! Welcome to ReadnWin 🎉',
        category: 'authentication',
        description: 'Sent after successful email verification',
        variables: { userName: 'string', userEmail: 'string' },
        functionSlug: 'email-confirmation'
      },
      {
        name: 'Account Deactivation',
        slug: 'account-deactivation',
        subject: 'Your ReadnWin Account Has Been Deactivated',
        category: 'authentication',
        description: 'Sent when account is deactivated',
        variables: { userName: 'string', deactivationReason: 'string', reactivationUrl: 'string' },
        functionSlug: 'account-deactivation'
      },
      {
        name: 'Password Changed',
        slug: 'password-changed',
        subject: 'Your ReadnWin Password Has Been Changed 🔒',
        category: 'authentication',
        description: 'Sent when password is successfully changed',
        variables: { userName: 'string', changedAt: 'string', ipAddress: 'string' },
        functionSlug: 'password-changed'
      },
      {
        name: 'Login Alert',
        slug: 'login-alert',
        subject: 'New Login to Your ReadnWin Account 🔔',
        category: 'authentication',
        description: 'Sent for suspicious login attempts',
        variables: { userName: 'string', loginTime: 'string', ipAddress: 'string', deviceInfo: 'string' },
        functionSlug: 'login-alert'
      },

      // Order Templates
      {
        name: 'Order Confirmation',
        slug: 'order-confirmation',
        subject: 'Order Confirmed - Thank You for Your Purchase! 📦',
        category: 'orders',
        description: 'Sent when an order is confirmed',
        variables: { userName: 'string', orderNumber: 'string', orderTotal: 'string', orderItems: 'array' },
        functionSlug: 'order-confirmation'
      },
      {
        name: 'Order Shipped',
        slug: 'order-shipped',
        subject: 'Your Order Has Been Shipped! 🚚',
        category: 'orders',
        description: 'Sent when an order is shipped',
        variables: { userName: 'string', orderNumber: 'string', trackingNumber: 'string', estimatedDelivery: 'string' },
        functionSlug: 'order-shipped'
      },
      {
        name: 'Order Status Update',
        slug: 'order-status-update',
        subject: 'Order Status Update - #{{orderNumber}}',
        category: 'orders',
        description: 'Sent when order status changes',
        variables: { userName: 'string', orderNumber: 'string', status: 'string', statusDescription: 'string' },
        functionSlug: 'order-status-update'
      },
      {
        name: 'Payment Confirmation',
        slug: 'payment-confirmation',
        subject: 'Payment Confirmed - Order #{{orderNumber}}',
        category: 'orders',
        description: 'Sent when payment is confirmed',
        variables: { userName: 'string', orderNumber: 'string', paymentAmount: 'string', paymentMethod: 'string' },
        functionSlug: 'payment-confirmation'
      },
      {
        name: 'Shipping Notification',
        slug: 'shipping-notification',
        subject: 'Your Order is Ready for Shipping! 📦',
        category: 'orders',
        description: 'Sent when order is ready for shipping',
        variables: { userName: 'string', orderNumber: 'string', shippingMethod: 'string', estimatedDelivery: 'string' },
        functionSlug: 'shipping-notification'
      },

      // Marketing Templates
      {
        name: 'Newsletter Subscription',
        slug: 'newsletter-subscription',
        subject: 'Welcome to ReadnWin Newsletter! 📰',
        category: 'marketing',
        description: 'Sent when user subscribes to newsletter',
        variables: { userName: 'string', subscriptionType: 'string', unsubscribeUrl: 'string' },
        functionSlug: 'newsletter-subscription'
      },
      {
        name: 'Promotional Offer',
        slug: 'promotional-offer',
        subject: 'Special Offer Just for You! 🎁',
        category: 'marketing',
        description: 'Sent for promotional campaigns',
        variables: { userName: 'string', offerTitle: 'string', offerDescription: 'string', expiryDate: 'string', discountCode: 'string' },
        functionSlug: 'promotional-offer'
      },

      // Notification Templates
      {
        name: 'System Maintenance',
        slug: 'system-maintenance',
        subject: 'Scheduled Maintenance Notice 🔧',
        category: 'notifications',
        description: 'Sent for scheduled maintenance',
        variables: { maintenanceType: 'string', startTime: 'string', endTime: 'string', affectedServices: 'string' },
        functionSlug: 'system-maintenance'
      },
      {
        name: 'Security Alert',
        slug: 'security-alert',
        subject: 'Security Alert - Action Required 🔒',
        category: 'notifications',
        description: 'Sent for security-related events',
        variables: { alertType: 'string', severity: 'string', description: 'string', actionRequired: 'string' },
        functionSlug: 'security-alert'
      }
    ];

    // Create templates and link them to functions
    for (const template of emailTemplates) {
      console.log(`Creating template: ${template.name}`);
      
      // Check if template already exists
      const existingTemplate = await query(
        'SELECT id FROM email_templates WHERE slug = $1',
        [template.slug]
      );

      if (existingTemplate.rows.length === 0) {
        // Create the template
        const templateResult = await query(
          `INSERT INTO email_templates (name, slug, subject, html_content, text_content, description, variables, category, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
          [
            template.name,
            template.slug,
            template.subject,
            generateHTMLContent(template),
            generateTextContent(template),
            template.description,
            JSON.stringify(template.variables),
            template.category,
            true
          ]
        );

        const templateId = templateResult.rows[0].id;

        // Get the function ID
        const functionResult = await query(
          'SELECT id FROM email_functions WHERE slug = $1',
          [template.functionSlug]
        );

        if (functionResult.rows.length > 0) {
          const functionId = functionResult.rows[0].id;

          // Link template to function
          await query(
            `INSERT INTO email_function_assignments (function_id, template_id, is_active, priority)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (function_id, template_id) DO NOTHING`,
            [functionId, templateId, true, 1]
          );

          console.log(`  ✅ Created and linked to function: ${template.functionSlug}`);
        } else {
          console.log(`  ⚠️  Function not found: ${template.functionSlug}`);
        }
      } else {
        console.log(`  ⏭️  Template already exists: ${template.name}`);
      }
    }

    console.log('\n✅ Complete Email Template System Created Successfully!');
    console.log(`📧 Created ${emailTemplates.length} email templates`);
    console.log('🔗 All templates linked to their corresponding functions');

  } catch (error) {
    console.error('❌ Error creating email templates:', error);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

function generateHTMLContent(template) {
  const baseHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${template.name}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
        .header p { font-size: 16px; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 18px; font-weight: 600; margin-bottom: 20px; color: #1f2937; }
        .message { font-size: 16px; line-height: 1.7; margin-bottom: 25px; color: #4b5563; }
        .highlight-box { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 25px 0; }
        .button { display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; }
        .button:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
        .footer { background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer p { font-size: 14px; color: #6b7280; margin-bottom: 10px; }
        .social-links { margin-top: 20px; }
        .social-links a { display: inline-block; margin: 0 10px; color: #6b7280; text-decoration: none; }
        .info-box { background-color: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 25px 0; }
        .info-box h3 { font-size: 16px; font-weight: 600; margin-bottom: 10px; color: #1f2937; }
        .info-box p { font-size: 14px; color: #6b7280; margin-bottom: 5px; }
        .alert-box { background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 25px 0; }
        .alert-box h3 { color: #dc2626; font-size: 16px; font-weight: 600; margin-bottom: 10px; }
        .alert-box p { color: #7f1d1d; font-size: 14px; }
        @media (max-width: 600px) { .header, .content, .footer { padding: 20px; } .header h1 { font-size: 24px; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📚 ReadnWin</h1>
            <p>Your Digital Reading Companion</p>
        </div>
        
        <div class="content">
            ${generateTemplateContent(template)}
        </div>
        
        <div class="footer">
            <p>Thank you for choosing ReadnWin!</p>
            <p>If you have any questions, please contact our support team.</p>
            <div class="social-links">
                <a href="#">📧 Support</a> | <a href="#">🌐 Website</a> | <a href="#">📱 App</a>
            </div>
            <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
                © 2025 ReadnWin. All rights reserved.<br>
                You received this email because you're a registered user of ReadnWin.
            </p>
        </div>
    </div>
</body>
</html>`;

  return baseHTML;
}

function generateTemplateContent(template) {
  const contentMap = {
    'welcome': `
            <div class="greeting">Welcome to ReadnWin, {{userName}}! 🎉</div>
            <div class="message">
                We're thrilled to have you join our community of passionate readers. Your journey to discovering amazing books and enhancing your reading experience starts now!
            </div>
            <div class="highlight-box">
                <strong>What's next?</strong><br>
                • Explore our vast collection of books<br>
                • Set up your reading preferences<br>
                • Join reading challenges and earn rewards<br>
                • Connect with fellow book lovers
            </div>
            <div style="text-align: center;">
                <a href="https://readnwin.com/dashboard" class="button">Start Reading Now</a>
            </div>
            <div class="message">
                If you have any questions or need assistance, our support team is here to help. Happy reading!
            </div>`,

    'password-reset': `
            <div class="greeting">Hello {{userName}},</div>
            <div class="message">
                We received a request to reset your ReadnWin password. If you didn't make this request, you can safely ignore this email.
            </div>
            <div class="alert-box">
                <h3>🔐 Password Reset Request</h3>
                <p>Click the button below to reset your password. This link will expire in 24 hours for your security.</p>
            </div>
            <div style="text-align: center;">
                <a href="{{resetUrl}}" class="button">Reset My Password</a>
            </div>
            <div class="message">
                For security reasons, this link will expire in 24 hours. If you need a new link, please request another password reset from your account settings.
            </div>`,

    'order-confirmation': `
            <div class="greeting">Thank you for your order, {{userName}}! 📦</div>
            <div class="message">
                Your order has been confirmed and is being processed. We'll notify you once it's ready for shipping.
            </div>
            <div class="info-box">
                <h3>Order Details</h3>
                <p><strong>Order Number:</strong> {{orderNumber}}</p>
                <p><strong>Total Amount:</strong> {{orderTotal}}</p>
                <p><strong>Status:</strong> Confirmed</p>
            </div>
            <div class="highlight-box">
                <strong>What happens next?</strong><br>
                • We'll process your order within 1-2 business days<br>
                • You'll receive a shipping notification with tracking details<br>
                • Your books will be delivered to your address
            </div>
            <div style="text-align: center;">
                <a href="https://readnwin.com/orders/{{orderNumber}}" class="button">View Order Details</a>
            </div>`,

    'order-shipped': `
            <div class="greeting">Great news, {{userName}}! 🚚</div>
            <div class="message">
                Your order has been shipped and is on its way to you. You can track its progress using the information below.
            </div>
            <div class="info-box">
                <h3>Shipping Information</h3>
                <p><strong>Order Number:</strong> {{orderNumber}}</p>
                <p><strong>Tracking Number:</strong> {{trackingNumber}}</p>
                <p><strong>Estimated Delivery:</strong> {{estimatedDelivery}}</p>
            </div>
            <div style="text-align: center;">
                <a href="https://readnwin.com/orders/{{orderNumber}}/tracking" class="button">Track My Order</a>
            </div>
            <div class="message">
                We hope you enjoy your new books! Don't forget to share your reading experience with our community.
            </div>`,

    'account-verification': `
            <div class="greeting">Hello {{userName}},</div>
            <div class="message">
                Please verify your email address to complete your ReadnWin account setup. This helps us ensure the security of your account.
            </div>
            <div class="highlight-box">
                <strong>Why verify your email?</strong><br>
                • Secure your account<br>
                • Receive important notifications<br>
                • Access all features<br>
                • Reset password if needed
            </div>
            <div style="text-align: center;">
                <a href="{{verificationUrl}}" class="button">Verify My Email</a>
            </div>
            <div class="message">
                If you didn't create a ReadnWin account, you can safely ignore this email.
            </div>`,

    'email-confirmation': `
            <div class="greeting">Congratulations, {{userName}}! 🎉</div>
            <div class="message">
                Your email address has been successfully verified. Your ReadnWin account is now fully activated and ready to use!
            </div>
            <div class="highlight-box">
                <strong>Your account is ready!</strong><br>
                • Access your personal library<br>
                • Join reading challenges<br>
                • Connect with other readers<br>
                • Start earning rewards
            </div>
            <div style="text-align: center;">
                <a href="https://readnwin.com/dashboard" class="button">Start Exploring</a>
            </div>
            <div class="message">
                Welcome to the ReadnWin community! We're excited to be part of your reading journey.
            </div>`,

    'account-deactivation': `
            <div class="greeting">Hello {{userName}},</div>
            <div class="message">
                Your ReadnWin account has been deactivated. We're sorry to see you go, but we understand that circumstances change.
            </div>
            <div class="info-box">
                <h3>Account Status</h3>
                <p><strong>Status:</strong> Deactivated</p>
                <p><strong>Reason:</strong> {{deactivationReason}}</p>
            </div>
            <div class="message">
                If you'd like to reactivate your account, you can do so at any time by clicking the button below.
            </div>
            <div style="text-align: center;">
                <a href="{{reactivationUrl}}" class="button">Reactivate My Account</a>
            </div>
            <div class="message">
                Thank you for being part of the ReadnWin community. We hope to see you again soon!
            </div>`,

    'password-changed': `
            <div class="greeting">Hello {{userName}},</div>
            <div class="message">
                Your ReadnWin password has been successfully changed. This action was performed on {{changedAt}}.
            </div>
            <div class="info-box">
                <h3>Password Change Details</h3>
                <p><strong>Changed At:</strong> {{changedAt}}</p>
                <p><strong>IP Address:</strong> {{ipAddress}}</p>
            </div>
            <div class="alert-box">
                <h3>🔒 Security Notice</h3>
                <p>If you didn't change your password, please contact our support team immediately to secure your account.</p>
            </div>
            <div class="message">
                Your account security is important to us. If you have any concerns, please don't hesitate to reach out.
            </div>`,

    'login-alert': `
            <div class="greeting">Hello {{userName}},</div>
            <div class="message">
                We detected a new login to your ReadnWin account. If this was you, no action is needed.
            </div>
            <div class="info-box">
                <h3>Login Details</h3>
                <p><strong>Login Time:</strong> {{loginTime}}</p>
                <p><strong>IP Address:</strong> {{ipAddress}}</p>
                <p><strong>Device:</strong> {{deviceInfo}}</p>
            </div>
            <div class="alert-box">
                <h3>⚠️ Security Alert</h3>
                <p>If this wasn't you, please change your password immediately and contact our support team.</p>
            </div>
            <div style="text-align: center;">
                <a href="https://readnwin.com/account/security" class="button">Review Account Security</a>
            </div>`,

    'order-status-update': `
            <div class="greeting">Hello {{userName}},</div>
            <div class="message">
                Your order status has been updated. Here are the latest details:
            </div>
            <div class="info-box">
                <h3>Order Status Update</h3>
                <p><strong>Order Number:</strong> {{orderNumber}}</p>
                <p><strong>New Status:</strong> {{status}}</p>
                <p><strong>Description:</strong> {{statusDescription}}</p>
            </div>
            <div style="text-align: center;">
                <a href="https://readnwin.com/orders/{{orderNumber}}" class="button">View Order Details</a>
            </div>
            <div class="message">
                We'll continue to keep you updated on your order's progress.
            </div>`,

    'payment-confirmation': `
            <div class="greeting">Payment Confirmed, {{userName}}! 💳</div>
            <div class="message">
                Your payment has been successfully processed. Thank you for your purchase!
            </div>
            <div class="info-box">
                <h3>Payment Details</h3>
                <p><strong>Order Number:</strong> {{orderNumber}}</p>
                <p><strong>Amount:</strong> {{paymentAmount}}</p>
                <p><strong>Payment Method:</strong> {{paymentMethod}}</p>
            </div>
            <div class="highlight-box">
                <strong>What's next?</strong><br>
                • We'll process your order<br>
                • You'll receive shipping updates<br>
                • Your books will be delivered
            </div>
            <div style="text-align: center;">
                <a href="https://readnwin.com/orders/{{orderNumber}}" class="button">View Order Details</a>
            </div>`,

    'shipping-notification': `
            <div class="greeting">Your Order is Ready, {{userName}}! 📦</div>
            <div class="message">
                Great news! Your order has been processed and is ready for shipping. Here are the shipping details:
            </div>
            <div class="info-box">
                <h3>Shipping Information</h3>
                <p><strong>Order Number:</strong> {{orderNumber}}</p>
                <p><strong>Shipping Method:</strong> {{shippingMethod}}</p>
                <p><strong>Estimated Delivery:</strong> {{estimatedDelivery}}</p>
            </div>
            <div class="highlight-box">
                <strong>Shipping Timeline</strong><br>
                • Order processed and packed<br>
                • Ready for pickup by courier<br>
                • Tracking number will be provided soon
            </div>
            <div style="text-align: center;">
                <a href="https://readnwin.com/orders/{{orderNumber}}" class="button">Track My Order</a>
            </div>`,

    'newsletter-subscription': `
            <div class="greeting">Welcome to Our Newsletter, {{userName}}! 📰</div>
            <div class="message">
                Thank you for subscribing to the ReadnWin newsletter! You'll now receive the latest updates, book recommendations, and exclusive offers.
            </div>
            <div class="highlight-box">
                <strong>What you'll receive:</strong><br>
                • Weekly book recommendations<br>
                • Reading tips and insights<br>
                • Exclusive discounts and offers<br>
                • Community highlights and events
            </div>
            <div class="message">
                We're excited to share our passion for reading with you. Look out for our first newsletter coming soon!
            </div>
            <div style="text-align: center;">
                <a href="{{unsubscribeUrl}}" class="button" style="background: #6b7280;">Unsubscribe</a>
            </div>`,

    'promotional-offer': `
            <div class="greeting">Special Offer for You, {{userName}}! 🎁</div>
            <div class="message">
                We have an exclusive offer just for you! Don't miss out on this limited-time opportunity.
            </div>
            <div class="highlight-box">
                <strong>{{offerTitle}}</strong><br>
                {{offerDescription}}<br>
                <strong>Expires:</strong> {{expiryDate}}
            </div>
            <div class="info-box">
                <h3>Your Discount Code</h3>
                <p style="font-size: 18px; font-weight: 600; color: #3B82F6;">{{discountCode}}</p>
            </div>
            <div style="text-align: center;">
                <a href="https://readnwin.com/books" class="button">Shop Now</a>
            </div>
            <div class="message">
                This offer is valid until {{expiryDate}}. Use your discount code at checkout to save!
            </div>`,

    'system-maintenance': `
            <div class="greeting">Scheduled Maintenance Notice</div>
            <div class="message">
                We'll be performing scheduled maintenance to improve your ReadnWin experience. During this time, some services may be temporarily unavailable.
            </div>
            <div class="info-box">
                <h3>Maintenance Details</h3>
                <p><strong>Type:</strong> {{maintenanceType}}</p>
                <p><strong>Start Time:</strong> {{startTime}}</p>
                <p><strong>End Time:</strong> {{endTime}}</p>
                <p><strong>Affected Services:</strong> {{affectedServices}}</p>
            </div>
            <div class="highlight-box">
                <strong>What to expect:</strong><br>
                • Brief service interruptions<br>
                • Improved performance after maintenance<br>
                • All data will be safe and secure
            </div>
            <div class="message">
                We apologize for any inconvenience and appreciate your patience. We'll be back online as soon as possible!
            </div>`,

    'security-alert': `
            <div class="greeting">Security Alert - Action Required</div>
            <div class="message">
                We've detected a security-related event on your account that requires your attention.
            </div>
            <div class="alert-box">
                <h3>🔒 Security Alert</h3>
                <p><strong>Alert Type:</strong> {{alertType}}</p>
                <p><strong>Severity:</strong> {{severity}}</p>
                <p><strong>Description:</strong> {{description}}</p>
            </div>
            <div class="message">
                <strong>Action Required:</strong> {{actionRequired}}
            </div>
            <div style="text-align: center;">
                <a href="https://readnwin.com/account/security" class="button">Secure My Account</a>
            </div>
            <div class="message">
                If you have any questions or need assistance, please contact our security team immediately.
            </div>`
  };

  return contentMap[template.slug] || `
            <div class="greeting">Hello {{userName}},</div>
            <div class="message">
                This is a notification from ReadnWin. Please check your account for more details.
            </div>
            <div style="text-align: center;">
                <a href="https://readnwin.com/dashboard" class="button">View Details</a>
            </div>`;
}

function generateTextContent(template) {
  const textMap = {
    'welcome': `Welcome to ReadnWin, {{userName}}!

We're thrilled to have you join our community of passionate readers. Your journey to discovering amazing books and enhancing your reading experience starts now!

What's next?
• Explore our vast collection of books
• Set up your reading preferences
• Join reading challenges and earn rewards
• Connect with fellow book lovers

Start reading now: https://readnwin.com/dashboard

If you have any questions or need assistance, our support team is here to help. Happy reading!

Thank you for choosing ReadnWin!`,

    'password-reset': `Hello {{userName}},

We received a request to reset your ReadnWin password. If you didn't make this request, you can safely ignore this email.

PASSWORD RESET REQUEST
Click the link below to reset your password. This link will expire in 24 hours for your security.

Reset My Password: {{resetUrl}}

For security reasons, this link will expire in 24 hours. If you need a new link, please request another password reset from your account settings.`,

    'order-confirmation': `Thank you for your order, {{userName}}!

Your order has been confirmed and is being processed. We'll notify you once it's ready for shipping.

ORDER DETAILS
Order Number: {{orderNumber}}
Total Amount: {{orderTotal}}
Status: Confirmed

What happens next?
• We'll process your order within 1-2 business days
• You'll receive a shipping notification with tracking details
• Your books will be delivered to your address

View Order Details: https://readnwin.com/orders/{{orderNumber}}`,

    'order-shipped': `Great news, {{userName}}!

Your order has been shipped and is on its way to you. You can track its progress using the information below.

SHIPPING INFORMATION
Order Number: {{orderNumber}}
Tracking Number: {{trackingNumber}}
Estimated Delivery: {{estimatedDelivery}}

Track My Order: https://readnwin.com/orders/{{orderNumber}}/tracking

We hope you enjoy your new books! Don't forget to share your reading experience with our community.`,

    'account-verification': `Hello {{userName}},

Please verify your email address to complete your ReadnWin account setup. This helps us ensure the security of your account.

Why verify your email?
• Secure your account
• Receive important notifications
• Access all features
• Reset password if needed

Verify My Email: {{verificationUrl}}

If you didn't create a ReadnWin account, you can safely ignore this email.`,

    'email-confirmation': `Congratulations, {{userName}}!

Your email address has been successfully verified. Your ReadnWin account is now fully activated and ready to use!

Your account is ready!
• Access your personal library
• Join reading challenges
• Connect with other readers
• Start earning rewards

Start Exploring: https://readnwin.com/dashboard

Welcome to the ReadnWin community! We're excited to be part of your reading journey.`,

    'account-deactivation': `Hello {{userName}},

Your ReadnWin account has been deactivated. We're sorry to see you go, but we understand that circumstances change.

ACCOUNT STATUS
Status: Deactivated
Reason: {{deactivationReason}}

If you'd like to reactivate your account, you can do so at any time by visiting: {{reactivationUrl}}

Thank you for being part of the ReadnWin community. We hope to see you again soon!`,

    'password-changed': `Hello {{userName}},

Your ReadnWin password has been successfully changed. This action was performed on {{changedAt}}.

PASSWORD CHANGE DETAILS
Changed At: {{changedAt}}
IP Address: {{ipAddress}}

SECURITY NOTICE
If you didn't change your password, please contact our support team immediately to secure your account.

Your account security is important to us. If you have any concerns, please don't hesitate to reach out.`,

    'login-alert': `Hello {{userName}},

We detected a new login to your ReadnWin account. If this was you, no action is needed.

LOGIN DETAILS
Login Time: {{loginTime}}
IP Address: {{ipAddress}}
Device: {{deviceInfo}}

SECURITY ALERT
If this wasn't you, please change your password immediately and contact our support team.

Review Account Security: https://readnwin.com/account/security`,

    'order-status-update': `Hello {{userName}},

Your order status has been updated. Here are the latest details:

ORDER STATUS UPDATE
Order Number: {{orderNumber}}
New Status: {{status}}
Description: {{statusDescription}}

View Order Details: https://readnwin.com/orders/{{orderNumber}}

We'll continue to keep you updated on your order's progress.`,

    'payment-confirmation': `Payment Confirmed, {{userName}}!

Your payment has been successfully processed. Thank you for your purchase!

PAYMENT DETAILS
Order Number: {{orderNumber}}
Amount: {{paymentAmount}}
Payment Method: {{paymentMethod}}

What's next?
• We'll process your order
• You'll receive shipping updates
• Your books will be delivered

View Order Details: https://readnwin.com/orders/{{orderNumber}}`,

    'shipping-notification': `Your Order is Ready, {{userName}}!

Great news! Your order has been processed and is ready for shipping. Here are the shipping details:

SHIPPING INFORMATION
Order Number: {{orderNumber}}
Shipping Method: {{shippingMethod}}
Estimated Delivery: {{estimatedDelivery}}

Shipping Timeline
• Order processed and packed
• Ready for pickup by courier
• Tracking number will be provided soon

Track My Order: https://readnwin.com/orders/{{orderNumber}}`,

    'newsletter-subscription': `Welcome to Our Newsletter, {{userName}}!

Thank you for subscribing to the ReadnWin newsletter! You'll now receive the latest updates, book recommendations, and exclusive offers.

What you'll receive:
• Weekly book recommendations
• Reading tips and insights
• Exclusive discounts and offers
• Community highlights and events

We're excited to share our passion for reading with you. Look out for our first newsletter coming soon!

Unsubscribe: {{unsubscribeUrl}}`,

    'promotional-offer': `Special Offer for You, {{userName}}!

We have an exclusive offer just for you! Don't miss out on this limited-time opportunity.

{{offerTitle}}
{{offerDescription}}
Expires: {{expiryDate}}

Your Discount Code: {{discountCode}}

Shop Now: https://readnwin.com/books

This offer is valid until {{expiryDate}}. Use your discount code at checkout to save!`,

    'system-maintenance': `Scheduled Maintenance Notice

We'll be performing scheduled maintenance to improve your ReadnWin experience. During this time, some services may be temporarily unavailable.

MAINTENANCE DETAILS
Type: {{maintenanceType}}
Start Time: {{startTime}}
End Time: {{endTime}}
Affected Services: {{affectedServices}}

What to expect:
• Brief service interruptions
• Improved performance after maintenance
• All data will be safe and secure

We apologize for any inconvenience and appreciate your patience. We'll be back online as soon as possible!`,

    'security-alert': `Security Alert - Action Required

We've detected a security-related event on your account that requires your attention.

SECURITY ALERT
Alert Type: {{alertType}}
Severity: {{severity}}
Description: {{description}}

Action Required: {{actionRequired}}

Secure My Account: https://readnwin.com/account/security

If you have any questions or need assistance, please contact our security team immediately.`
  };

  return textMap[template.slug] || `Hello {{userName}},

This is a notification from ReadnWin. Please check your account for more details.

View Details: https://readnwin.com/dashboard`;
}

// Run the script
createCompleteEmailTemplates(); 