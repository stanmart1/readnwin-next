#!/usr/bin/env node

const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: '149.102.159.118',
  database: 'postgres',
  password: '6c8u2MsYqlbQxL5IxftjrV7QQnlLymdsmzMtTeIe4Ur1od7RR9CdODh3VfQ4ka2f',
  port: 5432,
  ssl: false,
});

async function checkMigrations() {
  console.log('🔍 CHECKING DATABASE MIGRATIONS\n');
  
  try {
    const client = await pool.connect();
    
    // Check if migrations table exists
    const migrationsTableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'migrations'
      );
    `);
    
    if (!migrationsTableExists.rows[0].exists) {
      console.log('❌ Migrations table does not exist');
      console.log('✅ Creating migrations table...');
      
      await client.query(`
        CREATE TABLE migrations (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ Migrations table created');
    } else {
      console.log('✅ Migrations table exists');
      
      // Check executed migrations
      const executedMigrations = await client.query('SELECT name FROM migrations ORDER BY executed_at');
      console.log(`📋 Executed migrations: ${executedMigrations.rows.length}`);
      executedMigrations.rows.forEach(row => {
        console.log(`   - ${row.name}`);
      });
    }
    
    // Check critical table structures
    console.log('\n🔍 CHECKING CRITICAL TABLE STRUCTURES');
    
    const criticalTables = [
      { name: 'books', requiredColumns: ['id', 'title', 'author_id', 'category_id', 'book_type', 'status', 'visibility'] },
      { name: 'book_formats', requiredColumns: ['id', 'book_id', 'format_type', 'file_path'] },
      { name: 'user_library', requiredColumns: ['id', 'user_id', 'book_id', 'access_type'] },
      { name: 'reading_progress', requiredColumns: ['id', 'user_id', 'book_id', 'progress_percentage'] },
      { name: 'highlights', requiredColumns: ['id', 'user_id', 'book_id', 'text'] },
      { name: 'notes', requiredColumns: ['id', 'user_id', 'book_id', 'content'] },
      { name: 'bookmarks', requiredColumns: ['id', 'user_id', 'book_id', 'position_data'] }
    ];
    
    let needsMigration = false;
    
    for (const table of criticalTables) {
      const tableExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = $1
        );
      `, [table.name]);
      
      if (!tableExists.rows[0].exists) {
        console.log(`❌ ${table.name}: MISSING`);
        needsMigration = true;
        continue;
      }
      
      // Check required columns
      const columns = await client.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = $1
      `, [table.name]);
      
      const existingColumns = columns.rows.map(row => row.column_name);
      const missingColumns = table.requiredColumns.filter(col => !existingColumns.includes(col));
      
      if (missingColumns.length > 0) {
        console.log(`⚠️  ${table.name}: Missing columns - ${missingColumns.join(', ')}`);
        needsMigration = true;
      } else {
        console.log(`✅ ${table.name}: All required columns present`);
      }
    }
    
    // Check indexes
    console.log('\n🔍 CHECKING CRITICAL INDEXES');
    const criticalIndexes = [
      'idx_books_status',
      'idx_books_featured', 
      'idx_books_visibility',
      'idx_user_library_user_id',
      'idx_reading_progress_user_book'
    ];
    
    for (const indexName of criticalIndexes) {
      const indexExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM pg_indexes 
          WHERE indexname = $1
        );
      `, [indexName]);
      
      if (!indexExists.rows[0].exists) {
        console.log(`⚠️  Index ${indexName}: MISSING`);
        needsMigration = true;
      } else {
        console.log(`✅ Index ${indexName}: EXISTS`);
      }
    }
    
    client.release();
    
    console.log('\n📊 MIGRATION STATUS:');
    if (needsMigration) {
      console.log('❌ Database needs migration');
      console.log('🔧 Run migration script to fix missing structures');
    } else {
      console.log('✅ Database is up to date');
      console.log('🎉 No migrations needed');
    }
    
  } catch (error) {
    console.error('❌ Migration check failed:', error.message);
  } finally {
    await pool.end();
  }
}

checkMigrations();