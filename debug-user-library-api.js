#!/usr/bin/env node

const { query } = require('./utils/database.js');

async function debugUserLibraryAPI() {
  console.log('🔍 Debugging User Library API...\n');

  try {
    // Check if user_library table exists and its structure
    console.log('1️⃣ Checking user_library table structure...');
    const tableStructure = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'user_library'
      ORDER BY ordinal_position
    `);
    
    if (tableStructure.rows.length === 0) {
      console.log('❌ user_library table does not exist!');
      return;
    }
    
    console.log('✅ user_library table columns:');
    tableStructure.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // Check if users table exists
    console.log('\n2️⃣ Checking users table...');
    const usersCheck = await query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name IN ('first_name', 'last_name', 'email')
    `);
    console.log(`✅ Users table has ${usersCheck.rows.length} required columns`);

    // Check if books table exists
    console.log('\n3️⃣ Checking books table...');
    const booksCheck = await query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'books' AND column_name IN ('title', 'author_id')
    `);
    console.log(`✅ Books table has ${booksCheck.rows.length} required columns`);

    // Test the actual query that's failing
    console.log('\n4️⃣ Testing the API query...');
    try {
      const testQuery = `
        SELECT 
          ul.id,
          ul.user_id,
          CONCAT(u.first_name, ' ', u.last_name) as user_name,
          u.email as user_email,
          ul.book_id,
          b.title as book_title,
          COALESCE(a.name, 'Unknown Author') as book_author,
          COALESCE(ul.purchase_date, ul.added_at) as assigned_at,
          COALESCE(rp.progress_percentage, 0) as progress,
          rp.last_read_at as last_read,
          COALESCE(ul.status, 'active') as status
        FROM user_library ul
        JOIN users u ON ul.user_id = u.id
        JOIN books b ON ul.book_id = b.id
        LEFT JOIN authors a ON b.author_id = a.id
        LEFT JOIN reading_progress rp ON ul.user_id = rp.user_id AND ul.book_id = rp.book_id
        LIMIT 1
      `;
      
      const testResult = await query(testQuery);
      console.log(`✅ Query executed successfully, returned ${testResult.rows.length} rows`);
      
      if (testResult.rows.length > 0) {
        console.log('Sample row:', testResult.rows[0]);
      }
    } catch (queryError) {
      console.log('❌ Query failed:', queryError.message);
      
      // Try simpler query to isolate the issue
      console.log('\n5️⃣ Testing simpler query...');
      try {
        const simpleQuery = `SELECT COUNT(*) as count FROM user_library`;
        const simpleResult = await query(simpleQuery);
        console.log(`✅ Simple count query works: ${simpleResult.rows[0].count} records`);
        
        // Test join with users
        const userJoinQuery = `
          SELECT ul.id, u.first_name, u.last_name 
          FROM user_library ul 
          JOIN users u ON ul.user_id = u.id 
          LIMIT 1
        `;
        const userJoinResult = await query(userJoinQuery);
        console.log(`✅ User join works: ${userJoinResult.rows.length} rows`);
        
        // Test join with books
        const bookJoinQuery = `
          SELECT ul.id, b.title 
          FROM user_library ul 
          JOIN books b ON ul.book_id = b.id 
          LIMIT 1
        `;
        const bookJoinResult = await query(bookJoinQuery);
        console.log(`✅ Book join works: ${bookJoinResult.rows.length} rows`);
        
      } catch (simpleError) {
        console.log('❌ Even simple query failed:', simpleError.message);
      }
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    process.exit(0);
  }
}

debugUserLibraryAPI();