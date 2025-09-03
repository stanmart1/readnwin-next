#!/usr/bin/env node

require('dotenv').config();
const { query } = require('./utils/database');

async function checkReadingProgressTable() {
  try {
    console.log('🔍 Checking reading_progress table...');

    // Check if table exists
    const tableExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'reading_progress'
      )
    `);

    console.log('Table exists:', tableExists.rows[0].exists);

    if (tableExists.rows[0].exists) {
      // Check table structure
      const columns = await query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'reading_progress'
        ORDER BY ordinal_position
      `);

      console.log('\nTable structure:');
      columns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULLABLE)'}`);
      });

      // Check sample data
      const sampleData = await query(`
        SELECT COUNT(*) as count FROM reading_progress
      `);
      console.log(`\nTotal records: ${sampleData.rows[0].count}`);

      if (sampleData.rows[0].count > 0) {
        const sample = await query(`
          SELECT * FROM reading_progress LIMIT 3
        `);
        console.log('\nSample records:');
        sample.rows.forEach(row => {
          console.log(`  - User ${row.user_id}, Book ${row.book_id}: ${row.progress_percentage}%`);
        });
      }
    } else {
      console.log('\n❌ reading_progress table does not exist');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking table:', error);
    process.exit(1);
  }
}

checkReadingProgressTable();