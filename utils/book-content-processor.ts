import { query } from './database';
import { join } from 'path';
import { existsSync, readFileSync } from 'fs';
import { execSync } from 'child_process';

export class BookContentProcessor {
  private bookFilesDir: string;
  private epubDir: string;
  private processedDir: string;

  constructor() {
    this.bookFilesDir = process.env.NODE_ENV === 'production' 
      ? '/app/book-files' 
      : join(process.cwd(), 'book-files');
    
    this.epubDir = join(this.bookFilesDir, 'epub');
    this.processedDir = join(this.bookFilesDir, 'processed');
  }

  /**
   * Process ebook content for a specific book
   */
  async processEbook(book: any): Promise<void> {
    try {
      console.log(`   📖 Processing ebook: ${book.title}`);
      
      if (!book.ebook_file_url) {
        console.log(`   ⚠️ No ebook file URL for book: ${book.title}`);
        return;
      }

      // Extract file path from URL
      const filePath = this.getFilePathFromUrl(book.ebook_file_url);
      console.log(`   📁 File path: ${filePath}`);

      if (!existsSync(filePath)) {
        console.log(`   ⚠️ File not found: ${filePath}`);
        return;
      }

      // Extract content based on file type
      let rawContent = '';
      if (filePath.toLowerCase().endsWith('.epub')) {
        rawContent = await this.extractEPUBContent(filePath);
      } else if (filePath.toLowerCase().endsWith('.pdf')) {
        rawContent = await this.processPDF(book, filePath);
      } else {
        console.log(`   ⚠️ Unsupported file type: ${filePath}`);
        return;
      }

      if (!rawContent || rawContent.trim().length === 0) {
        console.log(`   ⚠️ No content extracted from: ${filePath}`);
        return;
      }

      // Process the extracted content
      const processedContent = await this.processContent(rawContent);
      
      // Update database with processed content
      await this.updateBookContent(book.id, processedContent);
      
      console.log(`   ✅ Successfully processed: ${book.title}`);
      
    } catch (error) {
      console.error(`   ❌ Error processing ebook ${book.title}:`, error);
      throw error;
    }
  }

  /**
   * Extract content from EPUB file
   */
  private async extractEPUBContent(filePath: string): Promise<string> {
    try {
      console.log(`   📦 Extracting EPUB content from: ${filePath}`);
      
      // Create temporary directory for extraction
      const tempDir = join(this.processedDir, `temp_${Date.now()}`);
      
      // Extract EPUB (it's just a ZIP file)
      execSync(`unzip -q "${filePath}" -d "${tempDir}"`, { stdio: 'pipe' });
      
      // Read container.xml to find the main content file
      const containerPath = join(tempDir, 'META-INF', 'container.xml');
      if (!existsSync(containerPath)) {
        throw new Error('container.xml not found in EPUB');
      }
      
      const containerXml = readFileSync(containerPath, 'utf8');
      const rootfileMatch = containerXml.match(/full-path="([^"]+)"/);
      
      if (!rootfileMatch) {
        throw new Error('Could not find rootfile in container.xml');
      }
      
      const rootfilePath = join(tempDir, rootfileMatch[1]);
      if (!existsSync(rootfilePath)) {
        throw new Error(`Rootfile not found: ${rootfileMatch[1]}`);
      }
      
      // Read the rootfile (usually content.opf)
      const rootfileContent = readFileSync(rootfilePath, 'utf8');
      
      // Extract all HTML files referenced in the manifest
      const htmlFiles: string[] = [];
      const manifestMatch = rootfileContent.match(/<manifest[^>]*>([\s\S]*?)<\/manifest>/i);
      
      if (manifestMatch) {
        const manifest = manifestMatch[1];
        const itemMatches = manifest.match(/<item[^>]*href="([^"]*\.(?:xhtml|html))"[^>]*>/gi);
        
        if (itemMatches) {
          for (const itemMatch of itemMatches) {
            const hrefMatch = itemMatch.match(/href="([^"]+)"/);
            if (hrefMatch) {
              const href = hrefMatch[1];
              const htmlPath = join(tempDir, href);
              if (existsSync(htmlPath)) {
                htmlFiles.push(htmlPath);
              }
            }
          }
        }
      }
      
      // Sort HTML files by their order in the spine
      const spineMatch = rootfileContent.match(/<spine[^>]*>([\s\S]*?)<\/spine>/i);
      if (spineMatch) {
        const spine = spineMatch[1];
        const idrefMatches = spine.match(/idref="([^"]+)"/gi);
        
        if (idrefMatches) {
          // Create a mapping of idref to href from manifest
          const idToHref: { [key: string]: string } = {};
          const manifest = rootfileContent.match(/<manifest[^>]*>([\s\S]*?)<\/manifest>/i)?.[1] || '';
          const itemMatches = manifest.match(/<item[^>]*id="([^"]*)"[^>]*href="([^"]*\.(?:xhtml|html))"[^>]*>/gi);
          
          if (itemMatches) {
            for (const itemMatch of itemMatches) {
              const idMatch = itemMatch.match(/id="([^"]+)"/);
              const hrefMatch = itemMatch.match(/href="([^"]+)"/);
              if (idMatch && hrefMatch) {
                idToHref[idMatch[1]] = hrefMatch[1];
              }
            }
          }
          
          // Reorder HTML files based on spine
          const orderedFiles: string[] = [];
          for (const idrefMatch of idrefMatches) {
            const idref = idrefMatch.match(/idref="([^"]+)"/)?.[1];
            if (idref && idToHref[idref]) {
              const htmlPath = join(tempDir, idToHref[idref]);
              if (existsSync(htmlPath)) {
                orderedFiles.push(htmlPath);
              }
            }
          }
          
          if (orderedFiles.length > 0) {
            htmlFiles.splice(0, htmlFiles.length, ...orderedFiles);
          }
        }
      }
      
      // Extract text content from all HTML files
      let allContent = '';
      for (const htmlFile of htmlFiles) {
        const htmlContent = readFileSync(htmlFile, 'utf8');
        const textContent = this.extractTextFromHTML(htmlContent);
        allContent += textContent + '\n\n';
      }
      
      // Clean up temporary directory
      execSync(`rm -rf "${tempDir}"`, { stdio: 'pipe' });
      
      return allContent.trim();
      
    } catch (error) {
      console.error(`   ❌ EPUB extraction error:`, error);
      throw error;
    }
  }

  /**
   * Extract text content from HTML
   */
  private extractTextFromHTML(html: string): string {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Process PDF file (placeholder for future implementation)
   */
  private async processPDF(book: any, filePath: string): Promise<string> {
    console.log(`   📄 PDF processing not yet implemented for: ${book.title}`);
    return '';
  }

  /**
   * Process extracted content and generate metadata
   */
  private async processContent(rawContent: string): Promise<any> {
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
      console.error(`   ❌ Content processing error:`, error);
      throw error;
    }
  }

  /**
   * Generate simple table of contents
   */
  private generateTableOfContents(content: string): any[] {
    const chapters: any[] = [];
    const lines = content.split('\n');
    let chapterIndex = 1;
    
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
  private convertToMarkdown(content: string): string {
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
  private async updateBookContent(bookId: number, processedContent: any): Promise<void> {
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
      console.error(`   ❌ Database update error:`, error);
      throw error;
    }
  }

  /**
   * Get file path from URL
   */
  private getFilePathFromUrl(url: string): string {
    // Remove any base URL and get just the file path
    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1];
    return join(this.epubDir, fileName);
  }
} 