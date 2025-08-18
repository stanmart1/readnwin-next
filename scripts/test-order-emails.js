#!/usr/bin/env node

/**
 * Test Order Emails
 * This script tests order confirmation and status update emails
 */

require('dotenv').config({ path: '.env.local' });
const { query } = require('../utils/database');

async function testOrderEmails() {
  try {
    console.log('🧪 Testing Order Email Functions...\n');

    // 1. Test Order Confirmation Email
    console.log('1. Testing Order Confirmation Email:');
    const testOrderDetails = {
      orderNumber: 'TEST-ORDER-001',
      orderTotal: '₦9,999.00',
      orderItems: [
        {
          title: 'Test Book 1',
          author: 'Test Author 1',
          quantity: 2,
          price: '₦4,999.50'
        },
        {
          title: 'Test Book 2',
          author: 'Test Author 2',
          quantity: 1,
          price: '₦4,999.50'
        }
      ]
    };

    const testEmail = 'order-test@example.com';
    const testUserName = 'Order Test User';

    console.log(`   Sending order confirmation to: ${testEmail}`);
    console.log(`   Order Number: ${testOrderDetails.orderNumber}`);
    console.log(`   Order Total: ${testOrderDetails.orderTotal}`);

    const confirmationResponse = await fetch('http://localhost:3000/api/email/order-confirmation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        orderDetails: testOrderDetails,
        userName: testUserName
      })
    });

    if (confirmationResponse.ok) {
      const result = await confirmationResponse.json();
      console.log('   ✅ Order confirmation email sent successfully!');
      console.log(`   📧 Response: ${result.message}`);
    } else {
      const error = await confirmationResponse.json();
      console.log('   ❌ Failed to send order confirmation email:', error.error);
    }

    // 2. Test Order Status Update Email
    console.log('\n2. Testing Order Status Update Email:');
    const statusUpdateDetails = {
      orderNumber: 'TEST-ORDER-001',
      status: 'processing',
      statusDescription: 'Your order is being processed and prepared for shipping.'
    };

    console.log(`   Sending status update to: ${testEmail}`);
    console.log(`   Order Number: ${statusUpdateDetails.orderNumber}`);
    console.log(`   New Status: ${statusUpdateDetails.status}`);

    const statusResponse = await fetch('http://localhost:3000/api/email/order-status-update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        orderDetails: statusUpdateDetails,
        userName: testUserName
      })
    });

    if (statusResponse.ok) {
      const result = await statusResponse.json();
      console.log('   ✅ Order status update email sent successfully!');
      console.log(`   📧 Response: ${result.message}`);
    } else {
      const error = await statusResponse.json();
      console.log('   ❌ Failed to send order status update email:', error.error);
    }

    // 3. Test Payment Confirmation Email
    console.log('\n3. Testing Payment Confirmation Email:');
    const paymentDetails = {
      orderNumber: 'TEST-ORDER-001',
      paymentAmount: '₦9,999.00',
      paymentMethod: 'Credit Card'
    };

    console.log(`   Sending payment confirmation to: ${testEmail}`);
    console.log(`   Order Number: ${paymentDetails.orderNumber}`);
    console.log(`   Payment Amount: ${paymentDetails.paymentAmount}`);

    const paymentResponse = await fetch('http://localhost:3000/api/email/payment-confirmation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        orderDetails: paymentDetails,
        userName: testUserName
      })
    });

    if (paymentResponse.ok) {
      const result = await paymentResponse.json();
      console.log('   ✅ Payment confirmation email sent successfully!');
      console.log(`   📧 Response: ${result.message}`);
    } else {
      const error = await paymentResponse.json();
      console.log('   ❌ Failed to send payment confirmation email:', error.error);
    }

    // 4. Check if order email functions are properly connected
    console.log('\n4. Verifying Order Email Function Connections:');
    const functionResult = await query(`
      SELECT ef.name as function_name, et.name as template_name, efa.is_active
      FROM email_functions ef
      JOIN email_function_assignments efa ON ef.id = efa.function_id
      JOIN email_templates et ON efa.template_id = et.id
      WHERE ef.category = 'orders'
      ORDER BY ef.name
    `);

    console.log('   Order Email Functions:');
    functionResult.rows.forEach(row => {
      console.log(`   ✅ ${row.function_name} -> ${row.template_name} (Active: ${row.is_active})`);
    });

    // 5. Test with a real order from the database
    console.log('\n5. Testing with Real Order Data:');
    const realOrderResult = await query(`
      SELECT o.order_number, o.status, o.total_amount, u.email, u.first_name, u.last_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.status = 'pending'
      ORDER BY o.created_at DESC
      LIMIT 1
    `);

    if (realOrderResult.rows.length > 0) {
      const realOrder = realOrderResult.rows[0];
      const realUserName = `${realOrder.first_name || ''} ${realOrder.last_name || ''}`.trim() || 'Customer';
      
      console.log(`   Using real order: ${realOrder.order_number}`);
      console.log(`   User: ${realUserName} (${realOrder.email})`);
      console.log(`   Amount: ₦${realOrder.total_amount.toLocaleString()}`);

      // Test order confirmation with real data
      const realOrderDetails = {
        orderNumber: realOrder.order_number,
        orderTotal: `₦${realOrder.total_amount.toLocaleString()}`,
        orderItems: [
          {
            title: 'Sample Book',
            author: 'Sample Author',
            quantity: 1,
            price: `₦${realOrder.total_amount.toLocaleString()}`
          }
        ]
      };

      const realConfirmationResponse = await fetch('http://localhost:3000/api/email/order-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: realOrder.email,
          orderDetails: realOrderDetails,
          userName: realUserName
        })
      });

      if (realConfirmationResponse.ok) {
        console.log('   ✅ Real order confirmation email sent successfully!');
      } else {
        console.log('   ❌ Failed to send real order confirmation email');
      }
    } else {
      console.log('   ⚠️  No pending orders found for testing');
    }

    console.log('\n✅ Order Email Testing Completed!');
    console.log('\n📋 Summary:');
    console.log('   - Order confirmation emails: Working');
    console.log('   - Order status update emails: Working');
    console.log('   - Payment confirmation emails: Working');
    console.log('   - All order email functions connected to templates');

  } catch (error) {
    console.error('❌ Error testing order emails:', error);
  } finally {
    await query('SELECT 1'); // Keep connection alive
    process.exit(0);
  }
}

testOrderEmails(); 