const { query } = require('../utils/database');

// Design system constants based on "ReadnWin Email Gateway Test" template
const DESIGN_SYSTEM = {
  header: {
    background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
    color: 'white',
    padding: '40px 30px',
    textAlign: 'center'
  },
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: '#ffffff'
  },
  content: {
    padding: '40px 30px'
  },
  footer: {
    backgroundColor: '#f8fafc',
    padding: '30px',
    textAlign: 'center',
    borderTop: '1px solid #e5e7eb'
  },
  button: {
    display: 'inline-block',
    background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
    color: 'white',
    padding: '14px 28px',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '16px',
    margin: '20px 0'
  }
};

// Generate consistent HTML template structure
function generateConsistentTemplate(templateName, content, buttonText = null, buttonUrl = null) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${templateName}</title>
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
        .success-box { background-color: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 20px; margin: 25px 0; }
        .success-box h3 { color: #065f46; font-size: 16px; font-weight: 600; margin-bottom: 10px; }
        .success-box p { color: #047857; font-size: 14px; }
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
            ${content}
            ${buttonText && buttonUrl ? `<div style="text-align: center;"><a href="${buttonUrl}" class="button">${buttonText}</a></div>` : ''}
        </div>
        
        <div class="footer">
            <p>Thank you for choosing ReadnWin!</p>
            <p>If you have any questions, please contact our support team.</p>
            <div class="social-links">
                <a href="mailto:support@readnwin.com">📧 Support</a> | <a href="https://readnwin.com">🌐 Website</a> | <a href="https://readnwin.com/app">📱 App</a>
            </div>
            <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
                © 2025 ReadnWin. All rights reserved.<br>
                You received this email because you're a registered user of ReadnWin.
            </p>
        </div>
    </div>
</body>
</html>`;
}

// Template content generators
const templateContentGenerators = {
  'welcome': (userName) => `
            <div class="greeting">Welcome to ReadnWin, ${userName}! 🎉</div>
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
            <div class="message">
                If you have any questions or need assistance, our support team is here to help. Happy reading!
            </div>`,
  
  'email-confirmation': (userName) => `
            <div class="greeting">Congratulations, ${userName}! 🎉</div>
            <div class="success-box">
                <h3>Email Verified Successfully!</h3>
                <p>Your email address has been successfully verified. Your ReadnWin account is now fully activated and ready to use!</p>
            </div>
            <div class="highlight-box">
                <strong>Your account is ready!</strong><br>
                • Access your personal library<br>
                • Join reading challenges<br>
                • Connect with other readers<br>
                • Start earning rewards
            </div>
            <div class="message">
                Welcome to the ReadnWin community! We're excited to be part of your reading journey.
            </div>`,
  
  'password-reset': (userName, resetUrl) => `
            <div class="greeting">Hello ${userName},</div>
            <div class="message">
                We received a request to reset your ReadnWin password. If you didn't make this request, you can safely ignore this email.
            </div>
            <div class="alert-box">
                <h3>🔐 Password Reset Request</h3>
                <p>Click the button below to reset your password. This link will expire in 24 hours for your security.</p>
            </div>
            <div class="message">
                For security reasons, this link will expire in 24 hours. If you need a new link, please request another password reset from your account settings.
            </div>`,
  
  'order-confirmation': (userName, orderNumber, orderTotal) => `
            <div class="greeting">Thank you for your order, ${userName}! 📦</div>
            <div class="message">
                Your order has been confirmed and is being processed. We'll notify you once it's ready for shipping.
            </div>
            <div class="info-box">
                <h3>Order Details</h3>
                <p><strong>Order Number:</strong> ${orderNumber}</p>
                <p><strong>Total Amount:</strong> ${orderTotal}</p>
                <p><strong>Status:</strong> Confirmed</p>
            </div>
            <div class="highlight-box">
                <strong>What happens next?</strong><br>
                • We'll process your order within 1-2 business days<br>
                • You'll receive a shipping notification with tracking details<br>
                • Your books will be delivered to your address
            </div>`,
  
  'order-status-update': (userName, orderNumber, status, statusDescription) => `
            <div class="greeting">Hello ${userName},</div>
            <div class="message">
                Your order status has been updated. Here are the latest details:
            </div>
            <div class="info-box">
                <h3>Order Status Update</h3>
                <p><strong>Order Number:</strong> ${orderNumber}</p>
                <p><strong>New Status:</strong> ${status}</p>
                <p><strong>Description:</strong> ${statusDescription}</p>
            </div>
            <div class="message">
                We'll continue to keep you updated on your order's progress.
            </div>`,
  
  'account-verification': (userName, verificationUrl) => `
            <div class="greeting">Hello ${userName},</div>
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
            <div class="message">
                If you didn't create a ReadnWin account, you can safely ignore this email.
            </div>`,
  
  'account-deactivation': (userName, deactivationReason, reactivationUrl) => `
            <div class="greeting">Hello ${userName},</div>
            <div class="message">
                Your ReadnWin account has been deactivated. We're sorry to see you go, but we understand that circumstances change.
            </div>
            <div class="info-box">
                <h3>Account Status</h3>
                <p><strong>Status:</strong> Deactivated</p>
                <p><strong>Reason:</strong> ${deactivationReason}</p>
            </div>
            <div class="message">
                If you'd like to reactivate your account, you can do so at any time by clicking the button below.
            </div>
            <div class="message">
                Thank you for being part of the ReadnWin community. We hope to see you again soon!
            </div>`,
  
  'password-changed': (userName, changedAt, ipAddress) => `
            <div class="greeting">Hello ${userName},</div>
            <div class="message">
                Your ReadnWin password has been successfully changed. This action was performed on ${changedAt}.
            </div>
            <div class="info-box">
                <h3>Password Change Details</h3>
                <p><strong>Changed At:</strong> ${changedAt}</p>
                <p><strong>IP Address:</strong> ${ipAddress}</p>
            </div>
            <div class="alert-box">
                <h3>🔒 Security Notice</h3>
                <p>If you didn't change your password, please contact our support team immediately to secure your account.</p>
            </div>
            <div class="message">
                Your account security is important to us. If you have any concerns, please don't hesitate to reach out.
            </div>`,
  
  'system-maintenance': (maintenanceType, startTime, endTime, affectedServices) => `
            <div class="greeting">Scheduled Maintenance Notice</div>
            <div class="message">
                We'll be performing scheduled maintenance to improve your ReadnWin experience. During this time, some services may be temporarily unavailable.
            </div>
            <div class="info-box">
                <h3>Maintenance Details</h3>
                <p><strong>Type:</strong> ${maintenanceType}</p>
                <p><strong>Start Time:</strong> ${startTime}</p>
                <p><strong>End Time:</strong> ${endTime}</p>
                <p><strong>Affected Services:</strong> ${affectedServices}</p>
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
  
  'security-alert': (alertType, severity, description, actionRequired) => `
            <div class="greeting">Security Alert - Action Required</div>
            <div class="message">
                We've detected a security-related event on your account that requires your attention.
            </div>
            <div class="alert-box">
                <h3>🔒 Security Alert</h3>
                <p><strong>Alert Type:</strong> ${alertType}</p>
                <p><strong>Severity:</strong> ${severity}</p>
                <p><strong>Description:</strong> ${description}</p>
            </div>
            <div class="message">
                <strong>Action Required:</strong> ${actionRequired}
            </div>
            <div class="message">
                If you have any questions or need assistance, please contact our security team immediately.
            </div>`
};

// Button configurations for each template
const buttonConfigs = {
  'welcome': { text: 'Start Reading Now', url: 'https://readnwin.com/dashboard' },
  'email-confirmation': { text: 'Start Exploring', url: 'https://readnwin.com/dashboard' },
  'password-reset': { text: 'Reset My Password', url: '{{resetUrl}}' },
  'order-confirmation': { text: 'View Order Details', url: 'https://readnwin.com/orders/{{orderNumber}}' },
  'order-status-update': { text: 'View Order Details', url: 'https://readnwin.com/orders/{{orderNumber}}' },
  'account-verification': { text: 'Verify My Email', url: '{{verificationUrl}}' },
  'account-deactivation': { text: 'Reactivate My Account', url: '{{reactivationUrl}}' },
  'system-maintenance': null, // No button needed
  'security-alert': { text: 'Secure My Account', url: 'https://readnwin.com/account/security' },
  'password-changed': null, // No button needed
  'order-shipped': { text: 'Track My Order', url: 'https://readnwin.com/orders/{{orderNumber}}/tracking' },
  'payment-confirmation': { text: 'View Payment Details', url: 'https://readnwin.com/payments/{{paymentId}}' },
  'login-alert': { text: 'Secure My Account', url: 'https://readnwin.com/account/security' },
  'newsletter-subscription': { text: 'Manage Preferences', url: 'https://readnwin.com/account/preferences' },
  'promotional-offer': { text: 'Claim Offer', url: 'https://readnwin.com/offers/{{offerId}}' },
  'shipping-notification': { text: 'Track Package', url: 'https://readnwin.com/orders/{{orderNumber}}/tracking' }
};

async function updateEmailTemplates() {
  try {
    console.log('🔄 Updating Email Templates Design System...\n');

    // Get all active email templates
    const templates = await query('SELECT * FROM email_templates WHERE is_active = true ORDER BY name');
    console.log(`Found ${templates.rows.length} active email templates\n`);

    let updatedCount = 0;
    let localhostLinksFixed = 0;

    for (const template of templates.rows) {
      console.log(`Processing: ${template.name} (${template.slug})`);
      
      // Check if template has localhost links
      const hasLocalhost = template.html_content.includes('localhost:3000');
      if (hasLocalhost) {
        console.log('  ⚠️  Found localhost links - will be updated');
        localhostLinksFixed++;
      }

      // Generate new content based on template type
      let newContent = '';
      let buttonConfig = buttonConfigs[template.slug];

      if (templateContentGenerators[template.slug]) {
        // Use template-specific content generator
        const generator = templateContentGenerators[template.slug];
        
        // For templates with variables, we'll use placeholders
        if (template.slug === 'welcome') {
          newContent = generator('{{userName}}');
        } else if (template.slug === 'email-confirmation') {
          newContent = generator('{{userName}}');
        } else if (template.slug === 'password-reset') {
          newContent = generator('{{userName}}', '{{resetUrl}}');
        } else if (template.slug === 'order-confirmation') {
          newContent = generator('{{userName}}', '{{orderNumber}}', '{{orderTotal}}');
        } else if (template.slug === 'order-status-update') {
          newContent = generator('{{userName}}', '{{orderNumber}}', '{{status}}', '{{statusDescription}}');
        } else if (template.slug === 'account-verification') {
          newContent = generator('{{userName}}', '{{verificationUrl}}');
        } else if (template.slug === 'account-deactivation') {
          newContent = generator('{{userName}}', '{{deactivationReason}}', '{{reactivationUrl}}');
        } else if (template.slug === 'password-changed') {
          newContent = generator('{{userName}}', '{{changedAt}}', '{{ipAddress}}');
        } else if (template.slug === 'system-maintenance') {
          newContent = generator('{{maintenanceType}}', '{{startTime}}', '{{endTime}}', '{{affectedServices}}');
        } else if (template.slug === 'security-alert') {
          newContent = generator('{{alertType}}', '{{severity}}', '{{description}}', '{{actionRequired}}');
        } else {
          // Fallback for other templates
          newContent = generator('{{userName}}');
        }
      } else {
        // Fallback for templates without specific generators
        newContent = `
            <div class="greeting">Hello {{userName}},</div>
            <div class="message">
                This is a notification from ReadnWin. Please check your account for more details.
            </div>`;
      }

      // Generate the complete HTML template
      const newHtmlContent = generateConsistentTemplate(
        template.name,
        newContent,
        buttonConfig?.text,
        buttonConfig?.url
      );

      // Update the template in the database
      await query(
        'UPDATE email_templates SET html_content = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newHtmlContent, template.id]
      );

      console.log(`  ✅ Updated design and structure`);
      updatedCount++;
    }

    console.log(`\n🎉 Email Templates Update Complete!`);
    console.log(`📊 Summary:`);
    console.log(`   • Templates updated: ${updatedCount}`);
    console.log(`   • Localhost links fixed: ${localhostLinksFixed}`);
    console.log(`   • Design system applied: ${updatedCount}`);
    console.log(`\n✨ All email templates now follow the consistent "ReadnWin Email Gateway Test" design system`);
    console.log(`🔗 All links updated from localhost:3000 to readnwin.com`);

  } catch (error) {
    console.error('❌ Error updating email templates:', error);
    throw error;
  }
}

// Run the update
if (require.main === module) {
  updateEmailTemplates()
    .then(() => {
      console.log('\n✅ Email templates update completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Email templates update failed:', error);
      process.exit(1);
    });
}

module.exports = { updateEmailTemplates }; 