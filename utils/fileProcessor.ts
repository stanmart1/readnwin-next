import * as JSZip from 'jszip';
import { FileProcessingResult } from '@/types/ereader';

export class FileProcessor {
  /**
   * Process markdown files
   */
  static async processMarkdown(file: File): Promise<FileProcessingResult> {
    try {
      const content = await file.text();
      const wordCount = this.calculateWordCount(content);
      
      return {
        success: true,
        content,
        metadata: {
          title: this.extractTitleFromMarkdown(content) || file.name.replace('.md', ''),
          author: 'Unknown Author',
          wordCount,
          chapterCount: this.countChapters(content),
        },
      };
    } catch (error) {
      return {
        success: false,
        content: '',
        metadata: { title: '', author: '', wordCount: 0, chapterCount: 0 },
        error: error instanceof Error ? error.message : 'Failed to process markdown file',
      };
    }
  }

  /**
   * Process HTML files
   */
  static async processHTML(file: File): Promise<FileProcessingResult> {
    try {
      const content = await file.text();
      const cleanContent = this.sanitizeHTML(content);
      const wordCount = this.calculateWordCount(cleanContent);
      
      return {
        success: true,
        content: cleanContent,
        metadata: {
          title: this.extractTitleFromHTML(content) || file.name.replace('.html', ''),
          author: this.extractAuthorFromHTML(content) || 'Unknown Author',
          wordCount,
          chapterCount: this.countHTMLChapters(content),
        },
      };
    } catch (error) {
      return {
        success: false,
        content: '',
        metadata: { title: '', author: '', wordCount: 0, chapterCount: 0 },
        error: error instanceof Error ? error.message : 'Failed to process HTML file',
      };
    }
  }

  /**
   * Process EPUB files
   */
  static async processEPUB(file: File): Promise<FileProcessingResult> {
    try {
      const zip = new JSZip.default();
      const zipContent = await zip.loadAsync(file);
      
      // Read container.xml to find the OPF file
      const containerXml = await zipContent.file('META-INF/container.xml')?.async('text');
      if (!containerXml) {
        throw new Error('Invalid EPUB: missing container.xml');
      }
      
      const opfPath = this.extractOPFPath(containerXml);
      if (!opfPath) {
        throw new Error('Invalid EPUB: cannot find OPF file');
      }
      
      // Read the OPF file
      const opfContent = await zipContent.file(opfPath)?.async('text');
      if (!opfContent) {
        throw new Error('Invalid EPUB: cannot read OPF file');
      }
      
      // Parse OPF to get metadata and content files
      const { metadata, contentFiles } = this.parseOPF(opfContent, opfPath);
      
      // Read and combine all content files
      let combinedContent = '';
      for (const contentFile of contentFiles) {
        const content = await zipContent.file(contentFile)?.async('text');
        if (content) {
          combinedContent += this.sanitizeHTML(content);
        }
      }
      
      const wordCount = this.calculateWordCount(combinedContent);
      
      return {
        success: true,
        content: combinedContent,
        metadata: {
          title: metadata.title || file.name.replace('.epub', ''),
          author: metadata.author || 'Unknown Author',
          wordCount,
          chapterCount: this.countHTMLChapters(combinedContent),
        },
      };
    } catch (error) {
      return {
        success: false,
        content: '',
        metadata: { title: '', author: '', wordCount: 0, chapterCount: 0 },
        error: error instanceof Error ? error.message : 'Failed to process EPUB file',
      };
    }
  }

  /**
   * Process any supported file type
   */
  static async processFile(file: File): Promise<FileProcessingResult> {
    const extension = file.name.toLowerCase().split('.').pop();
    
    switch (extension) {
      case 'md':
      case 'markdown':
        return this.processMarkdown(file);
      case 'html':
      case 'htm':
        return this.processHTML(file);
      case 'epub':
        return this.processEPUB(file);
      default:
        return {
          success: false,
          content: '',
          metadata: { title: '', author: '', wordCount: 0, chapterCount: 0 },
          error: `Unsupported file type: ${extension}`,
        };
    }
  }

