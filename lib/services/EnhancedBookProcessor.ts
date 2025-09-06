import fs from 'fs/promises';
import path from 'path';
import JSZip from 'jszip';
import { DOMParser } from '@xmldom/xmldom';
import { query, transaction } from '@/utils/database';
import { sanitizePath, sanitizeInput } from '@/lib/security';
import logger from '@/lib/logger';

export interface ProcessedBookData {
  id: string;
  title: string;
  author: string;
  format: 'epub' | 'html';
  metadata: {
    wordCount: number;
    estimatedReadingTime: number;
    pages: number;
    language?: string;
    publisher?: string;
    isbn?: string;
  };
  chapters: Array<{
    id: string;
    chapter_number: number;
    chapter_title: string;
    content_html: string;
    reading_time_minutes: number;
  }>;
  tableOfContents: Array<{
    id: string;
    title: string;
    chapter_number: number;
  }>;
}

export class EnhancedBookProcessor {
  private static readonly STORAGE_BASE = path.join(process.cwd(), 'storage', 'books');
  private static readonly WORDS_PER_MINUTE = 200;

  /**
   * Process uploaded ebook file and prepare it for the e-reader
   */
  static async processUploadedBook(
    bookId: number,
    filePath: string,
    originalFileName: string
  ): Promise<{ success: boolean; data?: ProcessedBookData; error?: string }> {
    try {
      logger.info(`Processing book ${bookId}: ${originalFileName}`);

      // Ensure storage directory exists
      const bookStorageDir = path.join(this.STORAGE_BASE, bookId.toString());
      await fs.mkdir(bookStorageDir, { recursive: true });

      // Determine file format
      const fileExtension = path.extname(originalFileName).toLowerCase();
      
      let processedData: ProcessedBookData;
      
      if (fileExtension === '.epub') {
        processedData = await this.processEpubFile(bookId, filePath, bookStorageDir);
      } else if (fileExtension === '.html' || fileExtension === '.htm') {
        processedData = await this.processHtmlFile(bookId, filePath, bookStorageDir);
      } else {
        throw new Error(`Unsupported file format: ${fileExtension}`);
      }

      // Store processed data in database
      await this.storeProcessedBookData(bookId, processedData);

      logger.info(`Successfully processed book ${bookId}`);
      return { success: true, data: processedData };

    } catch (error) {
      logger.error(`Error processing book ${bookId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown processing error'
      };
    }
  }

  /**
   * Process EPUB file safely
   */
  private static async processEpubFile(
    bookId: number,
    filePath: string,
    storageDir: string
  ): Promise<ProcessedBookData> {
    const epubBuffer = await fs.readFile(filePath);
    const zip = await JSZip.loadAsync(epubBuffer);

    // Extract metadata
    const metadata = await this.extractEpubMetadata(zip);
    
    // Extract chapters
    const chapters = await this.extractEpubChapters(zip, bookId);
    
    // Calculate reading statistics
    const totalWordCount = chapters.reduce((sum, ch) => sum + this.countWords(ch.content_html), 0);
    const estimatedReadingTime = Math.ceil(totalWordCount / this.WORDS_PER_MINUTE);

    // Create table of contents
    const tableOfContents = chapters.map(ch => ({
      id: ch.id,
      title: ch.chapter_title,
      chapter_number: ch.chapter_number
    }));

    return {
      id: bookId.toString(),
      title: metadata.title,
      author: metadata.author,
      format: 'epub',
      metadata: {
        wordCount: totalWordCount,
        estimatedReadingTime,
        pages: Math.ceil(totalWordCount / 250), // Approximate pages
        language: metadata.language,
        publisher: metadata.publisher,
        isbn: metadata.isbn
      },
      chapters,
      tableOfContents
    };
  }

  /**
   * Process HTML file safely
   */
  private static async processHtmlFile(
    bookId: number,
    filePath: string,
    storageDir: string
  ): Promise<ProcessedBookData> {
    const htmlContent = await fs.readFile(filePath, 'utf-8');
    
    // Parse HTML to extract metadata
    const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
    
    // Extract title
    const titleElement = doc.getElementsByTagName('title')[0];
    const title = titleElement?.textContent?.trim() || 'Unknown Title';
    
    // Extract author from meta tags
    let author = 'Unknown Author';
    const metaTags = doc.getElementsByTagName('meta');
    for (let i = 0; i < metaTags.length; i++) {
      const meta = metaTags[i];
      const name = meta.getAttribute('name')?.toLowerCase();
      const content = meta.getAttribute('content');
      if (content && (name === 'author' || name === 'dc.creator')) {
        author = content;
        break;
      }
    }

    // Split content into chapters based on headings
    const chapters = this.extractHtmlChapters(htmlContent, bookId);
    
    // Calculate statistics
    const totalWordCount = chapters.reduce((sum, ch) => sum + this.countWords(ch.content_html), 0);
    const estimatedReadingTime = Math.ceil(totalWordCount / this.WORDS_PER_MINUTE);

    // Create table of contents
    const tableOfContents = chapters.map(ch => ({
      id: ch.id,
      title: ch.chapter_title,
      chapter_number: ch.chapter_number
    }));

    return {
      id: bookId.toString(),
      title,
      author,
      format: 'html',
      metadata: {
        wordCount: totalWordCount,
        estimatedReadingTime,
        pages: Math.ceil(totalWordCount / 250),
        language: 'en'
      },
      chapters,
      tableOfContents
    };
  }

  /**
   * Extract metadata from EPUB
   */
  private static async extractEpubMetadata(zip: JSZip): Promise<{
    title: string;
    author: string;
    language?: string;
    publisher?: string;
    isbn?: string;
  }> {
    try {
      // Find container.xml
      const containerFile = zip.file('META-INF/container.xml');
      if (!containerFile) {
        throw new Error('Invalid EPUB: Missing container.xml');
      }

      const containerXml = await containerFile.async('text');
      const containerDoc = new DOMParser().parseFromString(containerXml, 'text/xml');
      
      // Get OPF file path
      const rootfileElement = containerDoc.getElementsByTagName('rootfile')[0];
      const opfPath = rootfileElement?.getAttribute('full-path');
      
      if (!opfPath) {
        throw new Error('Invalid EPUB: Missing OPF path');
      }

      // Parse OPF file
      const opfFile = zip.file(opfPath);
      if (!opfFile) {
        throw new Error('Invalid EPUB: Missing OPF file');
      }

      const opfXml = await opfFile.async('text');
      const opfDoc = new DOMParser().parseFromString(opfXml, 'text/xml');

      // Extract metadata
      const getMetadataValue = (tagName: string): string | undefined => {
        const elements = opfDoc.getElementsByTagName(`dc:${tagName}`);
        return elements.length > 0 ? elements[0].textContent || undefined : undefined;
      };

      return {
        title: getMetadataValue('title') || 'Unknown Title',
        author: getMetadataValue('creator') || 'Unknown Author',
        language: getMetadataValue('language'),
        publisher: getMetadataValue('publisher'),
        isbn: getMetadataValue('identifier')
      };
    } catch (error) {
      logger.warn('Error extracting EPUB metadata:', error);
      return {
        title: 'Unknown Title',
        author: 'Unknown Author'
      };
    }
  }

  /**
   * Extract chapters from EPUB
   */
  private static async extractEpubChapters(zip: JSZip, bookId: number): Promise<Array<{
    id: string;
    chapter_number: number;
    chapter_title: string;
    content_html: string;
    reading_time_minutes: number;
  }>> {
    try {
      // Find container.xml and get OPF path
      const containerFile = zip.file('META-INF/container.xml');
      if (!containerFile) return [];

      const containerXml = await containerFile.async('text');
      const containerDoc = new DOMParser().parseFromString(containerXml, 'text/xml');
      const rootfileElement = containerDoc.getElementsByTagName('rootfile')[0];
      const opfPath = rootfileElement?.getAttribute('full-path');
      
      if (!opfPath) return [];

      // Parse OPF file
      const opfFile = zip.file(opfPath);
      if (!opfFile) return [];

      const opfXml = await opfFile.async('text');
      const opfDoc = new DOMParser().parseFromString(opfXml, 'text/xml');

      // Get spine items
      const spineItems = opfDoc.getElementsByTagName('itemref');
      const manifestItems = opfDoc.getElementsByTagName('item');
      
      // Create manifest lookup
      const manifestMap = new Map<string, { href: string; mediaType: string }>();
      for (let i = 0; i < manifestItems.length; i++) {
        const item = manifestItems[i];
        const id = item.getAttribute('id');
        const href = item.getAttribute('href');
        const mediaType = item.getAttribute('media-type');
        
        if (id && href) {
          manifestMap.set(id, { href, mediaType: mediaType || '' });
        }
      }

      const chapters: Array<{
        id: string;
        chapter_number: number;
        chapter_title: string;
        content_html: string;
        reading_time_minutes: number;
      }> = [];

      const opfDir = opfPath.split('/').slice(0, -1).join('/');
      
      for (let i = 0; i < spineItems.length; i++) {
        const spineItem = spineItems[i];
        const idref = spineItem.getAttribute('idref');
        
        if (idref && manifestMap.has(idref)) {
          const manifestItem = manifestMap.get(idref)!;
          
          if (manifestItem.mediaType === 'application/xhtml+xml') {
            const chapterPath = opfDir ? `${opfDir}/${manifestItem.href}` : manifestItem.href;
            const chapterFile = zip.file(chapterPath);
            
            if (chapterFile) {
              const chapterContent = await chapterFile.async('text');
              
              // Extract title from content
              const titleMatch = chapterContent.match(/<title>([^<]+)<\/title>/i) || 
                                chapterContent.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/i);
              const title = titleMatch?.[1]?.trim() || `Chapter ${i + 1}`;
              
              // Clean content for e-reader
              const cleanContent = this.cleanHtmlContent(chapterContent);
              const wordCount = this.countWords(cleanContent);
              
              chapters.push({
                id: `chapter-${i + 1}`,
                chapter_number: i + 1,
                chapter_title: title,
                content_html: cleanContent,
                reading_time_minutes: Math.ceil(wordCount / this.WORDS_PER_MINUTE)
              });
            }
          }
        }
      }

      return chapters.length > 0 ? chapters : [{
        id: 'chapter-1',
        chapter_number: 1,
        chapter_title: 'Chapter 1',
        content_html: '<p>No content available</p>',
        reading_time_minutes: 1
      }];
    } catch (error) {
      logger.warn('Error extracting EPUB chapters:', error);
      return [{
        id: 'chapter-1',
        chapter_number: 1,
        chapter_title: 'Chapter 1',
        content_html: '<p>Error loading content</p>',
        reading_time_minutes: 1
      }];
    }
  }

  /**
   * Extract chapters from HTML content
   */
  private static extractHtmlChapters(htmlContent: string, bookId: number): Array<{
    id: string;
    chapter_number: number;
    chapter_title: string;
    content_html: string;
    reading_time_minutes: number;
  }> {
    try {
      const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
      const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');

      if (headings.length === 0) {
        // No headings found, treat entire content as one chapter
        const cleanContent = this.cleanHtmlContent(htmlContent);
        const wordCount = this.countWords(cleanContent);
        
        return [{
          id: 'chapter-1',
          chapter_number: 1,
          chapter_title: 'Chapter 1',
          content_html: cleanContent,
          reading_time_minutes: Math.ceil(wordCount / this.WORDS_PER_MINUTE)
        }];
      }

      const chapters: Array<{
        id: string;
        chapter_number: number;
        chapter_title: string;
        content_html: string;
        reading_time_minutes: number;
      }> = [];

      // Split content by headings
      for (let i = 0; i < headings.length; i++) {
        const heading = headings[i];
        const title = heading.textContent?.trim() || `Chapter ${i + 1}`;
        
        // Extract content between this heading and the next
        let chapterContent = '';
        let currentElement: Node | null = heading;
        
        while (currentElement && currentElement.nextSibling) {
          currentElement = currentElement.nextSibling;
          
          // Stop if we reach the next heading
          if (i < headings.length - 1 && currentElement === headings[i + 1]) {
            break;
          }
          
          if (currentElement.nodeType === 1) { // Element node
            chapterContent += (currentElement as Element).outerHTML || '';
          }
        }

        const cleanContent = this.cleanHtmlContent(chapterContent);
        const wordCount = this.countWords(cleanContent);
        
        chapters.push({
          id: `chapter-${i + 1}`,
          chapter_number: i + 1,
          chapter_title: title,
          content_html: cleanContent,
          reading_time_minutes: Math.ceil(wordCount / this.WORDS_PER_MINUTE)
        });
      }

      return chapters;
    } catch (error) {
      logger.warn('Error extracting HTML chapters:', error);
      const cleanContent = this.cleanHtmlContent(htmlContent);
      const wordCount = this.countWords(cleanContent);
      
      return [{
        id: 'chapter-1',
        chapter_number: 1,
        chapter_title: 'Chapter 1',
        content_html: cleanContent,
        reading_time_minutes: Math.ceil(wordCount / this.WORDS_PER_MINUTE)
      }];
    }
  }

  /**
   * Clean HTML content for e-reader display
   */
  private static cleanHtmlContent(html: string): string {
    return html
      // Remove script tags
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Remove style tags
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      // Remove comments
      .replace(/<!--[\s\S]*?-->/g, '')
      // Clean up whitespace
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Count words in text content
   */
  private static countWords(html: string): number {
    const textContent = html
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    return textContent.split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Store processed book data in database
   */
  private static async storeProcessedBookData(bookId: number, data: ProcessedBookData): Promise<void> {
    await transaction(async (client) => {
      // Update book metadata
      await client.query(`
        UPDATE books SET 
          word_count = $1,
          estimated_reading_time = $2,
          pages = $3,
          processing_status = 'completed',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
      `, [
        data.metadata.wordCount,
        data.metadata.estimatedReadingTime,
        data.metadata.pages,
        bookId
      ]);

      // Clear existing chapters
      await client.query('DELETE FROM book_chapters WHERE book_id = $1', [bookId]);

      // Insert new chapters
      for (const chapter of data.chapters) {
        await client.query(`
          INSERT INTO book_chapters (
            book_id, chapter_number, chapter_title, content_html, 
            word_count, reading_time_minutes
          ) VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          bookId,
          chapter.chapter_number,
          chapter.chapter_title,
          chapter.content_html,
          this.countWords(chapter.content_html),
          chapter.reading_time_minutes
        ]);
      }

