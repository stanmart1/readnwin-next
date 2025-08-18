require('dotenv').config({ path: '.env.local' });
const { query } = require('../utils/database');

async function runMigration() {
  try {
    console.log('🔄 Running database migration for book upload system...');
    
    // Add html_file_path column
    await query('ALTER TABLE books ADD COLUMN IF NOT EXISTS html_file_path TEXT');
    console.log('✅ Added html_file_path column');
    
    // Add processing_status column
    await query('ALTER TABLE books ADD COLUMN IF NOT EXISTS processing_status VARCHAR(20) DEFAULT \'pending\'');
    console.log('✅ Added processing_status column');
    
    // Create indexes
    await query('CREATE INDEX IF NOT EXISTS idx_books_html_file_path ON books(html_file_path)');
    console.log('✅ Created html_file_path index');
    
    await query('CREATE INDEX IF NOT EXISTS idx_books_processing_status ON books(processing_status)');
    console.log('✅ Created processing_status index');
    
    // Verify the migration
    const schemaResult = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'books' 
      AND column_name IN ('html_file_path', 'processing_status')
    `);
    
    console.log('📋 Current schema for new columns:');
    schemaResult.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
    console.log('🎉 Database migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration(); 