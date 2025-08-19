import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, extname, basename } from 'path';
import { createHash } from 'crypto';
import { query } from './database';
// Dynamic import to avoid server.js execution during build
let epub: any = null;

// Only try to load epubjs if we're in a browser environment
if (typeof window !== 'undefined') {
  // Client-side only
  try {
    epub = require('epubjs');
  } catch (error) {
    console.warn('epubjs not available on client:', error);
  }
} else {
  // Server-side: don't load epubjs at all
  console.log('📖 Server-side: EPUBjs not loaded (not needed for server operations)');
}

export interface BookMetadata {
  title: string;
  author: string;
  language: string;
  publisher?: string;
  publicationDate?: string;
  isbn?: string;
  description?: string;
  wordCount: number;
  estimatedReadingTime: number; // in minutes
  pageCount: number;
  chapterCount: number;
  tableOfContents: ChapterInfo[];
}

export interface ChapterInfo {
  id: string;
  title: string;
  level: number;
  href?: string;
  wordCount: number;
  estimatedReadingTime: number;
  pageStart?: number;
  pageEnd?: number;
}

export interface ParsedBookContent {
  metadata: BookMetadata;
  chapters: ChapterContent[];
  contentStructure: {
    toc: ChapterInfo[];
    spine: string[];
    manifest: Record<string, any>;
  };
  contentFiles: {
    originalFile: string;
    processedFiles: string[];
    extractedContent: string[];
  };
}

export interface ChapterContent {
  id: string;
  title: string;
  content: string;
  wordCount: number;
  estimatedReadingTime: number;
  metadata: Record<string, any>;
}

export class EnhancedBookParser {
  private bookFilesDir: string;
  private processedDir: string;
  private tempDir: string;

