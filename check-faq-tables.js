require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function checkFAQTables() {
  console.log('🔍 Checking existing FAQ tables...\n');
  
  const config = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: false
  };
  
  const pool = new Pool(config);
  
  try {
    const client = await pool.connect();
    console.log('✅ Database connection successful!');
    
    // Check if faq_categories table exists
    const categoriesExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'faq_categories'
      );
    `);
    
    if (categoriesExists.rows[0].exists) {
      console.log('✅ faq_categories table exists');
      
      // Check faq_categories structure
      const categoriesColumns = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'faq_categories' 
        ORDER BY ordinal_position
      `);
      
      console.log('📋 faq_categories table columns:');
      categoriesColumns.rows.forEach(col => {
        console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULL)'} ${col.column_default ? `DEFAULT: ${col.column_default}` : ''}`);
      });
      
      // Check categories count
      const categoriesCount = await client.query('SELECT COUNT(*) as count FROM faq_categories');
      console.log(`📋 Categories count: ${categoriesCount.rows[0].count}`);
    } else {
      console.log('❌ faq_categories table does not exist');
    }
    
    // Check if faqs table exists
    const faqsExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'faqs'
      );
    `);
    
    if (faqsExists.rows[0].exists) {
      console.log('✅ faqs table exists');
      
      // Check faqs structure
      const faqsColumns = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'faqs' 
        ORDER BY ordinal_position
      `);
      
      console.log('📋 faqs table columns:');
      faqsColumns.rows.forEach(col => {
        console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULL)'} ${col.column_default ? `DEFAULT: ${col.column_default}` : ''}`);
      });
      
      // Check faqs count
      const faqsCount = await client.query('SELECT COUNT(*) as count FROM faqs');
      console.log(`📋 FAQs count: ${faqsCount.rows[0].count}`);
    } else {
      console.log('❌ faqs table does not exist');
    }
    
    // Check if active_faqs view exists
    const viewExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.views 
        WHERE table_schema = 'public' 
        AND table_name = 'active_faqs'
      );
    `);
    
    if (viewExists.rows[0].exists) {
      console.log('✅ active_faqs view exists');
    } else {
      console.log('❌ active_faqs view does not exist');
    }
    
    client.release();
    
  } catch (error) {
    console.error('❌ Error checking FAQ tables:', error);
  } finally {
    await pool.end();
  }
}

checkFAQTables().catch(console.error); 