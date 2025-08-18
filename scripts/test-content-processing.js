#!/usr/bin/env node

/**
 * Test Content Processing Script
 * 
 * This script tests the book content processing functionality
 * to ensure uploaded books can be properly accessed by the eReader.
 */

const BookContentProcessor = require('./process-uploaded-books.js');

async function testContentProcessing() {
  try {
    console.log('🧪 Testing Book Content Processing...\n');
    
    const processor = new BookContentProcessor();
    
    // Test 1: Check if processor can find books needing content
    console.log('📖 Test 1: Finding books needing content processing...');
    const booksNeedingContent = await processor.getBooksNeedingContent();
    console.log(`   Found ${booksNeedingContent.length} books needing content processing`);
    
    if (booksNeedingContent.length > 0) {
      console.log('   Books found:');
      booksNeedingContent.forEach(book => {
        console.log(`     - ${book.title} (ID: ${book.id}, Format: ${book.format})`);
      });
      
      // Test 2: Process the first book
      console.log('\n📖 Test 2: Processing first book...');
      const firstBook = booksNeedingContent[0];
      await processor.processEbook(firstBook);
      console.log(`   ✅ Successfully processed: ${firstBook.title}`);
      
    } else {
      console.log('   ✅ All books already have content processed');
    }
    
    // Test 3: Verify content was added to database
    console.log('\n📖 Test 3: Verifying content in database...');
    const { query } = require('../utils/database');
    const result = await query(`
      SELECT id, title, content, word_count, estimated_reading_time
      FROM books 
      WHERE content IS NOT NULL AND content != ''
      ORDER BY updated_at DESC
      LIMIT 5
    `);
    
    console.log(`   Found ${result.rows.length} books with content:`);
    result.rows.forEach(book => {
      const hasContent = book.content && book.content.length > 0;
      const wordCount = book.word_count || 0;
      const readingTime = book.estimated_reading_time || 0;
      
      console.log(`     - ${book.title}: ${hasContent ? '✅' : '❌'} content, ${wordCount} words, ${readingTime} min`);
    });
    
    console.log('\n🎉 Content processing test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Content processing test failed:', error);
    process.exit(1);
  }
}

// Run test if called directly
if (require.main === module) {
  testContentProcessing();
}

module.exports = testContentProcessing; 