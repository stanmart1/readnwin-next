#!/usr/bin/env node

/**
 * DISABLED: Process Uploaded Books Script
 * 
 * This script has been disabled to preserve original book content without processing.
 * Books are now stored in their original format and displayed directly in the e-reader.
 * 
 * DISABLED FEATURES:
 * - EPUB content processing and extraction
 * - Database content updates
 * - Reading metadata generation
 * - Table of contents creation
 * 
 * REASON: To preserve original EPUB structure and content without any conversion or processing.
 */

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const { query } = require('../utils/database');

class BookContentProcessor {
  constructor() {
    this.bookFilesDir = process.env.NODE_ENV === 'production' 
      ? '/app/book-files' 
      : path.join(process.cwd(), 'book-files');
    
    this.epubDir = path.join(this.bookFilesDir, 'epub');
    this.processedDir = path.join(this.bookFilesDir, 'processed');
  }

  /**
   * DISABLED: Main processing function
   * 
   * This function has been disabled to preserve original book content.
   * No content processing will occur.
   */
  async processAllBooks() {
    console.log('📚 Book content processing DISABLED');
    console.log('📖 Books will be stored in original format without processing');
    console.log('📖 E-reader will display original content directly');
    console.log('✅ No content processing will occur');
    return;
    
    // DISABLED: Original processing code
    /*
    try {
      console.log('📚 Starting book content processing...');
      console.log(`📁 Book files directory: ${this.bookFilesDir}`);
      
      // Get all books from database that need content processing
      const books = await this.getBooksNeedingContent();
      console.log(`📖 Found ${books.length} books needing content processing`);
      
      if (books.length === 0) {
        console.log('✅ All books already have content processed');
        return;
      }
      
      let processedCount = 0;
      let errorCount = 0;
      
      for (const book of books) {
        try {
          console.log(`\n📖 Processing book: ${book.title} (ID: ${book.id})`);
          
          if (book.ebook_file_url && book.format === 'ebook') {
            await this.processEbook(book);
            processedCount++;
          } else {
            console.log(`   ⚠️ Skipping book ${book.title} - no ebook file or not ebook format`);
          }
        } catch (error) {
          console.error(`   ❌ Error processing book ${book.title}:`, error.message);
          errorCount++;
        }
      }
      
      console.log(`\n🎉 Processing complete!`);
      console.log(`   ✅ Successfully processed: ${processedCount} books`);
      console.log(`   ❌ Errors: ${errorCount} books`);
      
    } catch (error) {
      console.error('❌ Fatal error in book processing:', error);
      process.exit(1);
    }
    */
  }

  /**
   * Get books that need content processing
   */
  async getBooksNeedingContent() {
    try {
      const result = await query(`
        SELECT id, title, author_id, ebook_file_url, format, content
        FROM books 
        WHERE format = 'ebook' 
          AND ebook_file_url IS NOT NULL 
          AND ebook_file_url != ''
          AND (content IS NULL OR content = '')
          AND status = 'published'
        ORDER BY created_at DESC
      `);
      
      return result.rows;
    } catch (error) {
      console.error('❌ Database query error:', error);
      throw error;
    }
  }

