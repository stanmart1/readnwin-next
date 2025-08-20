import { DOMParser } from '@xmldom/xmldom';
import StorageService from './StorageService';
import path from 'path';
import fs from 'fs/promises';
import JSZip from 'jszip';

export interface HtmlBookMetadata {
  title: string;
  author: string;
  description?: string;
  language?: string;
  wordCount: number;
  estimatedReadingTime: number;
}

export interface HtmlChapter {
  id: string;
  title: string;
  content: string;
  wordCount: number;
  order: number;
  anchor?: string;
}

export interface HtmlAsset {
  type: 'image' | 'css' | 'font' | 'script';
  originalPath: string;
  storedPath: string;
  mimeType: string;
}

export interface ProcessedHtmlBook {
  metadata: HtmlBookMetadata;
  chapters: HtmlChapter[];
  assets: HtmlAsset[];
  mainContent: string;
  tableOfContents: Array<{
    id: string;
    title: string;
    anchor: string;
    order: number;
  }>;
}

export class HtmlProcessingService {
  private static readonly WORDS_PER_MINUTE = 200;

  /**
   * Process HTML book file (single HTML or ZIP with HTML + assets)
   */
  static async processHtmlBook(filePath: string, bookId: string): Promise<{
    success: boolean;
    data?: ProcessedHtmlBook;
    error?: string;
  }> {
    try {
      console.log(`Processing HTML book: ${filePath}`);

      // Check if file exists on persistent volume
      const fileInfo = await StorageService.getFileInfo(filePath);
      if (!fileInfo.exists) {
        throw new Error('HTML book file not found on persistent volume');
      }

      const ext = path.extname(filePath).toLowerCase();
      
      if (ext === '.zip') {
        return await this.processHtmlZip(filePath, bookId);
      } else if (ext === '.html' || ext === '.htm') {
        return await this.processSingleHtml(filePath, bookId);
      } else {
        throw new Error('Unsupported file format. Expected .html, .htm, or .zip');
      }
    } catch (error) {
      console.error('Error processing HTML book:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error processing HTML book',
      };
    }
  }

  /**
   * Process ZIP file containing HTML book with assets
   */
  private static async processHtmlZip(filePath: string, bookId: string): Promise<{
    success: boolean;
    data?: ProcessedHtmlBook;
    error?: string;
  }> {
    try {
      // Read ZIP file from persistent volume
      const zipBuffer = await fs.readFile(filePath);
      const zip = await JSZip.loadAsync(zipBuffer);

      // Find main HTML file
      const htmlFiles = Object.keys(zip.files).filter(name => 
        !zip.files[name].dir && 
        (name.endsWith('.html') || name.endsWith('.htm'))
      );

      if (htmlFiles.length === 0) {
        throw new Error('No HTML files found in ZIP');
      }

      // Use index.html if available, otherwise use first HTML file
      let mainHtmlFile = htmlFiles.find(name => 
        name.toLowerCase().includes('index') || 
        name.toLowerCase().includes('main')
      ) || htmlFiles[0];

      // Extract main HTML content
      const htmlFile = zip.file(mainHtmlFile);
      if (!htmlFile) {
        throw new Error(`Main HTML file not found: ${mainHtmlFile}`);
      }

      const htmlContent = await htmlFile.async('text');

      // Extract and store assets
      const assets = await this.extractAssetsFromZip(zip, bookId, htmlContent);

      // Process HTML content
      const processedContent = await this.processHtmlContent(htmlContent, assets);

      return {
        success: true,
        data: processedContent,
      };
    } catch (error) {
      console.error('Error processing HTML ZIP:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error processing HTML ZIP',
      };
    }
  }

  /**
   * Process single HTML file
   */
  private static async processSingleHtml(filePath: string, bookId: string): Promise<{
    success: boolean;
    data?: ProcessedHtmlBook;
    error?: string;
  }> {
    try {
      // Read HTML file from persistent volume
      const htmlContent = await fs.readFile(filePath, 'utf-8');

      // Process HTML content (no external assets for single file)
      const processedContent = await this.processHtmlContent(htmlContent, []);

      return {
        success: true,
        data: processedContent,
      };
    } catch (error) {
      console.error('Error processing single HTML:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error processing HTML file',
      };
    }
  }

