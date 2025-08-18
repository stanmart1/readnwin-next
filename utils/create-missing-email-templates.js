const { query } = require('./database');

async function createMissingEmailTemplates() {
  try {
    console.log('🔄 Creating missing email templates...\n');

    const templates = [
      {
        name: 'Order Status Update',
        slug: 'order-status-update',
        subject: 'Order Status Update - #{{orderNumber}}',
        category: 'orders',
        description: 'Sent when order status changes',
        variables: { userName: 'string', orderNumber: 'string', status: 'string', statusDescription: 'string' },
        html_content: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Status Update</title>
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
        .info-box { background-color: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 25px 0; }
        .info-box h3 { font-size: 16px; font-weight: 600; margin-bottom: 10px; color: #1f2937; }
        .info-box p { font-size: 14px; color: #6b7280; margin-bottom: 5px; }
        .button { display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; }
        .button:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
        .footer { background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer p { font-size: 14px; color: #6b7280; margin-bottom: 10px; }
        @media (max-width: 600px) { .header, .content, .footer { padding: 20px; } .header h1 { font-size: 24px; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📦 Order Status Update</h1>
            <p>Your order has been updated</p>
        </div>
        
        <div class="content">
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
            </div>
        </div>
        
        <div class="footer">
            <p>© 2025 ReadnWin. All rights reserved.</p>
            <p>For support, contact us at support@readnwin.com</p>
        </div>
    </div>
</body>
</html>`,
        text_content: `Hello {{userName}},

Your order status has been updated. Here are the latest details:

ORDER STATUS UPDATE
Order Number: {{orderNumber}}
New Status: {{status}}
Description: {{statusDescription}}

View Order Details: https://readnwin.com/orders/{{orderNumber}}

We'll continue to keep you updated on your order's progress.

© 2025 ReadnWin. All rights reserved.`
      },
      {
        name: 'Payment Confirmation',
        slug: 'payment-confirmation',
        subject: 'Payment Confirmed - Order #{{orderNumber}}',
        category: 'orders',
        description: 'Sent when payment is confirmed',
        variables: { userName: 'string', orderNumber: 'string', paymentAmount: 'string', paymentMethod: 'string' },
        html_content: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Confirmation</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
        .header p { font-size: 16px; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 18px; font-weight: 600; margin-bottom: 20px; color: #1f2937; }
        .message { font-size: 16px; line-height: 1.7; margin-bottom: 25px; color: #4b5563; }
        .info-box { background-color: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 25px 0; }
        .info-box h3 { font-size: 16px; font-weight: 600; margin-bottom: 10px; color: #1f2937; }
        .info-box p { font-size: 14px; color: #6b7280; margin-bottom: 5px; }
        .highlight-box { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 25px 0; }
        .button { display: inline-block; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; }
        .button:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); }
        .footer { background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer p { font-size: 14px; color: #6b7280; margin-bottom: 10px; }
        @media (max-width: 600px) { .header, .content, .footer { padding: 20px; } .header h1 { font-size: 24px; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💳 Payment Confirmed</h1>
            <p>Your payment has been processed</p>
        </div>
        
        <div class="content">
            <div class="greeting">Payment Confirmed, {{userName}}!</div>
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
            </div>
        </div>
        
        <div class="footer">
            <p>© 2025 ReadnWin. All rights reserved.</p>
            <p>For support, contact us at support@readnwin.com</p>
        </div>
    </div>
</body>
</html>`,
        text_content: `Payment Confirmed, {{userName}}!

Your payment has been successfully processed. Thank you for your purchase!

PAYMENT DETAILS
Order Number: {{orderNumber}}
Amount: {{paymentAmount}}
Payment Method: {{paymentMethod}}

What's next?
• We'll process your order
• You'll receive shipping updates
• Your books will be delivered

View Order Details: https://readnwin.com/orders/{{orderNumber}}

© 2025 ReadnWin. All rights reserved.`
      },
      {
        name: 'Shipping Notification',
        slug: 'shipping-notification',
        subject: 'Your Order is Ready for Shipping! 📦',
        category: 'orders',
        description: 'Sent when order is ready for shipping',
        variables: { userName: 'string', orderNumber: 'string', shippingMethod: 'string', estimatedDelivery: 'string' },
        html_content: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shipping Notification</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
        .header p { font-size: 16px; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 18px; font-weight: 600; margin-bottom: 20px; color: #1f2937; }
        .message { font-size: 16px; line-height: 1.7; margin-bottom: 25px; color: #4b5563; }
        .info-box { background-color: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 25px 0; }
        .info-box h3 { font-size: 16px; font-weight: 600; margin-bottom: 10px; color: #1f2937; }
        .info-box p { font-size: 14px; color: #6b7280; margin-bottom: 5px; }
        .highlight-box { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 25px 0; }
        .button { display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; }
        .button:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3); }
        .footer { background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer p { font-size: 14px; color: #6b7280; margin-bottom: 10px; }
        @media (max-width: 600px) { .header, .content, .footer { padding: 20px; } .header h1 { font-size: 24px; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚚 Ready for Shipping</h1>
            <p>Your order is being prepared</p>
        </div>
        
        <div class="content">
            <div class="greeting">Great news, {{userName}}!</div>
            <div class="message">
                Your order is ready for shipping and will be dispatched soon. Here are the shipping details:
            </div>
            <div class="info-box">
                <h3>Shipping Information</h3>
                <p><strong>Order Number:</strong> {{orderNumber}}</p>
                <p><strong>Shipping Method:</strong> {{shippingMethod}}</p>
                <p><strong>Estimated Delivery:</strong> {{estimatedDelivery}}</p>
            </div>
            <div class="highlight-box">
                <strong>What happens next?</strong><br>
                • Your order will be shipped within 24 hours<br>
                • You'll receive tracking information<br>
                • Delivery will be made to your address
            </div>
            <div style="text-align: center;">
                <a href="https://readnwin.com/orders/{{orderNumber}}" class="button">Track My Order</a>
            </div>
        </div>
        
        <div class="footer">
            <p>© 2025 ReadnWin. All rights reserved.</p>
            <p>For support, contact us at support@readnwin.com</p>
        </div>
    </div>
</body>
</html>`,
        text_content: `Great news, {{userName}}!

Your order is ready for shipping and will be dispatched soon. Here are the shipping details:

SHIPPING INFORMATION
Order Number: {{orderNumber}}
Shipping Method: {{shippingMethod}}
Estimated Delivery: {{estimatedDelivery}}

What happens next?
• Your order will be shipped within 24 hours
• You'll receive tracking information
• Delivery will be made to your address

Track My Order: https://readnwin.com/orders/{{orderNumber}}

© 2025 ReadnWin. All rights reserved.`
      }
    ];

    for (const template of templates) {
      try {
        // Check if template already exists
        const existing = await query('SELECT id FROM email_templates WHERE slug = $1', [template.slug]);
        
        if (existing.rows.length === 0) {
          // Create template
          const result = await query(`
            INSERT INTO email_templates (name, slug, subject, html_content, text_content, description, category, variables, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id
          `, [
            template.name,
            template.slug,
            template.subject,
            template.html_content,
            template.text_content,
            template.description,
            template.category,
            JSON.stringify(template.variables),
            true
          ]);

          console.log(`✅ Created template: ${template.name} (${template.slug})`);

          // Create function assignment
          const functionResult = await query('SELECT id FROM email_functions WHERE slug = $1', [template.slug]);
          if (functionResult.rows.length > 0) {
            await query(`
              INSERT INTO email_function_assignments (function_id, template_id, is_active, priority)
              VALUES ($1, $2, $3, $4)
              ON CONFLICT (function_id, template_id) DO NOTHING
            `, [
              functionResult.rows[0].id,
              result.rows[0].id,
              true,
              1
            ]);
            console.log(`✅ Assigned template to function: ${template.slug}`);
          }
        } else {
          console.log(`⏭️ Template already exists: ${template.name} (${template.slug})`);
        }
      } catch (error) {
        console.error(`❌ Error creating template ${template.name}:`, error);
      }
    }

    console.log('\n🎉 Email templates creation completed!');
  } catch (error) {
    console.error('❌ Error creating email templates:', error);
    process.exit(1);
  }
}

// Run the script
createMissingEmailTemplates(); 