  /**
   * Process an individual ebook
   */
  async processEbook(book) {
    try {
      console.log(`   📁 Processing ebook: ${book.ebook_file_url}`);
      
      // Determine file path
      let filePath;
      if (book.ebook_file_url.startsWith('/book-files/')) {
        const relativePath = book.ebook_file_url.replace('/book-files/', '');
        filePath = path.join(this.bookFilesDir, relativePath);
      } else {
        filePath = book.ebook_file_url;
      }
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.log(`   ⚠️ File not found: ${filePath}`);
        return;
      }
      
      // Process based on file type
      const fileExt = path.extname(filePath).toLowerCase();
      
      if (fileExt === '.epub') {
        await this.processEPUB(book, filePath);
      } else if (fileExt === '.pdf') {
        await this.processPDF(book, filePath);
      } else {
        console.log(`   ⚠️ Unsupported file type: ${fileExt}`);
      }
      
    } catch (error) {
      console.error(`   ❌ Error processing ebook for book ${book.title}:`, error.message);
      throw error;
    }
  }

  /**
   * Process EPUB file
   */
  async processEPUB(book, filePath) {
    try {
      console.log(`   📖 Processing EPUB: ${path.basename(filePath)}`);
      
      // Extract content using unzip command
      const content = await this.extractEPUBContent(filePath);
      
      if (!content || content.trim().length === 0) {
        console.log(`   ⚠️ No content extracted from EPUB`);
        return;
      }
      
      // Process the extracted content
      const processedContent = await this.processContent(content);
      
      // Update database with processed content
      await this.updateBookContent(book.id, processedContent);
      
      console.log(`   ✅ EPUB processed successfully: ${processedContent.wordCount} words`);
      
    } catch (error) {
      console.error(`   ❌ EPUB processing error:`, error.message);
      throw error;
    }
  }

  /**
   * Extract content from EPUB file
   */
  async extractEPUBContent(filePath) {
    try {
      // List content files in EPUB
      const fileList = execSync(`unzip -l "${filePath}" | grep -E "\.(xml|html|htm)"`, { 
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      const contentFiles = fileList
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
          const match = line.match(/\s+(\S+\.(xml|html|htm))$/);
          return match ? match[1] : null;
        })
        .filter(Boolean)
        .filter(file => !file.includes('META-INF') && !file.includes('mimetype'));
      
      console.log(`   📄 Found ${contentFiles.length} content files`);
      
      let allContent = '';
      
      for (const contentFile of contentFiles) {
        try {
          const command = `unzip -p "${filePath}" "${contentFile}" 2>/dev/null`;
          const fileContent = execSync(command, { encoding: 'utf8' });
          
          if (fileContent && fileContent.length > 0) {
            // Clean XML/HTML and extract text
            const cleanContent = this.cleanXMLContent(fileContent);
            allContent += cleanContent + ' ';
          }
        } catch (extractError) {
          console.log(`   ⚠️ Could not extract ${contentFile}`);
        }
      }
      
      return allContent.trim();
      
    } catch (error) {
      console.error(`   ❌ EPUB extraction error:`, error.message);
      throw error;
    }
  }

  /**
   * Clean XML/HTML content and extract text
   */
  cleanXMLContent(xmlContent) {
    return xmlContent
      // Remove XML tags but preserve line breaks
      .replace(/<[^>]*>/g, ' ')
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove special characters that might cause issues
      .replace(/[^\w\s.,!?;:'"()-]/g, ' ')
      .trim();
  }

  /**
   * Process PDF file
   */
  async processPDF(book, filePath) {
    try {
      console.log(`   📖 Processing PDF: ${path.basename(filePath)}`);
      
      // For now, just note that PDF processing is not implemented
      // This would require additional libraries like pdf-parse
      console.log(`   ⚠️ PDF processing not yet implemented`);
      
    } catch (error) {
      console.error(`   ❌ PDF processing error:`, error.message);
      throw error;
    }
  }

  /**
   * Process extracted content and generate metadata
   */
  async processContent(rawContent) {
    try {
      // Calculate word count
      const wordCount = rawContent.split(/\s+/).filter(word => word.length > 0).length;
      
      // Calculate estimated reading time (200 words per minute)
      const estimatedReadingTime = Math.ceil(wordCount / 200);
      
      // Generate table of contents (simple chapter detection)
      const tableOfContents = this.generateTableOfContents(rawContent);
      
      // Create markdown version for better formatting
      const markdownContent = this.convertToMarkdown(rawContent);
      
      return {
        content: markdownContent,
        plainText: rawContent,
        wordCount,
        estimatedReadingTime,
        tableOfContents,
        processedAt: new Date().toISOString()
      };
      
    } catch (error) {
      console.error(`   ❌ Content processing error:`, error.message);
      throw error;
    }
  }

  /**
   * Generate simple table of contents
   */
  generateTableOfContents(content) {
    const chapters = [];
    const lines = content.split('\n');
    
    let chapterIndex = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Look for chapter indicators
      if (line.toLowerCase().includes('chapter') || 
          line.toLowerCase().includes('part') ||
          line.toLowerCase().includes('section')) {
        
        chapters.push({
          id: `chapter-${chapterIndex}`,
          title: line,
          level: 1,
          position: i * 100, // Approximate position
          children: []
        });
        
        chapterIndex++;
      }
    }
    
    return chapters;
  }

  /**
   * Convert plain text to markdown
   */
  convertToMarkdown(content) {
    return content
      // Add paragraph breaks
      .replace(/\n\s*\n/g, '\n\n')
      // Convert chapter indicators to headers
      .replace(/^(chapter\s+\d+)/gim, '# $1')
      .replace(/^(part\s+\d+)/gim, '## $1')
      .replace(/^(section\s+\d+)/gim, '### $1')
      // Clean up excessive whitespace
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  /**
   * Update book content in database
   */
  async updateBookContent(bookId, processedContent) {
    try {
      const result = await query(`
        UPDATE books 
        SET 
          content = $1,
          word_count = $2,
          estimated_reading_time = $3,
          content_metadata = $4,
          updated_at = NOW()
        WHERE id = $5
        RETURNING id, title
      `, [
        processedContent.content,
        processedContent.wordCount,
        processedContent.estimatedReadingTime,
        JSON.stringify({
          tableOfContents: processedContent.tableOfContents,
          processedAt: processedContent.processedAt,
          contentType: 'markdown'
        }),
        bookId
      ]);
      
      if (result.rows.length > 0) {
        console.log(`   💾 Database updated for book: ${result.rows[0].title}`);
      } else {
        console.log(`   ⚠️ No database update for book ID: ${bookId}`);
      }
      
    } catch (error) {
      console.error(`   ❌ Database update error:`, error.message);
      throw error;
    }
  }
}

// Main execution
async function main() {
  try {
    const processor = new BookContentProcessor();
    await processor.processAllBooks();
    
    console.log('\n🎉 Book content processing completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Book content processing failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = BookContentProcessor; 