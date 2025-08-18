const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || '149.102.159.118',
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD || 'S48lyoqo1mX7ytoiBvDZfCBB4TiCcGIU1rEdpu0NfBFP3V9q426PKDkGmV8aMD8b',
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: false, // SSL is disabled for the new database
});

async function checkOrders() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking Order Placement Flow in Database');
    console.log('============================================\n');

    // 1. Check if orders table exists
    console.log('📋 1. Checking orders table structure...');
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'orders'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ Orders table does not exist!');
      return;
    }
    console.log('✅ Orders table exists');

    // 2. Check orders table structure
    console.log('\n📋 2. Checking orders table columns...');
    const columnsCheck = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'orders'
      ORDER BY ordinal_position;
    `);
    
    console.log('Orders table columns:');
    columnsCheck.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    // 3. Count total orders
    console.log('\n📋 3. Counting total orders...');
    const countResult = await client.query('SELECT COUNT(*) as total FROM orders');
    const totalOrders = parseInt(countResult.rows[0].total);
    console.log(`Total orders in database: ${totalOrders}`);

    if (totalOrders === 0) {
      console.log('⚠️  No orders found in database');
      console.log('💡 This means either:');
      console.log('   - No orders have been placed yet');
      console.log('   - Orders are being created in a different table');
      console.log('   - There is an issue with the order creation process');
      return;
    }

    // 4. Get recent orders
    console.log('\n📋 4. Recent orders (last 10)...');
    const recentOrders = await client.query(`
      SELECT 
        id,
        order_number,
        user_id,
        status,
        payment_status,
        total_amount,
        created_at,
        updated_at
      FROM orders 
      ORDER BY created_at DESC 
      LIMIT 10
    `);

    console.log('Recent orders:');
    recentOrders.rows.forEach((order, index) => {
      console.log(`   ${index + 1}. Order #${order.order_number}`);
      console.log(`      - ID: ${order.id}`);
      console.log(`      - User ID: ${order.user_id || 'Guest'}`);
      console.log(`      - Status: ${order.status}`);
      console.log(`      - Payment Status: ${order.payment_status}`);
      console.log(`      - Total: ${order.total_amount}`);
      console.log(`      - Created: ${order.created_at}`);
      console.log(`      - Updated: ${order.updated_at}`);
      console.log('');
    });

    // 5. Check order items
    console.log('📋 5. Checking order items...');
    const itemsCheck = await client.query(`
      SELECT COUNT(*) as total FROM order_items
    `);
    const totalItems = parseInt(itemsCheck.rows[0].total);
    console.log(`Total order items: ${totalItems}`);

    if (totalItems > 0) {
      const recentItems = await client.query(`
        SELECT 
          oi.id,
          oi.order_id,
          oi.book_id,
          oi.title,
          oi.author_name,
          oi.price,
          oi.quantity,
          oi.total_price,
          oi.format,
          o.order_number
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        ORDER BY oi.created_at DESC
        LIMIT 5
      `);

      console.log('Recent order items:');
      recentItems.rows.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.title} by ${item.author_name}`);
        console.log(`      - Order: #${item.order_number}`);
        console.log(`      - Price: ${item.price} x ${item.quantity} = ${item.total_price}`);
        console.log(`      - Format: ${item.format}`);
        console.log('');
      });
    }

    // 6. Check user library (for ebooks)
    console.log('📋 6. Checking user library...');
    const libraryCheck = await client.query(`
      SELECT COUNT(*) as total FROM user_library
    `);
    const totalLibraryItems = parseInt(libraryCheck.rows[0].total);
    console.log(`Total library items: ${totalLibraryItems}`);

    if (totalLibraryItems > 0) {
      const recentLibrary = await client.query(`
        SELECT 
          ul.id,
          ul.user_id,
          ul.book_id,
          ul.order_id,
          ul.purchase_date,
          b.title,
          b.author_name
        FROM user_library ul
        JOIN books b ON ul.book_id = b.id
        ORDER BY ul.purchase_date DESC
        LIMIT 5
      `);

      console.log('Recent library items:');
      recentLibrary.rows.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.title}`);
        console.log(`      - User ID: ${item.user_id}`);
        console.log(`      - Order ID: ${item.order_id}`);
        console.log(`      - Purchase Date: ${item.purchase_date}`);
        console.log('');
      });
    }

    // 7. Check order status distribution
    console.log('📋 7. Order status distribution...');
    const statusDistribution = await client.query(`
      SELECT 
        status,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM orders), 2) as percentage
      FROM orders 
      GROUP BY status 
      ORDER BY count DESC
    `);

    console.log('Order status distribution:');
    statusDistribution.rows.forEach(status => {
      console.log(`   - ${status.status}: ${status.count} (${status.percentage}%)`);
    });

    // 8. Check payment status distribution
    console.log('\n📋 8. Payment status distribution...');
    const paymentDistribution = await client.query(`
      SELECT 
        payment_status,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM orders), 2) as percentage
      FROM orders 
      GROUP BY payment_status 
      ORDER BY count DESC
    `);

    console.log('Payment status distribution:');
    paymentDistribution.rows.forEach(payment => {
      console.log(`   - ${payment.payment_status}: ${payment.count} (${payment.percentage}%)`);
    });

    // 9. Verify data consistency
    console.log('\n📋 9. Data consistency check...');
    
    // Check for orders without items
    const ordersWithoutItems = await client.query(`
      SELECT COUNT(*) as count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE oi.id IS NULL
    `);
    
    const orphanedOrders = parseInt(ordersWithoutItems.rows[0].count);
    if (orphanedOrders > 0) {
      console.log(`⚠️  Found ${orphanedOrders} orders without items`);
    } else {
      console.log('✅ All orders have items');
    }

    // Check for items without orders
    const itemsWithoutOrders = await client.query(`
      SELECT COUNT(*) as count
      FROM order_items oi
      LEFT JOIN orders o ON oi.order_id = o.id
      WHERE o.id IS NULL
    `);
    
    const orphanedItems = parseInt(itemsWithoutOrders.rows[0].count);
    if (orphanedItems > 0) {
      console.log(`⚠️  Found ${orphanedItems} order items without orders`);
    } else {
      console.log('✅ All order items have valid orders');
    }

    console.log('\n🎉 Order placement flow database check completed!');
    
    // Summary
    console.log('\n📊 Summary:');
    console.log(`   - Total orders: ${totalOrders}`);
    console.log(`   - Total order items: ${totalItems}`);
    console.log(`   - Total library items: ${totalLibraryItems}`);
    console.log(`   - Orphaned orders: ${orphanedOrders}`);
    console.log(`   - Orphaned items: ${orphanedItems}`);

    if (totalOrders > 0 && totalItems > 0 && orphanedOrders === 0 && orphanedItems === 0) {
      console.log('\n✅ Order placement flow appears to be working correctly!');
      console.log('   Orders are being created and stored properly in the database.');
    } else {
      console.log('\n⚠️  Some issues detected in the order placement flow.');
      console.log('   Please review the findings above.');
    }

  } catch (error) {
    console.error('❌ Error checking orders:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the check
checkOrders().catch(console.error); 