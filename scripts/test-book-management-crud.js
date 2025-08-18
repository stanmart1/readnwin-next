#!/usr/bin/env node

/**
 * Book Management CRUD Operations Test Script
 * 
 * This script tests all CRUD operations for books in the admin dashboard:
 * - CREATE: Add new books
 * - READ: Fetch and display books
 * - UPDATE: Modify book properties (including featured status)
 * - DELETE: Remove books
 * 
 * Usage: node scripts/test-book-management-crud.js
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Database connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: false
});

// Test data
const testBook = {
  title: 'Test Book for CRUD Operations',
  author_id: 1, // Assuming author ID 1 exists
  category_id: 1, // Assuming category ID 1 exists
  price: 29.99,
  isbn: 'TEST-ISBN-' + Date.now(),
  description: 'This is a test book to verify CRUD operations',
  language: 'English',
  pages: 200,
  publication_date: '2024-01-01',
  publisher: 'Test Publisher',
  format: 'ebook',
  stock_quantity: 100,
  is_featured: false,
  is_bestseller: false,
  is_new_release: true,
  status: 'published'
};

let testBookId = null;

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

async function testCreateBook() {
  console.log('\n📚 Testing CREATE operation...');
  try {
    const result = await pool.query(`
      INSERT INTO books (
        title, author_id, category_id, price, isbn, description, 
        language, pages, publication_date, publisher, format, 
        stock_quantity, is_featured, is_bestseller, is_new_release, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING id, title, is_featured, created_at
    `, [
      testBook.title, testBook.author_id, testBook.category_id, testBook.price,
      testBook.isbn, testBook.description, testBook.language, testBook.pages,
      testBook.publication_date, testBook.publisher, testBook.format,
      testBook.stock_quantity, testBook.is_featured, testBook.is_bestseller,
      testBook.is_new_release, testBook.status
    ]);

    testBookId = result.rows[0].id;
    console.log('✅ Book created successfully:', {
      id: testBookId,
      title: result.rows[0].title,
      is_featured: result.rows[0].is_featured,
      created_at: result.rows[0].created_at
    });
    return true;
  } catch (error) {
    console.error('❌ Book creation failed:', error.message);
    return false;
  }
}

async function testReadBook() {
  console.log('\n📖 Testing READ operation...');
  try {
    const result = await pool.query(`
      SELECT b.*, a.name as author_name, c.name as category_name
      FROM books b
      LEFT JOIN authors a ON b.author_id = a.id
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.id = $1
    `, [testBookId]);

    if (result.rows.length === 0) {
      console.error('❌ Book not found');
      return false;
    }

    const book = result.rows[0];
    console.log('✅ Book retrieved successfully:', {
      id: book.id,
      title: book.title,
      author: book.author_name,
      category: book.category_name,
      price: book.price,
      is_featured: book.is_featured,
      status: book.status
    });
    return true;
  } catch (error) {
    console.error('❌ Book retrieval failed:', error.message);
    return false;
  }
}

async function testUpdateBook() {
  console.log('\n✏️ Testing UPDATE operation...');
  
  // Test 1: Update featured status
  console.log('  🔍 Testing featured status update...');
  try {
    const result = await pool.query(`
      UPDATE books 
      SET is_featured = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, title, is_featured, updated_at
    `, [testBookId, true]);

    if (result.rows.length === 0) {
      console.error('  ❌ Featured status update failed');
      return false;
    }

    const book = result.rows[0];
    console.log('  ✅ Featured status updated successfully:', {
      id: book.id,
      title: book.title,
      is_featured: book.is_featured,
      updated_at: book.updated_at
    });
  } catch (error) {
    console.error('  ❌ Featured status update failed:', error.message);
    return false;
  }

  // Test 2: Update multiple fields
  console.log('  🔍 Testing multiple field update...');
  try {
    const result = await pool.query(`
      UPDATE books 
      SET 
        title = $2,
        price = $3,
        is_bestseller = $4,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, title, price, is_bestseller, updated_at
    `, [testBookId, 'Updated Test Book', 39.99, true]);

    if (result.rows.length === 0) {
      console.error('  ❌ Multiple field update failed');
      return false;
    }

    const book = result.rows[0];
    console.log('  ✅ Multiple fields updated successfully:', {
      id: book.id,
      title: book.title,
      price: book.price,
      is_bestseller: book.is_bestseller,
      updated_at: book.updated_at
    });
  } catch (error) {
    console.error('  ❌ Multiple field update failed:', error.message);
    return false;
  }

  return true;
}

async function testDeleteBook() {
  console.log('\n🗑️ Testing DELETE operation...');
  try {
    // First, check if there are any foreign key constraints
    const constraints = await pool.query(`
      SELECT 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name = 'books'
    `);

    console.log('  🔍 Found foreign key constraints:', constraints.rows.length);

    // Delete the test book
    const result = await pool.query('DELETE FROM books WHERE id = $1 RETURNING id, title', [testBookId]);
    
    if (result.rows.length === 0) {
      console.error('  ❌ Book deletion failed');
      return false;
    }

    console.log('  ✅ Book deleted successfully:', {
      id: result.rows[0].id,
      title: result.rows[0].title
    });
    return true;
  } catch (error) {
    console.error('  ❌ Book deletion failed:', error.message);
    return false;
  }
}

async function testBulkOperations() {
  console.log('\n📦 Testing BULK operations...');
  
  // Create multiple test books
  const bulkBooks = [
    { ...testBook, title: 'Bulk Test Book 1', isbn: 'BULK-1-' + Date.now() },
    { ...testBook, title: 'Bulk Test Book 2', isbn: 'BULK-2-' + Date.now() },
    { ...testBook, title: 'Bulk Test Book 3', isbn: 'BULK-3-' + Date.now() }
  ];

  const bookIds = [];

  try {
    // Insert multiple books
    for (const book of bulkBooks) {
      const result = await pool.query(`
        INSERT INTO books (
          title, author_id, category_id, price, isbn, description, 
          language, pages, publication_date, publisher, format, 
          stock_quantity, is_featured, is_bestseller, is_new_release, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING id
      `, [
        book.title, book.author_id, book.category_id, book.price,
        book.isbn, book.description, book.language, book.pages,
        book.publication_date, book.publisher, book.format,
        book.stock_quantity, book.is_featured, book.is_bestseller,
        book.is_new_release, book.status
      ]);
      
      bookIds.push(result.rows[0].id);
    }

    console.log('  ✅ Bulk insert successful:', bookIds.length, 'books created');

    // Test bulk update
    const updateResult = await pool.query(`
      UPDATE books 
      SET is_featured = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = ANY($1)
      RETURNING id, title, is_featured
    `, [bookIds]);

    console.log('  ✅ Bulk update successful:', updateResult.rows.length, 'books updated');

    // Test bulk delete
    const deleteResult = await pool.query(`
      DELETE FROM books 
      WHERE id = ANY($1)
      RETURNING id, title
    `, [bookIds]);

    console.log('  ✅ Bulk delete successful:', deleteResult.rows.length, 'books deleted');

    return true;
  } catch (error) {
    console.error('  ❌ Bulk operations failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Book Management CRUD Operations Test Suite\n');
  
  const tests = [
    { name: 'Database Connection', fn: testDatabaseConnection },
    { name: 'CREATE Book', fn: testCreateBook },
    { name: 'READ Book', fn: testReadBook },
    { name: 'UPDATE Book', fn: testUpdateBook },
    { name: 'DELETE Book', fn: testDeleteBook },
    { name: 'BULK Operations', fn: testBulkOperations }
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passedTests++;
      }
    } catch (error) {
      console.error(`❌ Test "${test.name}" failed with error:`, error.message);
    }
  }

  console.log('\n📊 Test Results Summary');
  console.log('========================');
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Book Management CRUD operations are working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the errors above.');
  }

  await pool.end();
}

// Run the tests
runAllTests().catch(console.error); 