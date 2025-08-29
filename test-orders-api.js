// Simple test to check orders API functionality
const { query } = require('./utils/database');

async function testOrdersAPI() {
  try {
    console.log('🔍 Testing Orders API functionality...\n');
    
    // Test 1: Check database connection
    console.log('1. Testing database connection...');
    const connectionTest = await query('SELECT NOW() as current_time');
    console.log('✅ Database connected:', connectionTest.rows[0].current_time);
    
    // Test 2: Check if orders table exists and structure
    console.log('\n2. Checking orders table structure...');
    const tableStructure = await query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'orders' 
      ORDER BY ordinal_position
    `);
    
    if (tableStructure.rows.length === 0) {
      console.log('❌ Orders table does not exist');
      return;
    }
    
    console.log('✅ Orders table structure:');
    tableStructure.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Test 3: Count orders
    console.log('\n3. Counting orders...');
    const countResult = await query('SELECT COUNT(*) as total FROM orders');
    const totalOrders = parseInt(countResult.rows[0].total);
    console.log(`📊 Total orders: ${totalOrders}`);
    
    // Test 4: Check users table for admin users
    console.log('\n4. Checking for admin users...');
    const adminCheck = await query(`
      SELECT u.id, u.email, u.first_name, u.last_name, r.name as role_name
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id AND ur.is_active = TRUE
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE r.name IN ('admin', 'super_admin')
      LIMIT 5
    `);
    
    if (adminCheck.rows.length === 0) {
      console.log('⚠️ No admin users found');
    } else {
      console.log('✅ Admin users found:');
      adminCheck.rows.forEach(user => {
        console.log(`   ${user.email} (${user.role_name}) - ID: ${user.id}`);
      });
    }
    
    // Test 5: Simulate the API query
    console.log('\n5. Simulating API query...');
    const apiQuery = `
      SELECT 
        o.*,
        u.first_name || ' ' || u.last_name as customer_name,
        COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE 1=1
      GROUP BY o.id, u.first_name, u.last_name
      ORDER BY o.created_at DESC
      LIMIT 20 OFFSET 0
    `;
    
    const apiResult = await query(apiQuery);
    console.log(`📋 API query returned ${apiResult.rows.length} orders`);
    
    if (apiResult.rows.length > 0) {
      console.log('✅ Sample order from API query:');
      const sampleOrder = apiResult.rows[0];
      console.log(`   Order #${sampleOrder.order_number}`);
      console.log(`   Customer: ${sampleOrder.customer_name || 'Guest'}`);
      console.log(`   Status: ${sampleOrder.status}`);
      console.log(`   Payment: ${sampleOrder.payment_status}`);
      console.log(`   Items: ${sampleOrder.item_count}`);
    }
    
    // Test 6: Check if there are any order_items
    console.log('\n6. Checking order items...');
    const itemsResult = await query('SELECT COUNT(*) as total FROM order_items');
    const totalItems = parseInt(itemsResult.rows[0].total);
    console.log(`📦 Total order items: ${totalItems}`);
    
    if (totalOrders === 0) {
      console.log('\n💡 DIAGNOSIS: No orders found in database');
      console.log('   This explains why the orders page shows 0 orders.');
      console.log('   To fix this, you need to:');
      console.log('   1. Create some test orders in the database, OR');
      console.log('   2. Check if orders are being created properly during checkout');
    } else {
      console.log('\n✅ Orders exist in database. The API should be working.');
      console.log('   If the frontend still shows 0 orders, check:');
      console.log('   1. Network requests in browser dev tools');
      console.log('   2. Authentication/authorization issues');
      console.log('   3. Frontend error handling');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testOrdersAPI();