  /**
   * Extract assets from ZIP and store on persistent volume
   */
  private static async extractAssetsFromZip(
    zip: JSZip, 
    bookId: string, 
    htmlContent: string
  ): Promise<HtmlAsset[]> {
    const assets: HtmlAsset[] = [];
    const assetExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.css', '.js', '.ttf', '.otf', '.woff', '.woff2'];

    // Find referenced assets in HTML
    const referencedAssets = this.findReferencedAssets(htmlContent);

    for (const [relativePath, file] of Object.entries(zip.files)) {
      if (file.dir) continue;

      const ext = path.extname(relativePath).toLowerCase();
      if (!assetExtensions.includes(ext)) continue;

      // Check if asset is referenced in HTML
      const isReferenced = referencedAssets.some(ref => 
        relativePath.includes(ref) || ref.includes(path.basename(relativePath))
      );

      if (!isReferenced && !this.isCommonAsset(relativePath)) {
        continue; // Skip unreferenced assets
      }

      try {
        const data = await file.async('nodebuffer');
        
        // Store asset on persistent volume
        const assetPath = StorageService.generateSecureFilePath(
          'asset',
          bookId,
          path.basename(relativePath),
          this.getAssetSubType(ext)
        );

        const storeResult = await StorageService.storeFile(data, assetPath);
        
        if (storeResult.success) {
          assets.push({
            type: this.getAssetType(ext),
            originalPath: relativePath,
            storedPath: assetPath,
            mimeType: this.getMimeType(ext),
          });
        }
      } catch (error) {
        console.error(`Error processing asset ${relativePath}:`, error);
      }
    }

    return assets;
  }

  /**
   * Process HTML content and extract structure
   */
  private static async processHtmlContent(
    htmlContent: string, 
    assets: HtmlAsset[]
  ): Promise<ProcessedHtmlBook> {
    // Parse HTML
    const doc = new DOMParser().parseFromString(htmlContent, 'text/html');

    // Extract metadata
    const metadata = this.extractHtmlMetadata(doc, htmlContent);

    // Extract table of contents
    const tableOfContents = this.extractTableOfContents(doc);

    // Extract chapters
    const chapters = this.extractChapters(doc, tableOfContents);

    // Update asset references in content
    const updatedContent = this.updateAssetReferences(htmlContent, assets);

    return {
      metadata,
      chapters,
      assets,
      mainContent: updatedContent,
      tableOfContents,
    };
  }

  /**
   * Extract metadata from HTML
   */
  private static extractHtmlMetadata(doc: Document, htmlContent: string): HtmlBookMetadata {
    // Try to get title from <title> tag or <h1>
    let title = 'Unknown Title';
    const titleElement = doc.getElementsByTagName('title')[0];
    if (titleElement && titleElement.textContent) {
      title = titleElement.textContent.trim();
    } else {
      const h1Element = doc.getElementsByTagName('h1')[0];
      if (h1Element && h1Element.textContent) {
        title = h1Element.textContent.trim();
      }
    }

    // Try to get author from meta tags
    let author = 'Unknown Author';
    const metaTags = doc.getElementsByTagName('meta');
    for (let i = 0; i < metaTags.length; i++) {
      const meta = metaTags[i];
      const name = meta.getAttribute('name')?.toLowerCase();
      const property = meta.getAttribute('property')?.toLowerCase();
      const content = meta.getAttribute('content');
      
      if (content && (name === 'author' || property === 'author' || name === 'dc.creator')) {
        author = content;
        break;
      }
    }

    // Try to get description
    let description: string | undefined;
    for (let i = 0; i < metaTags.length; i++) {
      const meta = metaTags[i];
      const name = meta.getAttribute('name')?.toLowerCase();
      const property = meta.getAttribute('property')?.toLowerCase();
      const content = meta.getAttribute('content');
      
      if (content && (name === 'description' || property === 'description' || name === 'dc.description')) {
        description = content;
        break;
      }
    }

    // Try to get language
    let language = 'en';
    const htmlElement = doc.getElementsByTagName('html')[0];
    if (htmlElement) {
      const lang = htmlElement.getAttribute('lang') || htmlElement.getAttribute('xml:lang');
      if (lang) {
        language = lang;
      }
    }

    // Calculate word count
    const textContent = this.extractTextFromHtml(htmlContent);
    const wordCount = this.countWords(textContent);
    const estimatedReadingTime = Math.ceil(wordCount / this.WORDS_PER_MINUTE);

    return {
      title,
      author,
      description,
      language,
      wordCount,
      estimatedReadingTime,
    };
  }

  /**
   * Extract table of contents from HTML headings
   */
  private static extractTableOfContents(doc: Document): Array<{
    id: string;
    title: string;
    anchor: string;
    order: number;
  }> {
    const toc: Array<{ id: string; title: string; anchor: string; order: number }> = [];
    const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');

    for (let i = 0; i < headings.length; i++) {
      const heading = headings[i];
      const title = heading.textContent?.trim() || `Heading ${i + 1}`;
      
      // Generate or get anchor
      let anchor = heading.getAttribute('id') || '';
      if (!anchor) {
        anchor = this.generateAnchor(title, i);
        heading.setAttribute('id', anchor);
      }

      toc.push({
        id: `toc-${i}`,
        title,
        anchor,
        order: i,
      });
    }

    return toc;
  }

