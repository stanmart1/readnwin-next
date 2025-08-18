#!/usr/bin/env node

/**
 * Check Specific Books Script
 * Checks if books with IDs 57, 87, and 2 exist and examines their details
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Database connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: false,
});

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logBook(book) {
  log(`\n📚 Book ID: ${book.id}`, 'cyan');
  log(`   Title: ${book.title}`, 'bright');
  log(`   Author ID: ${book.author_id}`, 'blue');
  log(`   Category ID: ${book.category_id}`, 'blue');
  log(`   Status: ${book.status}`, 'blue');
  log(`   Format: ${book.format}`, 'blue');
  log(`   Price: $${book.price}`, 'blue');
  log(`   Stock: ${book.stock_quantity}`, 'blue');
  log(`   Created: ${book.created_at}`, 'blue');
  log(`   Updated: ${book.updated_at}`, 'blue');
  
  if (book.is_featured) log(`   ⭐ Featured`, 'yellow');
  if (book.is_bestseller) log(`   🏆 Bestseller`, 'yellow');
  if (book.is_new_release) log(`   🆕 New Release`, 'yellow');
}

async function checkBook(id) {
  try {
    const query = `
      SELECT 
        b.*,
        a.name as author_name,
        c.name as category_name
      FROM books b
      LEFT JOIN authors a ON b.author_id = a.id
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      logError(`Book with ID ${id} does not exist`);
      return null;
    }
    
    const book = result.rows[0];
    logBook(book);
    
    // Check if it looks like a placeholder/hardcoded book
    const isPlaceholder = checkIfPlaceholder(book);
    if (isPlaceholder) {
      logWarning(`Book ID ${id} appears to be a placeholder/hardcoded book`);
    } else {
      logSuccess(`Book ID ${id} appears to be a real book`);
    }
    
    return book;
  } catch (error) {
    logError(`Error checking book ${id}: ${error.message}`);
    return null;
  }
}

function checkIfPlaceholder(book) {
  const placeholderIndicators = [
    // Check for generic/placeholder titles
    book.title.toLowerCase().includes('test'),
    book.title.toLowerCase().includes('sample'),
    book.title.toLowerCase().includes('example'),
    book.title.toLowerCase().includes('placeholder'),
    book.title.toLowerCase().includes('demo'),
    book.title.toLowerCase().includes('lorem'),
    book.title.toLowerCase().includes('ipsum'),
    
    // Check for generic descriptions
    book.description && (
      book.description.toLowerCase().includes('lorem ipsum') ||
      book.description.toLowerCase().includes('sample text') ||
      book.description.toLowerCase().includes('placeholder') ||
      book.description.toLowerCase().includes('test content')
    ),
    
    // Check for default/placeholder prices
    book.price === 0 || book.price === 9.99 || book.price === 19.99,
    
    // Check for missing author or category
    !book.author_id || !book.category_id,
    
    // Check for draft status
    book.status === 'draft',
    
    // Check for missing cover image
    !book.cover_image_url || book.cover_image_url.includes('placeholder'),
    
    // Check for very recent creation (might be test data)
    new Date(book.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
  ];
  
  return placeholderIndicators.some(indicator => indicator);
}

async function getBookCount() {
  try {
    const result = await pool.query('SELECT COUNT(*) as count FROM books');
    return result.rows[0].count;
  } catch (error) {
    logError(`Error getting book count: ${error.message}`);
    return 0;
  }
}

async function getRecentBooks(limit = 10) {
  try {
    const query = `
      SELECT id, title, status, created_at, updated_at
      FROM books
      ORDER BY created_at DESC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limit]);
    return result.rows;
  } catch (error) {
    logError(`Error getting recent books: ${error.message}`);
    return [];
  }
}

async function main() {
  log('🔍 Checking Specific Books', 'bright');
  log('');

  // Check database connection
  try {
    await pool.query('SELECT 1');
    logSuccess('Database connection successful');
  } catch (error) {
    logError(`Database connection failed: ${error.message}`);
    process.exit(1);
  }

  // Get total book count
  const totalBooks = await getBookCount();
  logInfo(`Total books in database: ${totalBooks}`);

  // Check the specific books mentioned in the error
  const bookIds = [57, 87, 2];
  
  log('\n📋 Checking Specific Books:', 'bright');
  for (const id of bookIds) {
    await checkBook(id);
  }

  // Show recent books to get context
  log('\n📋 Recent Books in Database:', 'bright');
  const recentBooks = await getRecentBooks(5);
  recentBooks.forEach(book => {
    log(`   ID ${book.id}: ${book.title} (${book.status}) - Created: ${book.created_at}`, 'blue');
  });

  // Show books with similar IDs to see the pattern
  log('\n📋 Books with Similar IDs:', 'bright');
  const similarIds = [50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60];
  for (const id of similarIds) {
    const result = await pool.query('SELECT id, title, status FROM books WHERE id = $1', [id]);
    if (result.rows.length > 0) {
      const book = result.rows[0];
      log(`   ID ${book.id}: ${book.title} (${book.status})`, 'blue');
    }
  }

  await pool.end();
  log('\n✅ Book check completed', 'green');
}

main().catch(error => {
  logError(`Script failed: ${error.message}`);
  process.exit(1);
}); 