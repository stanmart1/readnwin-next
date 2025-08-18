require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: false
});

async function checkBooksSync() {
  const client = await pool.connect();
  try {
    console.log('📚 Checking Books Synchronization: Frontend ↔ Database');
    console.log('=' .repeat(60));
    
    // Check database books
    console.log('\n📋 Database Books Analysis');
    console.log('-'.repeat(40));
    
    const totalBooks = await client.query('SELECT COUNT(*) as total FROM books');
    const publishedBooks = await client.query('SELECT COUNT(*) as total FROM books WHERE status = $1', ['published']);
    const featuredBooks = await client.query('SELECT COUNT(*) as total FROM books WHERE is_featured = true');
    const bestsellers = await client.query('SELECT COUNT(*) as total FROM books WHERE is_bestseller = true');
    const newReleases = await client.query('SELECT COUNT(*) as total FROM books WHERE is_new_release = true');
    const draftBooks = await client.query('SELECT COUNT(*) as total FROM books WHERE status = $1', ['draft']);
    const archivedBooks = await client.query('SELECT COUNT(*) as total FROM books WHERE status = $1', ['archived']);
    
    console.log(`✅ Total books in database: ${totalBooks.rows[0].total}`);
    console.log(`✅ Published books: ${publishedBooks.rows[0].total}`);
    console.log(`✅ Featured books: ${featuredBooks.rows[0].total}`);
    console.log(`✅ Bestsellers: ${bestsellers.rows[0].total}`);
    console.log(`✅ New releases: ${newReleases.rows[0].total}`);
    console.log(`📝 Draft books: ${draftBooks.rows[0].total}`);
    console.log(`🗄️  Archived books: ${archivedBooks.rows[0].total}`);
    
    // Get sample books from database
    console.log('\n📋 Sample Books from Database');
    console.log('-'.repeat(40));
    
    const sampleBooks = await client.query(`
      SELECT 
        b.id,
        b.title,
        b.author_id,
        a.name as author_name,
        b.category_id,
        c.name as category_name,
        b.price,
        b.status,
        b.is_featured,
        b.is_bestseller,
        b.is_new_release,
        b.cover_image_url
      FROM books b
      LEFT JOIN authors a ON b.author_id = a.id
      LEFT JOIN categories c ON b.category_id = c.id
      ORDER BY b.created_at DESC
      LIMIT 5
    `);
    
    console.log('Sample books from database:');
    sampleBooks.rows.forEach((book, index) => {
      console.log(`  ${index + 1}. "${book.title}" by ${book.author_name || 'Unknown'} (${book.category_name || 'Unknown'}) - $${book.price} [${book.status}]`);
    });
    
    // Check API endpoints
    console.log('\n📋 Frontend API Testing');
    console.log('-'.repeat(40));
    
    try {
      // Test general books API
      const response = await fetch('http://localhost:3000/api/books?limit=5');
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Books API working - Retrieved ${data.books.length} books`);
        console.log('Sample books from API:');
        data.books.forEach((book, index) => {
          console.log(`  ${index + 1}. "${book.title}" by ${book.author_name || 'Unknown'} (${book.category_name || 'Unknown'}) - $${book.price} [${book.status}]`);
        });
      } else {
        console.log('❌ Books API failed');
      }
    } catch (error) {
      console.log('❌ Books API error:', error.message);
    }
    
    // Test featured books API
    try {
      const featuredResponse = await fetch('http://localhost:3000/api/books?is_featured=true&limit=5');
      if (featuredResponse.ok) {
        const featuredData = await featuredResponse.json();
        console.log(`✅ Featured books API working - Retrieved ${featuredData.books.length} featured books`);
      } else {
        console.log('❌ Featured books API failed');
      }
    } catch (error) {
      console.log('❌ Featured books API error:', error.message);
    }
    
    // Test new releases API
    try {
      const newReleasesResponse = await fetch('http://localhost:3000/api/books?is_new_release=true&limit=5');
      if (newReleasesResponse.ok) {
        const newReleasesData = await newReleasesResponse.json();
        console.log(`✅ New releases API working - Retrieved ${newReleasesData.books.length} new releases`);
      } else {
        console.log('❌ New releases API failed');
      }
    } catch (error) {
      console.log('❌ New releases API error:', error.message);
    }
    
    // Check for missing data
    console.log('\n📋 Data Integrity Check');
    console.log('-'.repeat(40));
    
    const booksWithoutAuthors = await client.query('SELECT COUNT(*) as total FROM books b LEFT JOIN authors a ON b.author_id = a.id WHERE a.id IS NULL');
    const booksWithoutCategories = await client.query('SELECT COUNT(*) as total FROM books b LEFT JOIN categories c ON b.category_id = c.id WHERE c.id IS NULL');
    const booksWithoutCoverImages = await client.query('SELECT COUNT(*) as total FROM books WHERE cover_image_url IS NULL OR cover_image_url = \'\'');
    const booksWithoutPrices = await client.query('SELECT COUNT(*) as total FROM books WHERE price IS NULL OR price <= 0');
    
    console.log(`⚠️  Books without authors: ${booksWithoutAuthors.rows[0].total}`);
    console.log(`⚠️  Books without categories: ${booksWithoutCategories.rows[0].total}`);
    console.log(`⚠️  Books without cover images: ${booksWithoutCoverImages.rows[0].total}`);
    console.log(`⚠️  Books without valid prices: ${booksWithoutPrices.rows[0].total}`);
    
    // Check categories and authors
    console.log('\n📋 Related Data Check');
    console.log('-'.repeat(40));
    
    const categories = await client.query('SELECT COUNT(*) as total FROM categories');
    const authors = await client.query('SELECT COUNT(*) as total FROM authors');
    
    console.log(`✅ Categories in database: ${categories.rows[0].total}`);
    console.log(`✅ Authors in database: ${authors.rows[0].total}`);
    
    // Summary
    console.log('\n📝 Summary');
    console.log('-'.repeat(40));
    
    const totalBooksCount = parseInt(totalBooks.rows[0].total);
    const publishedBooksCount = parseInt(publishedBooks.rows[0].total);
    const featuredBooksCount = parseInt(featuredBooks.rows[0].total);
    const bestsellersCount = parseInt(bestsellers.rows[0].total);
    const newReleasesCount = parseInt(newReleases.rows[0].total);
    
    console.log(`📚 Total books available: ${totalBooksCount}`);
    console.log(`🌐 Books visible on frontend: ${publishedBooksCount}`);
    console.log(`⭐ Featured books: ${featuredBooksCount}`);
    console.log(`🏆 Bestsellers: ${bestsellersCount}`);
    console.log(`🆕 New releases: ${newReleasesCount}`);
    
    if (publishedBooksCount > 0) {
      console.log('✅ Frontend has books to display');
    } else {
      console.log('❌ No published books available for frontend');
    }
    
    if (totalBooksCount === publishedBooksCount) {
      console.log('✅ All books are published and visible');
    } else {
      console.log(`📝 ${totalBooksCount - publishedBooksCount} books are not published (draft/archived)`);
    }
    
  } finally {
    client.release();
    await pool.end();
  }
}

checkBooksSync().catch(console.error); 