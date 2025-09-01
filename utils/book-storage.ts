import fs from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';
import { secureQuery } from './secure-database';

const STORAGE_BASE = process.env.NODE_ENV === 'production' 
  ? '/app/storage'
  : path.join(process.cwd(), 'storage');

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

// Structure preservation functions
export async function preserveEpubStructure(bookId: number, buffer: Buffer, filename: string) {
  try {
    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(buffer);
    
    // Extract to storage directory
    const extractionPath = path.join(STORAGE_BASE, 'books', bookId.toString(), 'extracted');
    await fs.mkdir(extractionPath, { recursive: true });
    
    // Extract all files
    for (const [relativePath, file] of Object.entries(zip.files)) {
      if (!file.dir) {
        const content = await file.async('nodebuffer');
        const filePath = path.join(extractionPath, relativePath);
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, content);
      }
    }
    
    // Parse EPUB structure
    const structure = await parseEpubStructure(extractionPath);
    const metadata = await extractEpubMetadata(extractionPath);
    
    // Store original file
    const storedPath = path.join(STORAGE_BASE, 'books', bookId.toString(), filename);
    await fs.writeFile(storedPath, buffer);
    
    return {
      success: true,
      structure,
      metadata,
      extractionPath,
      storedPath,
      hash: createHash('sha256').update(buffer).digest('hex')
    };
  } catch (error) {
    console.error('EPUB structure preservation failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function preserveHtmlStructure(bookId: number, buffer: Buffer, filename: string) {
  try {
    // Store original file
    const storedPath = path.join(STORAGE_BASE, 'books', bookId.toString(), filename);
    await fs.mkdir(path.dirname(storedPath), { recursive: true });
    await fs.writeFile(storedPath, buffer);
    
    // Parse HTML structure
    const htmlContent = buffer.toString('utf-8');
    const structure = await parseHtmlStructure(htmlContent);
    const metadata = extractHtmlMetadata(htmlContent);
    
    return {
      success: true,
      structure,
      metadata,
      storedPath,
      hash: createHash('sha256').update(buffer).digest('hex')
    };
  } catch (error) {
    console.error('HTML structure preservation failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function parseEpubStructure(extractionPath: string) {
  const containerPath = path.join(extractionPath, 'META-INF', 'container.xml');
  const containerXml = await fs.readFile(containerPath, 'utf-8');
  const { DOMParser } = await import('@xmldom/xmldom');
  const parser = new DOMParser();
  const containerDoc = parser.parseFromString(containerXml, 'text/xml');
  
  const opfPath = containerDoc.getElementsByTagName('rootfile')[0]?.getAttribute('full-path');
  if (!opfPath) throw new Error('OPF file not found');
  
  const opfFullPath = path.join(extractionPath, opfPath);
  const opfXml = await fs.readFile(opfFullPath, 'utf-8');
  const opfDoc = parser.parseFromString(opfXml, 'text/xml');
  
  // Parse manifest
  const manifest: Record<string, any> = {};
  const manifestItems = opfDoc.getElementsByTagName('item');
  for (let i = 0; i < manifestItems.length; i++) {
    const item = manifestItems[i];
    const id = item.getAttribute('id');
    if (id) {
      manifest[id] = {
        href: item.getAttribute('href'),
        mediaType: item.getAttribute('media-type')
      };
    }
  }
  
  // Parse spine
  const spine: string[] = [];
  const spineItems = opfDoc.getElementsByTagName('itemref');
  for (let i = 0; i < spineItems.length; i++) {
    const idref = spineItems[i].getAttribute('idref');
    if (idref) spine.push(idref);
  }
  
  return {
    opfPath,
    manifest,
    spine
  };
}

async function parseHtmlStructure(htmlContent: string) {
  const cheerio = await import('cheerio');
  const $ = cheerio.load(htmlContent);
  
  // Extract chapter structure from headings
  const chapters: any[] = [];
  $('h1, h2, h3').each((i, el) => {
    const $el = $(el);
    chapters.push({
      level: parseInt(el.tagName.charAt(1)),
      title: $el.text().trim(),
      id: $el.attr('id') || `chapter-${i}`
    });
  });
  
  return { chapters };
}

function extractHtmlMetadata(htmlContent: string) {
  const titleMatch = htmlContent.match(/<title>([^<]+)<\/title>/i);
  const authorMatch = htmlContent.match(/<meta[^>]+name=["']author["'][^>]+content=["']([^"']+)["']/i);
  
  return {
    title: titleMatch?.[1] || null,
    author: authorMatch?.[1] || null
  };
}

async function extractEpubMetadata(extractionPath: string) {
  try {
    const containerPath = path.join(extractionPath, 'META-INF', 'container.xml');
    const containerXml = await fs.readFile(containerPath, 'utf-8');
    const { DOMParser } = await import('@xmldom/xmldom');
    const parser = new DOMParser();
    const containerDoc = parser.parseFromString(containerXml, 'text/xml');
    
    const opfPath = containerDoc.getElementsByTagName('rootfile')[0]?.getAttribute('full-path');
    if (!opfPath) return {};
    
    const opfFullPath = path.join(extractionPath, opfPath);
    const opfXml = await fs.readFile(opfFullPath, 'utf-8');
    const opfDoc = parser.parseFromString(opfXml, 'text/xml');
    
    const metadata: Record<string, any> = {};
    const metadataEl = opfDoc.getElementsByTagName('metadata')[0];
    
    if (metadataEl) {
      const title = metadataEl.getElementsByTagName('dc:title')[0]?.textContent;
      const creator = metadataEl.getElementsByTagName('dc:creator')[0]?.textContent;
      
      if (title) metadata.title = title;
      if (creator) metadata.creator = creator;
    }
    
    return metadata;
  } catch (error) {
    return {};
  }
}