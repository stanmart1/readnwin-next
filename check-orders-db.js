const { query } = require('./utils/database');

async function checkOrders() {
  try {
    console.log('🔍 Checking orders in database...\n');
    
    // Check if orders table exists
    const tableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'orders'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ Orders table does not exist');
      return;
    }
    
    console.log('✅ Orders table exists');
    
    // Get total count of orders
    const countResult = await query('SELECT COUNT(*) as total FROM orders');
    const totalOrders = parseInt(countResult.rows[0].total);
    
    console.log(`📊 Total orders in database: ${totalOrders}`);
    
    if (totalOrders === 0) {
      console.log('\n💡 No orders found in database. This explains why the orders page shows 0 orders.');
      
      // Check if there are any order_items
      const itemsResult = await query('SELECT COUNT(*) as total FROM order_items');
      const totalItems = parseInt(itemsResult.rows[0].total);
      console.log(`📦 Total order items: ${totalItems}`);
      
      return;
    }
    
    // Get sample orders
    const sampleResult = await query(`
      SELECT 
        id, 
        order_number, 
        status, 
        payment_status, 
        total_amount, 
        created_at,
        user_id,
        guest_email
      FROM orders 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    console.log('\n📋 Sample orders:');
    sampleResult.rows.forEach((order, index) => {
      console.log(`${index + 1}. Order #${order.order_number}`);
      console.log(`   Status: ${order.status} | Payment: ${order.payment_status}`);
      console.log(`   Amount: ${order.total_amount} | Date: ${order.created_at}`);
      console.log(`   User ID: ${order.user_id} | Guest: ${order.guest_email || 'N/A'}`);
      console.log('');
    });
    
    // Check order statuses distribution
    const statusResult = await query(`
      SELECT status, COUNT(*) as count 
      FROM orders 
      GROUP BY status 
      ORDER BY count DESC
    `);
    
    console.log('📈 Order status distribution:');
    statusResult.rows.forEach(row => {
      console.log(`   ${row.status}: ${row.count} orders`);
    });
    
    // Check payment statuses
    const paymentResult = await query(`
      SELECT payment_status, COUNT(*) as count 
      FROM orders 
      GROUP BY payment_status 
      ORDER BY count DESC
    `);
    
    console.log('\n💳 Payment status distribution:');
    paymentResult.rows.forEach(row => {
      console.log(`   ${row.payment_status}: ${row.count} orders`);
    });
    
  } catch (error) {
    console.error('❌ Error checking orders:', error);
  }
}

checkOrders();