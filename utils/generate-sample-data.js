const { query } = require('./database.ts');

async function generateSampleData() {
  try {
    console.log('🔄 Generating sample data for analytics...');

    // Generate sample audit logs
    console.log('📝 Generating sample audit logs...');
    const auditActions = [
      'auth.login',
      'auth.logout', 
      'users.create',
      'users.update',
      'books.create',
      'books.update',
      'orders.create',
      'orders.update',
      'system.analytics',
      'system.settings'
    ];

    for (let i = 0; i < 50; i++) {
      const action = auditActions[Math.floor(Math.random() * auditActions.length)];
      const userId = Math.random() > 0.3 ? Math.floor(Math.random() * 10) + 1 : null;
      const details = JSON.stringify({
        page: Math.floor(Math.random() * 10) + 1,
        limit: 20,
        timestamp: new Date().toISOString()
      });

      await query(
        `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address, user_agent, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          userId,
          action,
          action.split('.')[0],
          Math.floor(Math.random() * 100) + 1,
          details,
          `192.168.1.${Math.floor(Math.random() * 255)}`,
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random time in last 30 days
        ]
      );
    }

    // Generate sample orders for daily activity
    console.log('🛒 Generating sample orders...');
    const orderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    
    for (let i = 0; i < 100; i++) {
      const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
      const totalAmount = Math.floor(Math.random() * 50000) + 1000;
      const userId = Math.floor(Math.random() * 10) + 1;
      
      await query(
        `INSERT INTO orders (order_number, user_id, status, subtotal, tax_amount, shipping_amount, discount_amount, total_amount, currency, payment_status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          `ORD-${Date.now()}-${i}`,
          userId,
          status,
          totalAmount * 0.9,
          totalAmount * 0.05,
          totalAmount * 0.05,
          0,
          totalAmount,
          'NGN',
          status === 'delivered' ? 'paid' : 'pending',
          new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random time in last 7 days
        ]
      );
    }

    console.log('✅ Sample data generated successfully!');
    console.log('📊 You can now test the analytics dashboard with real data.');

  } catch (error) {
    console.error('❌ Error generating sample data:', error);
  } finally {
    process.exit(0);
  }
}

generateSampleData(); 