  /**
   * Calculate word count from text
   */
  private static calculateWordCount(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Extract title from markdown content
   */
  private static extractTitleFromMarkdown(content: string): string | null {
    const titleMatch = content.match(/^#\s+(.+)$/m);
    return titleMatch ? titleMatch[1].trim() : null;
  }

  /**
   * Extract title from HTML content
   */
  private static extractTitleFromHTML(content: string): string | null {
    const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
    return titleMatch ? titleMatch[1].trim() : null;
  }

  /**
   * Extract author from HTML content
   */
  private static extractAuthorFromHTML(content: string): string | null {
    const authorMatch = content.match(/<meta[^>]*name=["']author["'][^>]*content=["']([^"']+)["']/i);
    return authorMatch ? authorMatch[1].trim() : null;
  }

  /**
   * Count chapters in markdown content
   */
  private static countChapters(content: string): number {
    const chapterMatches = content.match(/^#{1,3}\s+.+$/gm);
    return chapterMatches ? chapterMatches.length : 0;
  }

  /**
   * Count chapters in HTML content
   */
  private static countHTMLChapters(content: string): number {
    const chapterMatches = content.match(/<h[1-3][^>]*>.+<\/h[1-3]>/gi);
    return chapterMatches ? chapterMatches.length : 0;
  }

  /**
   * Sanitize HTML content
   */
  private static sanitizeHTML(content: string): string {
    // Basic HTML sanitization - in production, use a proper sanitizer
    return content
      .replace(/<script[^>]*>.*?<\/script>/gis, '')
      .replace(/<style[^>]*>.*?<\/style>/gis, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gis, '')
      .replace(/<object[^>]*>.*?<\/object>/gis, '')
      .replace(/<embed[^>]*>/gis, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  /**
   * Extract OPF file path from container.xml
   */
  private static extractOPFPath(containerXml: string): string | null {
    const opfMatch = containerXml.match(/full-path="([^"]+\.opf)"/);
    return opfMatch ? opfMatch[1] : null;
  }

  /**
   * Parse OPF file to extract metadata and content files
   */
  private static parseOPF(opfContent: string, opfPath: string): { metadata: any; contentFiles: string[] } {
    const metadata: any = {};
    const contentFiles: string[] = [];
    
    // Extract title
    const titleMatch = opfContent.match(/<dc:title[^>]*>([^<]+)<\/dc:title>/);
    if (titleMatch) metadata.title = titleMatch[1];
    
    // Extract author
    const authorMatch = opfContent.match(/<dc:creator[^>]*>([^<]+)<\/dc:creator>/);
    if (authorMatch) metadata.author = authorMatch[1];
    
    // Extract content files
    const manifestMatches = opfContent.match(/<item[^>]*href="([^"]+)"[^>]*media-type="[^"]*html[^"]*"[^>]*>/g);
    if (manifestMatches) {
      for (const match of manifestMatches) {
        const hrefMatch = match.match(/href="([^"]+)"/);
        if (hrefMatch) {
          const href = hrefMatch[1];
          // Resolve relative path
          const opfDir = opfPath.substring(0, opfPath.lastIndexOf('/') + 1);
          const fullPath = href.startsWith('/') ? href : opfDir + href;
          contentFiles.push(fullPath);
        }
      }
    }
    
    return { metadata, contentFiles };
  }

  /**
   * Preprocess content for better text selection and highlighting
   */
  static preprocessContent(content: string, contentType: 'markdown' | 'html' | 'epub'): string {
    if (contentType === 'markdown') {
      // Convert markdown to HTML for better text selection
      return this.markdownToHTML(content);
    }
    
    // For HTML and EPUB, ensure proper structure for text selection
    return this.structureHTMLForSelection(content);
  }

  /**
   * Convert markdown to HTML
   */
  private static markdownToHTML(markdown: string): string {
    // Basic markdown to HTML conversion
    // In production, use a proper markdown parser
    return markdown
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(.+)$/gm, '<p>$1</p>');
  }

  /**
   * Structure HTML for better text selection
   */
  private static structureHTMLForSelection(html: string): string {
    // Add data attributes for text selection tracking
    return html
      .replace(/<p([^>]*)>/g, '<p$1 data-selection="true">')
      .replace(/<h([1-6])([^>]*)>/g, '<h$1$2 data-selection="true">')
      .replace(/<div([^>]*)>/g, '<div$1 data-selection="true">');
  }
}