      logger.info(`Stored processed data for book ${bookId}: ${data.chapters.length} chapters`);
    });
  }

  /**
   * Get processed book data for e-reader
   */
  static async getProcessedBookData(bookId: number): Promise<ProcessedBookData | null> {
    try {
      // Get book info
      const bookResult = await query(`
        SELECT b.*, a.name as author_name
        FROM books b
        LEFT JOIN authors a ON b.author_id = a.id
        WHERE b.id = $1
      `, [bookId]);

      if (bookResult.rows.length === 0) {
        return null;
      }

      const book = bookResult.rows[0];

      // Get chapters
      const chaptersResult = await query(`
        SELECT * FROM book_chapters 
        WHERE book_id = $1 
        ORDER BY chapter_number
      `, [bookId]);

      const chapters = chaptersResult.rows.map(ch => ({
        id: `chapter-${ch.chapter_number}`,
        chapter_number: ch.chapter_number,
        chapter_title: ch.chapter_title,
        content_html: ch.content_html,
        reading_time_minutes: ch.reading_time_minutes
      }));

      // Create table of contents
      const tableOfContents = chapters.map(ch => ({
        id: ch.id,
        title: ch.chapter_title,
        chapter_number: ch.chapter_number
      }));

      return {
        id: bookId.toString(),
        title: book.title,
        author: book.author_name || 'Unknown Author',
        format: book.file_format === 'epub' ? 'epub' : 'html',
        metadata: {
          wordCount: book.word_count || 0,
          estimatedReadingTime: book.estimated_reading_time || 0,
          pages: book.pages || 0,
          language: book.language || 'en'
        },
        chapters,
        tableOfContents
      };
    } catch (error) {
      logger.error(`Error getting processed book data for ${bookId}:`, error);
      return null;
    }
  }
}