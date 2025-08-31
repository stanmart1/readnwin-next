import fs from 'fs/promises';
import path from 'path';
import { secureQuery } from './secure-database';

export class BookStorage {
  private static getStoragePath(): string {
    return process.env.NODE_ENV === 'production' 
      ? '/app/storage/books'
      : path.join(process.cwd(), 'storage', 'books');
  }

  static async ensureBookDirectory(bookId: string): Promise<string> {
    const bookDir = path.join(this.getStoragePath(), bookId);
    await fs.mkdir(bookDir, { recursive: true });
    return bookDir;
  }

  static async storeBookFile(bookId: string, filename: string, content: Buffer): Promise<string> {
    const bookDir = await this.ensureBookDirectory(bookId);
    const filePath = path.join(bookDir, filename);
    await fs.writeFile(filePath, content);
    return filePath;
  }

  static async getBookFile(bookId: string, filename: string): Promise<Buffer | null> {
    try {
      const filePath = path.join(this.getStoragePath(), bookId, filename);
      return await fs.readFile(filePath);
    } catch {
      return null;
    }
  }

  static async createDefaultContent(bookId: number, title: string): Promise<void> {
    const bookDir = await this.ensureBookDirectory(bookId.toString());
    
    // Create basic HTML content
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>${title}</title>
    <meta charset="utf-8">
    <style>
      body { font-family: serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
      .chapter { margin-bottom: 2em; }
      .chapter-title { color: #333; border-bottom: 1px solid #eee; padding-bottom: 0.5em; }
    </style>
</head>
<body>
    <div class="chapter" data-chapter-id="chapter-1">
      <h1 class="chapter-title">${title}</h1>
      <p>This is a sample book content. The full content will be available once the book file is properly uploaded.</p>
      <p>You can read this book using the ReadnWin e-reader interface.</p>
      <p>The e-reader supports both EPUB and HTML formats with full structure preservation.</p>
    </div>
</body>
</html>`;

    await fs.writeFile(path.join(bookDir, 'content.html'), htmlContent);
    
    // Update book_files table
    const crypto = await import('crypto');
    const fileHash = crypto.createHash('sha256').update(htmlContent).digest('hex');
    
    await secureQuery(`
      INSERT INTO book_files (book_id, file_type, original_filename, stored_filename, file_path, file_size, mime_type, file_format, processing_status, file_hash)
      VALUES ($1, 'ebook', $2, 'content.html', $3, $4, 'text/html', 'html', 'completed', $5)
      ON CONFLICT (book_id, file_type) DO UPDATE SET
        stored_filename = EXCLUDED.stored_filename,
        file_path = EXCLUDED.file_path,
        file_size = EXCLUDED.file_size,
        processing_status = EXCLUDED.processing_status,
        file_hash = EXCLUDED.file_hash
    `, [bookId, `${title}.html`, path.join(bookDir, 'content.html'), Buffer.byteLength(htmlContent), fileHash]);
  }

  static async processEpubFile(bookId: string, filename: string, buffer: Buffer): Promise<{ success: boolean; error?: string; metadata?: any }> {
    try {
      const { SecureEpubParser } = await import('@/lib/secure-epub-parser');
      const { metadata, chapters } = await SecureEpubParser.parseEpub(buffer);
      
      const bookDir = await this.ensureBookDirectory(bookId);
      
      // Store original EPUB file
      await fs.writeFile(path.join(bookDir, filename), buffer);
      
      // Create structured HTML from chapters
      const structuredContent = chapters.map(chapter => 
        `<div class="chapter" data-chapter-id="${chapter.id}">
          <h2 class="chapter-title">${chapter.title}</h2>
          ${chapter.content}
        </div>`
      ).join('\n\n');
      
      const fullHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>${metadata.title || 'Untitled'}</title>
    <meta charset="utf-8">
    <meta name="author" content="${metadata.creator || 'Unknown'}">
    <style>
      body { font-family: serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
      .chapter { margin-bottom: 3em; page-break-before: auto; }
      .chapter-title { color: #333; border-bottom: 2px solid #eee; padding-bottom: 0.5em; margin-bottom: 1em; }
      p { margin-bottom: 1em; text-align: justify; }
      img { max-width: 100%; height: auto; }
    </style>
</head>
<body>
    ${structuredContent}
</body>
</html>`;
      
      // Save processed HTML
      await fs.writeFile(path.join(bookDir, 'content.html'), fullHtml);
      
      // Save chapter structure as JSON
      const structure = {
        type: 'epub',
        chapters: chapters.map(ch => ({
          id: ch.id,
          title: ch.title,
          order: ch.order
        }))
      };
      await fs.writeFile(path.join(bookDir, 'structure.json'), JSON.stringify(structure, null, 2));
      
      return {
        success: true,
        metadata: {
          ...metadata,
          chapters: structure.chapters,
          wordCount: fullHtml.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0).length
        }
      };
    } catch (error) {
      console.error('EPUB processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error processing EPUB'
      };
    }
  }

  static async getBookStructure(bookId: string): Promise<any | null> {
    try {
      const structurePath = path.join(this.getStoragePath(), bookId, 'structure.json');
      const structureData = await fs.readFile(structurePath, 'utf-8');
      return JSON.parse(structureData);
    } catch {
      return null;
    }
  }
}