  constructor() {
    this.bookFilesDir = process.env.NODE_ENV === 'production' 
      ? '/uploads/books' 
      : join(process.cwd(), 'uploads', 'books');
    
    this.processedDir = join(this.bookFilesDir, 'processed');
    this.tempDir = join(this.bookFilesDir, 'temp');
    
    // Only create directories at runtime, not during build
    if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
      // Ensure directories exist
      [this.bookFilesDir, this.processedDir, this.tempDir].forEach(dir => {
        if (!existsSync(dir)) {
          mkdirSync(dir, { recursive: true });
        }
      });
    }
  }

  /**
   * Parse a book file and extract all metadata and content
   */
  async parseBook(bookId: number, filePath: string, fileFormat: 'epub' | 'html'): Promise<ParsedBookContent> {
    try {
      console.log(`📖 Starting book parsing for book ${bookId}: ${filePath}`);
      
      if (!existsSync(filePath)) {
        throw new Error(`Book file not found: ${filePath}`);
      }

      let parsedContent: ParsedBookContent;

      if (fileFormat === 'epub') {
        parsedContent = await this.parseEPUB(filePath);
      } else if (fileFormat === 'html') {
        parsedContent = await this.parseHTML(filePath);
      } else {
        throw new Error(`Unsupported file format: ${fileFormat}`);
      }

      // Store parsed content securely
      await this.storeParsedContent(bookId, parsedContent, fileFormat);

      console.log(`✅ Book parsing completed for book ${bookId}`);
      return parsedContent;

    } catch (error) {
      console.error(`❌ Error parsing book ${bookId}:`, error);
      throw error;
    }
  }

  /**
   * Parse EPUB file with full metadata extraction
   */
  private async parseEPUB(filePath: string): Promise<ParsedBookContent> {
    try {
      console.log(`📦 Parsing EPUB file: ${filePath}`);
      
      // Check if epubjs is available
      if (!epub) {
        throw new Error('epubjs is not available for EPUB parsing');
      }
      
      // Use epubjs to parse the EPUB file
      const book = new epub.Book(filePath);
      await book.open();

      // Extract metadata
      const metadata = await book.getMetadata();
      const spine = await book.getSpine();
      const toc = await book.getToc();

      // Read all content files in spine order
      const chapters: ChapterContent[] = [];
      let totalWordCount = 0;

      for (const item of spine.items) {
        try {
          const content = await book.getChapter(item.id);
          if (content) {
            const chapterContent = this.processChapterContent(content, item.id, item.title || `Chapter ${chapters.length + 1}`);
            chapters.push(chapterContent);
            totalWordCount += chapterContent.wordCount;
          }
        } catch (error) {
          console.warn(`⚠️ Failed to parse chapter ${item.id}:`, error);
        }
      }

      // Calculate metadata
      const estimatedReadingTime = Math.ceil(totalWordCount / 200); // 200 words per minute
      const pageCount = Math.ceil(totalWordCount / 250); // 250 words per page

      const bookMetadata: BookMetadata = {
        title: metadata.title || 'Untitled',
        author: metadata.creator || 'Unknown Author',
        language: metadata.language || 'en',
        publisher: metadata.publisher,
        publicationDate: metadata.date,
        isbn: metadata.identifier,
        description: metadata.description,
        wordCount: totalWordCount,
        estimatedReadingTime,
        pageCount,
        chapterCount: chapters.length,
        tableOfContents: toc
      };

      return {
        metadata: bookMetadata,
        chapters,
        contentStructure: {
          toc,
          spine: spine.items.map((item: any) => item.id),
          manifest: spine.items.reduce((acc: Record<string, any>, item: any) => {
            acc[item.id] = { href: item.href, title: item.title };
            return acc;
          }, {} as Record<string, any>)
        },
        contentFiles: {
          originalFile: filePath,
          processedFiles: [],
          extractedContent: chapters.map(ch => ch.content)
        }
      };

    } catch (error) {
      console.error(`❌ Error parsing EPUB file:`, error);
      throw new Error(`Failed to parse EPUB file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse HTML file with metadata extraction
   */
  private async parseHTML(filePath: string): Promise<ParsedBookContent> {
    try {
      console.log(`📄 Parsing HTML file: ${filePath}`);
      
      const content = readFileSync(filePath, 'utf-8');
      const fileHash = createHash('sha256').update(content).digest('hex');
      
      // Extract metadata from HTML head
      const metadata = this.extractHTMLMetadata(content);
      
      // Parse chapters from heading tags
      const chapters = this.parseHTMLChapters(content);
      
      // Calculate total word count
      const totalWordCount = chapters.reduce((sum, chapter) => sum + chapter.wordCount, 0);
      
      // Calculate metadata
      const estimatedReadingTime = Math.ceil(totalWordCount / 200); // 200 words per minute
      const pageCount = Math.ceil(totalWordCount / 250); // 250 words per page
      
      const bookMetadata: BookMetadata = {
        title: metadata.title || 'Untitled HTML Book',
        author: metadata.author || 'Unknown Author',
        language: metadata.language || 'en',
        publisher: metadata.publisher,
        publicationDate: metadata.date,
        isbn: metadata.identifier,
        description: metadata.description,
        wordCount: totalWordCount,
        estimatedReadingTime,
        pageCount,
        chapterCount: chapters.length,
        tableOfContents: chapters.map(ch => ({
          id: ch.id,
          title: ch.title,
          level: 1,
          href: `#${ch.id}`,
          wordCount: ch.wordCount,
          estimatedReadingTime: ch.estimatedReadingTime
        }))
      };
      
      return {
        metadata: bookMetadata,
        chapters,
        contentStructure: {
          toc: bookMetadata.tableOfContents,
          spine: chapters.map(ch => ch.id),
          manifest: chapters.reduce((acc, ch) => {
            acc[ch.id] = { href: `#${ch.id}`, title: ch.title };
            return acc;
          }, {} as Record<string, any>)
        },
        contentFiles: {
          originalFile: filePath,
          processedFiles: [],
          extractedContent: chapters.map(ch => ch.content)
        }
      };
      
    } catch (error) {
      console.error(`❌ Error parsing HTML file:`, error);
      throw new Error(`Failed to parse HTML file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process chapter content and extract metadata
   */
  private processChapterContent(content: string, chapterId: string, chapterTitle: string): ChapterContent {
    // Clean HTML content while preserving structure
    const cleanContent = this.cleanHTMLContent(content);
    
    // Calculate word count
    const wordCount = this.calculateWordCount(cleanContent);
    
    // Calculate reading time (200 words per minute)
    const readingTime = Math.ceil(wordCount / 200);
    
    return {
      id: chapterId,
      title: chapterTitle,
      content: cleanContent,
      wordCount,
      estimatedReadingTime: readingTime,
      metadata: {
        chapterId,
        wordCount,
        readingTime
      }
    };
  }

  /**
   * Clean HTML content while preserving important structural elements
   */
  private cleanHTMLContent(html: string): string {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      // Preserve important structural elements
      .replace(/<h([1-6])[^>]*>/gi, '<h$1>')
      .replace(/<\/h([1-6])>/gi, '</h$1>')
      .replace(/<p[^>]*>/gi, '<p>')
      .replace(/<\/p>/gi, '</p>')
      .replace(/<br\s*\/?>/gi, '<br>')
      .replace(/<hr\s*\/?>/gi, '<hr>')
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .trim();
  }

  /**
   * Calculate word count from HTML content
   */
  private calculateWordCount(content: string): number {
    // Remove HTML tags and count words
    const textContent = content.replace(/<[^>]*>/g, ' ');
    const words = textContent.trim().split(/\s+/);
    return words.filter(word => word.length > 0).length;
  }

  /**
   * Extract metadata from HTML content
   */
  private extractHTMLMetadata(htmlContent: string) {
    const metadata: any = {};

    // Extract title
    const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) metadata.title = titleMatch[1].trim();

    // Extract meta tags
    const metaMatches = htmlContent.matchAll(/<meta[^>]*name\s*=\s*["']([^"']+)["'][^>]*content\s*=\s*["']([^"']+)["'][^>]*\/?>/gi);
    for (const match of metaMatches) {
      const [, name, content] = match;
      metadata[name.toLowerCase()] = content.trim();
    }

    // Extract author from various possible locations
    const authorMatch = htmlContent.match(/<meta[^>]*name\s*=\s*["']author["'][^>]*content\s*=\s*["']([^"']+)["'][^>]*\/?>/i) ||
                       htmlContent.match(/<meta[^>]*property\s*=\s*["']article:author["'][^>]*content\s*=\s*["']([^"']+)["'][^>]*\/?>/i) ||
                       htmlContent.match(/<span[^>]*class\s*=\s*["']author["'][^>]*>([^<]+)<\/span>/i);
    
    if (authorMatch) metadata.author = authorMatch[1].trim();

    return metadata;
  }

  /**
   * Parse HTML content into chapters
   */
  private parseHTMLChapters(htmlContent: string): ChapterContent[] {
    const chapters: ChapterContent[] = [];
    
    // Split content by headings
    const headingMatches = htmlContent.matchAll(/<h([1-6])[^>]*>([^<]+)<\/h\1>/gi);
    const headings: Array<{level: number, title: string, index: number}> = [];
    
    for (const match of headingMatches) {
      headings.push({
        level: parseInt(match[1]),
        title: match[2].trim(),
        index: match.index!
      });
    }

    // Create chapters from headings
    for (let i = 0; i < headings.length; i++) {
      const heading = headings[i];
      const nextHeading = headings[i + 1];
      
      const startIndex = heading.index + heading.title.length;
      const endIndex = nextHeading ? nextHeading.index : htmlContent.length;
      
      const chapterContent = htmlContent.substring(startIndex, endIndex);
      const cleanContent = this.cleanHTMLContent(chapterContent);
      
      const wordCount = this.calculateWordCount(cleanContent);
      const estimatedReadingTime = Math.ceil(wordCount / 200);

      chapters.push({
        id: `chapter-${i + 1}`,
        title: heading.title,
        content: cleanContent,
        wordCount,
        estimatedReadingTime,
        metadata: {
          level: heading.level,
          originalLength: chapterContent.length,
          cleanLength: cleanContent.length
        }
      });
    }

    // If no headings found, treat entire content as one chapter
    if (chapters.length === 0) {
      const cleanContent = this.cleanHTMLContent(htmlContent);
      const wordCount = this.calculateWordCount(cleanContent);
      const estimatedReadingTime = Math.ceil(wordCount / 200);

      chapters.push({
        id: 'chapter-1',
        title: 'Content',
        content: cleanContent,
        wordCount,
        estimatedReadingTime,
        metadata: {
          level: 1,
          originalLength: htmlContent.length,
          cleanLength: cleanContent.length
        }
      });
    }

    return chapters;
  }

  /**
   * Store parsed content securely in database and filesystem
   */
  private async storeParsedContent(bookId: number, parsedContent: ParsedBookContent, contentType: string) {
    try {
      // Store content structure in database
      await query(`
        INSERT INTO book_content (book_id, content_type, content_structure, content_files, word_count, estimated_reading_time, page_count, chapter_count, language)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (book_id) DO UPDATE SET
          content_type = EXCLUDED.content_type,
          content_structure = EXCLUDED.content_structure,
          content_files = EXCLUDED.content_files,
          word_count = EXCLUDED.word_count,
          estimated_reading_time = EXCLUDED.estimated_reading_time,
          page_count = EXCLUDED.page_count,
          chapter_count = EXCLUDED.chapter_count,
          language = EXCLUDED.language,
          updated_at = CURRENT_TIMESTAMP
      `, [
        bookId,
        contentType,
        JSON.stringify(parsedContent.contentStructure),
        JSON.stringify(parsedContent.contentFiles),
        parsedContent.metadata.wordCount,
        parsedContent.metadata.estimatedReadingTime,
        parsedContent.metadata.pageCount,
        parsedContent.metadata.chapterCount,
        parsedContent.metadata.language
      ]);

      // Store individual chapters
      for (const chapter of parsedContent.chapters) {
        await query(`
          INSERT INTO book_chapters (book_id, chapter_number, chapter_title, chapter_content, word_count, reading_time, chapter_metadata)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (book_id, chapter_number) DO UPDATE SET
            chapter_title = EXCLUDED.chapter_title,
            chapter_content = EXCLUDED.chapter_content,
            word_count = EXCLUDED.word_count,
            reading_time = EXCLUDED.reading_time,
            chapter_metadata = EXCLUDED.chapter_metadata
        `, [
          bookId,
          parseInt(chapter.id.replace(/\D/g, '')) || 1,
          chapter.title,
          chapter.content,
          chapter.wordCount,
          chapter.estimatedReadingTime,
          JSON.stringify(chapter.metadata)
        ]);
      }

      // Update book metadata
      await query(`
        UPDATE books 
        SET 
          parsing_status = 'completed',
          metadata_extracted_at = CURRENT_TIMESTAMP,
          file_size = $2,
          file_hash = $3
        WHERE id = $1
      `, [bookId, 0, 'hash-placeholder']); // File size and hash will be updated by file upload service

      console.log(`✅ Parsed content stored for book ${bookId}`);

    } catch (error) {
      console.error(`❌ Error storing parsed content for book ${bookId}:`, error);
      throw error;
    }
  }
}
