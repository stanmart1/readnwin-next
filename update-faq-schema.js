require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function updateFAQSchema() {
  console.log('🚀 Updating FAQ database schema...\n');
  
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
    
    // Start transaction
    await client.query('BEGIN');
    
    console.log('📋 Updating existing faqs table...');
    
    // Add missing columns to faqs table
    const alterQueries = [
      // Rename display_order to priority
      'ALTER TABLE faqs RENAME COLUMN display_order TO priority',
      
      // Add missing columns
      'ALTER TABLE faqs ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false',
      'ALTER TABLE faqs ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0',
      'ALTER TABLE faqs ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id)',
      'ALTER TABLE faqs ADD COLUMN IF NOT EXISTS updated_by INTEGER REFERENCES users(id)',
      
      // Add indexes
      'CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category)',
      'CREATE INDEX IF NOT EXISTS idx_faqs_priority ON faqs(priority DESC)',
      'CREATE INDEX IF NOT EXISTS idx_faqs_active ON faqs(is_active)',
      'CREATE INDEX IF NOT EXISTS idx_faqs_featured ON faqs(is_featured)',
      'CREATE INDEX IF NOT EXISTS idx_faqs_created_at ON faqs(created_at DESC)'
    ];
    
    for (const query of alterQueries) {
      try {
        await client.query(query);
        console.log(`✅ Executed: ${query}`);
      } catch (error) {
        if (error.code === '42701') { // Column already exists
          console.log(`⚠️  Skipped (already exists): ${query}`);
        } else if (error.code === '42710') { // Index already exists
          console.log(`⚠️  Skipped (index exists): ${query}`);
        } else {
          console.log(`⚠️  Warning: ${error.message}`);
        }
      }
    }
    
    console.log('\n📋 Creating faq_categories table...');
    
    // Create faq_categories table
    await client.query(`
      CREATE TABLE IF NOT EXISTS faq_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        icon VARCHAR(50),
        color VARCHAR(7),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ faq_categories table created');
    
    // Insert default categories
    console.log('\n📋 Inserting default categories...');
    await client.query(`
      INSERT INTO faq_categories (name, description, icon, color) VALUES
      ('General', 'General questions about ReadnWin', 'ri-question-line', '#3B82F6'),
      ('Registration', 'Questions about registration and enrollment', 'ri-user-add-line', '#10B981'),
      ('Competition', 'Competition rules and procedures', 'ri-trophy-line', '#F59E0B'),
      ('Technical', 'Technical support and platform questions', 'ri-tools-line', '#8B5CF6'),
      ('Payment', 'Payment and billing questions', 'ri-bank-card-line', '#EF4444')
      ON CONFLICT (name) DO NOTHING
    `);
    
    console.log('✅ Default categories inserted');
    
    // Create trigger function if it doesn't exist
    console.log('\n📋 Creating trigger function...');
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);
    
    // Create trigger
    await client.query(`
      DROP TRIGGER IF EXISTS update_faqs_updated_at ON faqs;
      CREATE TRIGGER update_faqs_updated_at 
        BEFORE UPDATE ON faqs 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column()
    `);
    
    console.log('✅ Trigger created');
    
    // Create active_faqs view
    console.log('\n📋 Creating active_faqs view...');
    await client.query(`
      CREATE OR REPLACE VIEW active_faqs AS
      SELECT 
        f.id,
        f.question,
        f.answer,
        f.category,
        f.priority,
        f.is_active,
        f.is_featured,
        f.view_count,
        f.created_at,
        f.updated_at,
        fc.name as category_name,
        fc.icon as category_icon,
        fc.color as category_color
      FROM faqs f
      LEFT JOIN faq_categories fc ON f.category = fc.name
      WHERE f.is_active = true
      ORDER BY f.priority DESC, f.created_at DESC
    `);
    
    console.log('✅ active_faqs view created');
    
    // Update existing FAQs to mark some as featured
    console.log('\n📋 Updating existing FAQs...');
    await client.query(`
      UPDATE faqs 
      SET is_featured = true 
      WHERE question LIKE '%competition%' OR question LIKE '%register%'
    `);
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('\n✅ FAQ schema update completed successfully!');
    
    // Verify the changes
    console.log('\n📋 Verifying changes...');
    
    // Check faqs table structure
    const faqsColumns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'faqs' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Updated faqs table columns:');
    faqsColumns.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULL)'} ${col.column_default ? `DEFAULT: ${col.column_default}` : ''}`);
    });
    
    // Check categories
    const categories = await client.query('SELECT name, description FROM faq_categories ORDER BY name');
    console.log('\n📋 Categories:');
    categories.rows.forEach(cat => {
      console.log(`   - ${cat.name}: ${cat.description}`);
    });
    
    // Check featured FAQs
    const featuredFaqs = await client.query('SELECT question, category FROM faqs WHERE is_featured = true ORDER BY priority DESC LIMIT 3');
    console.log('\n📋 Featured FAQs:');
    featuredFaqs.rows.forEach(faq => {
      console.log(`   - ${faq.question} [${faq.category}]`);
    });
    
    client.release();
    
  } catch (error) {
    console.error('❌ Error updating FAQ schema:', error);
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

updateFAQSchema().catch(console.error); 