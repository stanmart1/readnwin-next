import JSZip from 'jszip';
import { DOMParser } from '@xmldom/xmldom';

interface EpubMetadata {
  title?: string;
  creator?: string;
  description?: string;
  publisher?: string;
  language?: string;
  identifier?: string;
}

interface EpubChapter {
  id: string;
  title: string;
  content: string;
  order: number;
}

export class SecureEpubParser {
  private static validateZipEntry(entry: JSZip.JSZipObject): boolean {
    // Prevent path traversal attacks
    const normalizedPath = entry.name.replace(/\\/g, '/');
    if (normalizedPath.includes('../') || normalizedPath.startsWith('/')) {
      return false;
    }
    
    // Limit file size to prevent DoS
    if (entry._data && entry._data.uncompressedSize > 50 * 1024 * 1024) { // 50MB limit
      return false;
    }
    
    return true;
  }

  static async parseEpub(buffer: Buffer): Promise<{
    metadata: EpubMetadata;
    chapters: EpubChapter[];
  }> {
    try {
      const zip = await JSZip.loadAsync(buffer);
      
      // Validate all entries before processing
      for (const [path, entry] of Object.entries(zip.files)) {
        if (!this.validateZipEntry(entry)) {
          throw new Error(`Invalid file path detected: ${path}`);
        }
      }

      const metadata = await this.extractMetadata(zip);
      const chapters = await this.extractChapters(zip);

      return { metadata, chapters };
    } catch (error) {
      throw new Error(`EPUB parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static async extractMetadata(zip: JSZip): Promise<EpubMetadata> {
    try {
      const opfFile = await this.findOpfFile(zip);
      if (!opfFile) {
        return {};
      }

      const opfContent = await opfFile.async('text');
      const parser = new DOMParser();
      const doc = parser.parseFromString(opfContent, 'application/xml');

      const metadata: EpubMetadata = {};
      
      // Safely extract metadata with XPath-like queries
      const titleEl = doc.getElementsByTagName('dc:title')[0];
      if (titleEl?.textContent) {
        metadata.title = titleEl.textContent.trim();
      }

      const creatorEl = doc.getElementsByTagName('dc:creator')[0];
      if (creatorEl?.textContent) {
        metadata.creator = creatorEl.textContent.trim();
      }

      const descEl = doc.getElementsByTagName('dc:description')[0];
      if (descEl?.textContent) {
        metadata.description = descEl.textContent.trim();
      }

      return metadata;
    } catch (error) {
      console.warn('Failed to extract metadata:', error);
      return {};
    }
  }

  private static async extractChapters(zip: JSZip): Promise<EpubChapter[]> {
    const chapters: EpubChapter[] = [];
    
    try {
      // Find HTML/XHTML files
      const htmlFiles = Object.keys(zip.files).filter(path => 
        /\.(x?html?)$/i.test(path) && 
        !path.includes('toc') && 
        !path.includes('nav')
      );

      for (let i = 0; i < htmlFiles.length; i++) {
        const file = zip.files[htmlFiles[i]];
        if (file && !file.dir) {
          try {
            const content = await file.async('text');
            const sanitizedContent = this.sanitizeHtml(content);
            
            chapters.push({
              id: `chapter-${i + 1}`,
              title: `Chapter ${i + 1}`,
              content: sanitizedContent,
              order: i + 1
            });
          } catch (error) {
            console.warn(`Failed to process chapter ${htmlFiles[i]}:`, error);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to extract chapters:', error);
    }

    return chapters;
  }

  private static async findOpfFile(zip: JSZip): Promise<JSZip.JSZipObject | null> {
    // Look for container.xml first
    const containerFile = zip.files['META-INF/container.xml'];
    if (containerFile) {
      try {
        const containerContent = await containerFile.async('text');
        const parser = new DOMParser();
        const doc = parser.parseFromString(containerContent, 'application/xml');
        
        const rootfiles = doc.getElementsByTagName('rootfile');
        if (rootfiles.length > 0) {
          const opfPath = rootfiles[0].getAttribute('full-path');
          if (opfPath && zip.files[opfPath]) {
            return zip.files[opfPath];
          }
        }
      } catch (error) {
        console.warn('Failed to parse container.xml:', error);
      }
    }

    // Fallback: look for .opf files
    const opfFiles = Object.keys(zip.files).filter(path => path.endsWith('.opf'));
    return opfFiles.length > 0 ? zip.files[opfFiles[0]] : null;
  }

  private static sanitizeHtml(html: string): string {
    // Basic HTML sanitization - remove script tags and dangerous attributes
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/data:/gi, '')
      .trim();
  }
}