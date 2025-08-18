require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: false,
});

async function debugBankTransfer() {
  try {
    console.log('🔍 Debugging Bank Transfer Payment Method...\n');
    
    // Step 1: Check database connection
    console.log('1️⃣ Testing database connection...');
    const client = await pool.connect();
    console.log('✅ Database connected successfully\n');
    
    // Step 2: Check if we have a test user
    console.log('2️⃣ Checking for test user...');
    const userResult = await client.query(`
      SELECT id, name, email FROM users LIMIT 1
    `);
    
    if (userResult.rows.length === 0) {
      console.log('❌ No users found in database');
      return;
    }
    
    const testUser = userResult.rows[0];
    console.log(`✅ Found test user: ${testUser.name} (ID: ${testUser.id})\n`);
    
    // Step 3: Check if user has cart items
    console.log('3️⃣ Checking user cart items...');
    const cartResult = await client.query(`
      SELECT ci.*, b.title, b.price, b.format 
      FROM cart_items ci 
      LEFT JOIN books b ON ci.book_id = b.id 
      WHERE ci.user_id = $1
    `, [testUser.id]);
    
    if (cartResult.rows.length === 0) {
      console.log('❌ No cart items found for user');
      console.log('💡 Adding a test book to cart...');
      
      // Add a test book to cart
      const bookResult = await client.query(`
        SELECT id, title, price FROM books LIMIT 1
      `);
      
      if (bookResult.rows.length > 0) {
        const testBook = bookResult.rows[0];
        await client.query(`
          INSERT INTO cart_items (user_id, book_id, quantity, created_at)
          VALUES ($1, $2, 1, CURRENT_TIMESTAMP)
        `, [testUser.id, testBook.id]);
        console.log(`✅ Added test book "${testBook.title}" to cart`);
      } else {
        console.log('❌ No books available to add to cart');
        return;
      }
    } else {
      console.log(`✅ Found ${cartResult.rows.length} cart items`);
      cartResult.rows.forEach(item => {
        console.log(`   - ${item.title}: ${item.quantity} x ${item.price}`);
      });
    }
    console.log('');
    
    // Step 4: Check bank account configuration
    console.log('4️⃣ Checking bank account configuration...');
    const bankAccountResult = await client.query(`
      SELECT * FROM bank_accounts WHERE is_active = true
    `);
    
    if (bankAccountResult.rows.length === 0) {
      console.log('❌ No active bank accounts found');
      return;
    }
    
    const bankAccount = bankAccountResult.rows[0];
    console.log(`✅ Active bank account: ${bankAccount.bank_name} - ${bankAccount.account_number}`);
    console.log(`   Account name: ${bankAccount.account_name}`);
    console.log(`   Default: ${bankAccount.is_default}`);
    console.log('');
    
    // Step 5: Test bank transfer service directly
    console.log('5️⃣ Testing bank transfer service...');
    try {
      // Import the bank transfer service
      const { bankTransferService } = require('./utils/bank-transfer-service.ts');
      
      // Test creating a bank transfer
      const testAmount = 1000; // 1000 NGN
      const testOrderId = 999999; // Use a test order ID
      
      console.log('🔍 Creating test bank transfer...');
      const bankTransfer = await bankTransferService.createBankTransfer(
        testOrderId,
        testUser.id,
        testAmount,
        'NGN'
      );
      
      console.log('✅ Bank transfer created successfully!');
      console.log(`   Transfer ID: ${bankTransfer.id}`);
      console.log(`   Reference: ${bankTransfer.transaction_reference}`);
      console.log(`   Amount: ${bankTransfer.amount} ${bankTransfer.currency}`);
      console.log(`   Expires: ${bankTransfer.expires_at}`);
      
      // Test getting default bank account
      const defaultAccount = await bankTransferService.getDefaultBankAccount();
      console.log('✅ Default bank account retrieved:');
      console.log(`   Bank: ${defaultAccount.bank_name}`);
      console.log(`   Account: ${defaultAccount.account_number}`);
      console.log(`   Name: ${defaultAccount.account_name}`);
      
      // Clean up test transfer
      await client.query(`
        DELETE FROM bank_transfers WHERE id = $1
      `, [bankTransfer.id]);
      console.log('🧹 Cleaned up test bank transfer');
      
    } catch (serviceError) {
      console.error('❌ Bank transfer service error:', serviceError.message);
      console.error('❌ Error details:', serviceError);
    }
    console.log('');
    
    // Step 6: Check payment_transactions table
    console.log('6️⃣ Checking payment_transactions table...');
    const paymentTxResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'payment_transactions'
    `);
    
    if (paymentTxResult.rows.length === 0) {
      console.log('❌ payment_transactions table does not exist');
    } else {
      console.log('✅ payment_transactions table exists');
      
      // Check table structure
      const columns = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'payment_transactions' 
        ORDER BY ordinal_position
      `);
      
      console.log('   Table columns:');
      columns.rows.forEach(col => {
        console.log(`     ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
    }
    console.log('');
    
    // Step 7: Test ecommerce service methods
    console.log('7️⃣ Testing ecommerce service methods...');
    try {
      const { ecommerceService } = require('./utils/ecommerce-service-new.ts');
      
      // Test getCartItems
      console.log('🔍 Testing getCartItems...');
      const cartItems = await ecommerceService.getCartItems(testUser.id);
      console.log(`✅ getCartItems: Found ${cartItems.length} items`);
      
      // Test getCartAnalytics
      console.log('🔍 Testing getCartAnalytics...');
      const analytics = await ecommerceService.getCartAnalytics(testUser.id);
      console.log(`✅ getCartAnalytics: Total value = ${analytics.totalValue}`);
      
      // Test createPaymentTransaction
      console.log('🔍 Testing createPaymentTransaction...');
      const transactionId = `TEST-${Date.now()}`;
      const paymentTx = await ecommerceService.createPaymentTransaction(
        'TEST-ORDER-123',
        'bank_transfer',
        testUser.id,
        1000,
        transactionId
      );
      console.log(`✅ createPaymentTransaction: Created transaction ${paymentTx.transaction_id}`);
      
      // Clean up test transaction
      await client.query(`
        DELETE FROM payment_transactions WHERE transaction_id = $1
      `, [transactionId]);
      console.log('🧹 Cleaned up test payment transaction');
      
    } catch (ecommerceError) {
      console.error('❌ Ecommerce service error:', ecommerceError.message);
      console.error('❌ Error details:', ecommerceError);
    }
    
    client.release();
    console.log('\n✅ Debug completed!');
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
    console.error('❌ Error details:', error);
  } finally {
    await pool.end();
  }
}

debugBankTransfer(); 