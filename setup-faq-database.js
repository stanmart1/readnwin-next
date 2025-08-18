require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function setupFAQDatabase() {
  console.log('🚀 Setting up FAQ database tables...\n');
  
  // Database configuration
  const config = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: false
  };
  
  console.log('📋 Database Configuration:');
  console.log(`📋 Host: ${config.host}`);
  console.log(`📋 Database: ${config.database}`);
  console.log(`📋 User: ${config.user ? '***SET***' : 'NOT SET'}`);
  console.log(`📋 Password: ${config.password ? '***SET***' : 'NOT SET'}`);
  console.log(`📋 Port: ${config.port}`);
  console.log(`📋 SSL: ${config.ssl}\n`);
  
  const pool = new Pool(config);
  
  try {
    const client = await pool.connect();
    console.log('✅ Database connection successful!');
    
    // Read the FAQ schema file
    const schemaPath = path.join(__dirname, 'database-faq-schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📋 Executing FAQ schema...');
    
    // Execute the schema
    await client.query(schemaSQL);
    
    console.log('✅ FAQ database schema executed successfully!');
    
    // Verify the tables were created
    console.log('\n📋 Verifying tables...');
    
    // Check faq_categories table
    const categoriesExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'faq_categories'
      );
    `);
    
    if (categoriesExists.rows[0].exists) {
      console.log('✅ faq_categories table exists');
      
      // Check categories count
      const categoriesCount = await client.query('SELECT COUNT(*) as count FROM faq_categories');
      console.log(`📋 Categories count: ${categoriesCount.rows[0].count}`);
      
      // List categories
      const categories = await client.query('SELECT name, description FROM faq_categories ORDER BY name');
      console.log('📋 Categories:');
      categories.rows.forEach(cat => {
        console.log(`   - ${cat.name}: ${cat.description}`);
      });
    } else {
      console.log('❌ faq_categories table does not exist');
    }
    
    // Check faqs table
    const faqsExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'faqs'
      );
    `);
    
    if (faqsExists.rows[0].exists) {
      console.log('✅ faqs table exists');
      
      // Check faqs count
      const faqsCount = await client.query('SELECT COUNT(*) as count FROM faqs');
      console.log(`📋 FAQs count: ${faqsCount.rows[0].count}`);
      
      // List some FAQs
      const faqs = await client.query(`
        SELECT question, category, is_featured 
        FROM faqs 
        ORDER BY priority DESC, created_at DESC 
        LIMIT 5
      `);
      console.log('📋 Sample FAQs:');
      faqs.rows.forEach(faq => {
        const featured = faq.is_featured ? ' (Featured)' : '';
        console.log(`   - ${faq.question} [${faq.category}]${featured}`);
      });
    } else {
      console.log('❌ faqs table does not exist');
    }
    
    // Check active_faqs view
    const viewExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.views 
        WHERE table_schema = 'public' 
        AND table_name = 'active_faqs'
      );
    `);
    
    if (viewExists.rows[0].exists) {
      console.log('✅ active_faqs view exists');
      
      // Test the view
      const activeFaqs = await client.query('SELECT COUNT(*) as count FROM active_faqs');
      console.log(`📋 Active FAQs count: ${activeFaqs.rows[0].count}`);
    } else {
      console.log('❌ active_faqs view does not exist');
    }
    
    client.release();
    console.log('\n🎉 FAQ database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error setting up FAQ database:', error);
    console.error('Error details:', error.message);
    
    if (error.code) {
      console.error('Error code:', error.code);
    }
    
    if (error.detail) {
      console.error('Error detail:', error.detail);
    }
    
    if (error.hint) {
      console.error('Error hint:', error.hint);
    }
  } finally {
    await pool.end();
  }
}

// Run the setup
setupFAQDatabase().catch(console.error); 