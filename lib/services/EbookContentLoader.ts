import { DOMParser } from '@xmldom/xmldom';

interface FileInfo {
  filename: string;
  fileFormat: string;
  bookMetadata: {
    title: string;
    wordCount: number;
    estimatedReadingTime: number;
    pages: number;
  };
}

interface EpubChapter {
  id: string;
  href: string;
  title: string;
  content: string;
}

interface EpubManifest {
  items: { [key: string]: { href: string; mediaType: string } };
  spine: string[];
}

export class EbookContentLoader {
  static async loadBook(bookId: string, userId: string) {
    try {
      // Get book file info
      const fileInfoResponse = await fetch(`/api/books/${bookId}/file-info`);
      if (!fileInfoResponse.ok) {
        throw new Error(`Failed to get book file information: ${fileInfoResponse.status} ${fileInfoResponse.statusText}`);
      }
      
      const fileInfo: FileInfo = await fileInfoResponse.json();
      
      // Load book content based on format
      if (fileInfo.fileFormat === 'epub') {
        return await this.loadEpubBook(bookId, fileInfo);
      } else if (fileInfo.fileFormat === 'html') {
        return await this.loadHtmlBook(bookId, fileInfo);
      } else {
        throw new Error(`Unsupported book format: ${fileInfo.fileFormat}`);
      }
    } catch (error) {
      throw new Error(`Failed to load book: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static async loadEpubBook(bookId: string, fileInfo: FileInfo) {
    // For now, fallback to HTML content for EPUB files
    // This can be enhanced later to parse actual EPUB structure
    return await this.loadHtmlBook(bookId, fileInfo);
  }

  private static async loadHtmlBook(bookId: string, fileInfo: FileInfo) {
    const contentUrl = `/api/books/${bookId}/content`;
    
    try {
      const response = await fetch(contentUrl);
      if (!response.ok) throw new Error(`Failed to load HTML content: ${response.status} ${response.statusText}`);
      const htmlContent = await response.text();
      
      return {
        id: bookId,
        title: fileInfo.bookMetadata.title,
        format: 'html',
        contentUrl,
        metadata: {
          wordCount: fileInfo.bookMetadata.wordCount,
          estimatedReadingTime: fileInfo.bookMetadata.estimatedReadingTime,
          pages: fileInfo.bookMetadata.pages
        },
        chapters: [{
          id: '1',
          chapter_number: 1,
          chapter_title: fileInfo.bookMetadata.title,
          content_html: htmlContent,
          reading_time_minutes: Math.ceil((fileInfo.bookMetadata.estimatedReadingTime || 5) / 60)
        }],
        loadContent: async () => htmlContent
      };
    } catch (error) {
      throw new Error(`Failed to load HTML book: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static async parseNakedEpubStructure(baseUrl: string): Promise<{ manifest: EpubManifest; chapters: EpubChapter[] }> {
    // Parse container.xml to find OPF file
    const containerResponse = await fetch(`${baseUrl}/META-INF/container.xml`);
    if (!containerResponse.ok) throw new Error('Missing container.xml');
    
    const containerXml = await containerResponse.text();
    const containerDoc = new DOMParser().parseFromString(containerXml, 'text/xml');
    const opfPath = containerDoc.getElementsByTagName('rootfile')[0]?.getAttribute('full-path');
    if (!opfPath) throw new Error('No OPF file found');
    
    // Parse OPF file
    const opfResponse = await fetch(`${baseUrl}/${opfPath}`);
    if (!opfResponse.ok) throw new Error('OPF file not found');
    
    const opfXml = await opfResponse.text();
    const opfDoc = new DOMParser().parseFromString(opfXml, 'text/xml');
    
    // Extract manifest
    const manifest = this.parseManifest(opfDoc);
    
    // Extract chapters
    const chapters = await this.extractNakedChapters(baseUrl, manifest, opfPath);
    
    return { manifest, chapters };
  }
  
  private static parseManifest(opfDoc: Document): EpubManifest {
    const manifest: EpubManifest = { items: {}, spine: [] };
    
    // Parse manifest items
    const manifestItems = opfDoc.getElementsByTagName('item');
    for (let i = 0; i < manifestItems.length; i++) {
      const item = manifestItems[i];
      const id = item.getAttribute('id');
      const href = item.getAttribute('href');
      const mediaType = item.getAttribute('media-type');
      
      if (id && href && mediaType) {
        manifest.items[id] = { href, mediaType };
      }
    }
    
    // Parse spine
    const spineItems = opfDoc.getElementsByTagName('itemref');
    for (let i = 0; i < spineItems.length; i++) {
      const idref = spineItems[i].getAttribute('idref');
      if (idref) manifest.spine.push(idref);
    }
    
    return manifest;
  }
  
  private static async extractNakedChapters(baseUrl: string, manifest: EpubManifest, opfPath: string): Promise<EpubChapter[]> {
    const chapters: EpubChapter[] = [];
    const basePath = opfPath.substring(0, opfPath.lastIndexOf('/') + 1);
    
    for (const idref of manifest.spine) {
      const item = manifest.items[idref];
      if (!item || !item.href) continue;
      
      const chapterUrl = `${baseUrl}/${basePath}${item.href}`;
      
      try {
        const response = await fetch(chapterUrl);
        if (!response.ok) continue;
        
        const content = await response.text();
        const cleanContent = this.cleanHtmlContent(content);
        const title = this.extractChapterTitle(content) || `Chapter ${chapters.length + 1}`;
        
        chapters.push({
          id: idref,
          href: item.href,
          title,
          content: cleanContent
        });
      } catch (error) {
        console.error(`Failed to extract chapter ${idref}:`, error);
      }
    }
    
    return chapters;
  }
  
  private static cleanHtmlContent(html: string): string {
    // Remove XML declaration and DOCTYPE
    let cleaned = html.replace(/<\?xml[^>]*\?>/gi, '');
    cleaned = cleaned.replace(/<!DOCTYPE[^>]*>/gi, '');
    
    // Extract body content if present
    const bodyMatch = cleaned.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      cleaned = bodyMatch[1];
    }
    
    // Remove namespace attributes
    cleaned = cleaned.replace(/\s+xmlns[^=]*="[^"]*"/gi, '');
    
    // Clean up whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    return cleaned;
  }
  
  private static extractChapterTitle(html: string): string | null {
    // Try to find title in h1, h2, or title tags
    const titleMatches = [
      /<h1[^>]*>([^<]+)<\/h1>/i,
      /<h2[^>]*>([^<]+)<\/h2>/i,
      /<title[^>]*>([^<]+)<\/title>/i
    ];
    
    for (const regex of titleMatches) {
      const match = html.match(regex);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return null;
  }
  
  private static estimateReadingTime(content: string): number {
    // Remove HTML tags and count words
    const text = content.replace(/<[^>]*>/g, ' ');
    const words = text.split(/\s+/).filter(word => word.length > 0).length;
    // Average reading speed: 200 words per minute
    return Math.max(1, Math.ceil(words / 200));
  }

  static async getBookStructure(bookId: string) {
    try {
      const response = await fetch(`/api/books/${bookId}/structure`);
      if (!response.ok) return [];
      
      const structure = await response.json();
      return structure.chapters || [];
    } catch (error) {
      console.error('Failed to load book structure:', error);
      return [];
    }
  }
}