  /**
   * Extract chapters from HTML content
   */
  private static extractChapters(
    doc: Document, 
    tableOfContents: Array<{ id: string; title: string; anchor: string; order: number }>
  ): HtmlChapter[] {
    const chapters: HtmlChapter[] = [];

    if (tableOfContents.length === 0) {
      // No headings found, treat entire content as one chapter
      const bodyElement = doc.getElementsByTagName('body')[0];
      const content = bodyElement ? bodyElement.innerHTML : doc.documentElement.innerHTML;
      const textContent = this.extractTextFromHtml(content);
      
      chapters.push({
        id: 'chapter-1',
        title: 'Chapter 1',
        content,
        wordCount: this.countWords(textContent),
        order: 0,
      });
    } else {
      // Split content by headings
      for (let i = 0; i < tableOfContents.length; i++) {
        const tocItem = tableOfContents[i];
        const nextTocItem = tableOfContents[i + 1];
        
        // Extract content between this heading and the next
        const chapterContent = this.extractChapterContent(
          doc, 
          tocItem.anchor, 
          nextTocItem?.anchor
        );
        
        const textContent = this.extractTextFromHtml(chapterContent);
        
        chapters.push({
          id: `chapter-${i + 1}`,
          title: tocItem.title,
          content: chapterContent,
          wordCount: this.countWords(textContent),
          order: i,
          anchor: tocItem.anchor,
        });
      }
    }

    return chapters;
  }

  /**
   * Extract content between two anchors
   */
  private static extractChapterContent(doc: Document, startAnchor: string, endAnchor?: string): string {
    const startElement = doc.getElementById(startAnchor);
    if (!startElement) {
      return '';
    }

    let content = '';
    let currentElement: Node | null = startElement;
    
    while (currentElement) {
      if (currentElement.nodeType === 1) { // Element node
        const element = currentElement as Element;
        
        // Stop if we reach the next chapter heading
        if (endAnchor && element.getAttribute('id') === endAnchor) {
          break;
        }
        
        // Add element to content
        content += element.outerHTML || '';
      }
      
      currentElement = currentElement.nextSibling;
    }

    return content;
  }

  /**
   * Update asset references in HTML content
   */
  private static updateAssetReferences(htmlContent: string, assets: HtmlAsset[]): string {
    let updatedContent = htmlContent;

    for (const asset of assets) {
      // Create secure URL for the asset
      const secureUrl = StorageService.createSecureUrl(asset.storedPath);
      
      // Replace references to the original path with secure URL
      const originalPath = asset.originalPath;
      const regex = new RegExp(originalPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      updatedContent = updatedContent.replace(regex, secureUrl);
    }

    return updatedContent;
  }

  /**
   * Find referenced assets in HTML content
   */
  private static findReferencedAssets(htmlContent: string): string[] {
    const assets: string[] = [];
    
    // Find images
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
    let match;
    while ((match = imgRegex.exec(htmlContent)) !== null) {
      assets.push(match[1]);
    }
    
    // Find CSS files
    const cssRegex = /<link[^>]+href=["']([^"']+\.css)["']/gi;
    while ((match = cssRegex.exec(htmlContent)) !== null) {
      assets.push(match[1]);
    }
    
    // Find JavaScript files
    const jsRegex = /<script[^>]+src=["']([^"']+\.js)["']/gi;
    while ((match = jsRegex.exec(htmlContent)) !== null) {
      assets.push(match[1]);
    }

    return assets;
  }

  /**
   * Helper methods
   */
  private static isCommonAsset(path: string): boolean {
    const commonAssets = ['style.css', 'main.css', 'book.css', 'cover.jpg', 'cover.png'];
    const filename = path.toLowerCase();
    return commonAssets.some(common => filename.includes(common));
  }

  private static getAssetType(ext: string): 'image' | 'css' | 'font' | 'script' {
    if (['.jpg', '.jpeg', '.png', '.gif', '.svg'].includes(ext)) return 'image';
    if (ext === '.css') return 'css';
    if (['.ttf', '.otf', '.woff', '.woff2'].includes(ext)) return 'font';
    if (ext === '.js') return 'script';
    return 'image'; // default
  }

  private static getAssetSubType(ext: string): string {
    if (['.jpg', '.jpeg', '.png', '.gif', '.svg'].includes(ext)) return 'images';
    if (ext === '.css') return 'stylesheets';
    if (['.ttf', '.otf', '.woff', '.woff2'].includes(ext)) return 'fonts';
    if (ext === '.js') return 'scripts';
    return 'other';
  }

  private static getMimeType(ext: string): string {
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.ttf': 'font/ttf',
      '.otf': 'font/otf',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
    };
    
    return mimeTypes[ext] || 'application/octet-stream';
  }

  private static extractTextFromHtml(html: string): string {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private static countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  private static generateAnchor(title: string, index: number): string {
    const baseAnchor = title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    
    return baseAnchor || `heading-${index}`;
  }
}

export default HtmlProcessingService;