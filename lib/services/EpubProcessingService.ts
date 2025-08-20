import JSZip from 'jszip';
import { DOMParser } from '@xmldom/xmldom';
import StorageService from './StorageService';
import path from 'path';
import fs from 'fs/promises';

export interface EpubMetadata {
  title: string;
  author: string;
  publisher?: string;
  language?: string;
  isbn?: string;
  description?: string;
  publicationDate?: string;
  rights?: string;
  subjects?: string[];
}

export interface EpubChapter {
  id: string;
  title: string;
  href: string;
  content: string;
  wordCount: number;
  order: number;
}

export interface EpubTableOfContents {
  chapters: Array<{
    id: string;
    title: string;
    href: string;
    order: number;
    children?: Array<{
      id: string;
      title: string;
      href: string;
      order: number;
    }>;
  }>;
}

export interface EpubAsset {
  id: string;
  href: string;
  mediaType: string;
  data: Buffer;
  isImage: boolean;
  isCss: boolean;
  isFont: boolean;
}

export interface ProcessedEpub {
  metadata: EpubMetadata;
  chapters: EpubChapter[];
  tableOfContents: EpubTableOfContents;
  assets: EpubAsset[];
  coverImage?: EpubAsset;
  wordCount: number;
  estimatedReadingTime: number; // in minutes
}

export class EpubProcessingService {
  private static readonly WORDS_PER_MINUTE = 200; // Average reading speed

  /**
   * Process EPUB file from persistent volume
   */
  static async processEpubFile(filePath: string, bookId: string): Promise<{
    success: boolean;
    data?: ProcessedEpub;
    error?: string;
  }> {
    try {
      console.log(`Processing EPUB file: ${filePath}`);

      // Verify file exists on persistent volume
      const fileInfo = await StorageService.getFileInfo(filePath);
      if (!fileInfo.exists) {
        throw new Error('EPUB file not found on persistent volume');
      }

      // Read EPUB file from persistent volume
      const epubBuffer = await fs.readFile(filePath);
      const zip = await JSZip.loadAsync(epubBuffer);

      // Extract metadata
      const metadata = await this.extractMetadata(zip);
      console.log('Extracted metadata:', metadata);

      // Extract table of contents
      const tableOfContents = await this.extractTableOfContents(zip);
      console.log('Extracted TOC with', tableOfContents.chapters.length, 'chapters');

      // Extract chapters
      const chapters = await this.extractChapters(zip, tableOfContents);
      console.log('Extracted', chapters.length, 'chapters');

      // Extract assets (images, CSS, fonts)
      const assets = await this.extractAssets(zip, bookId);
      console.log('Extracted', assets.length, 'assets');

      // Find cover image
      const coverImage = await this.findCoverImage(zip, assets);

      // Calculate reading statistics
      const wordCount = chapters.reduce((total, chapter) => total + chapter.wordCount, 0);
      const estimatedReadingTime = Math.ceil(wordCount / this.WORDS_PER_MINUTE);

      const processedEpub: ProcessedEpub = {
        metadata,
        chapters,
        tableOfContents,
        assets,
        coverImage,
        wordCount,
        estimatedReadingTime,
      };

      console.log(`Successfully processed EPUB: ${wordCount} words, ${estimatedReadingTime} min read time`);

      return {
        success: true,
        data: processedEpub,
      };
    } catch (error) {
      console.error('Error processing EPUB:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error processing EPUB',
      };
    }
  }

  /**
   * Extract metadata from EPUB
   */
  private static async extractMetadata(zip: JSZip): Promise<EpubMetadata> {
    try {
      // Find and parse container.xml
      const containerFile = zip.file('META-INF/container.xml');
      if (!containerFile) {
        throw new Error('Invalid EPUB: Missing container.xml');
      }

      const containerXml = await containerFile.async('text');
      const containerDoc = new DOMParser().parseFromString(containerXml, 'text/xml');
      
      // Get OPF file path
      const rootfileElement = containerDoc.getElementsByTagName('rootfile')[0];
      if (!rootfileElement) {
        throw new Error('Invalid EPUB: Missing rootfile in container.xml');
      }

      const opfPath = rootfileElement.getAttribute('full-path');
      if (!opfPath) {
        throw new Error('Invalid EPUB: Missing full-path in rootfile');
      }

      // Parse OPF file
      const opfFile = zip.file(opfPath);
      if (!opfFile) {
        throw new Error(`Invalid EPUB: Missing OPF file at ${opfPath}`);
      }

      const opfXml = await opfFile.async('text');
      const opfDoc = new DOMParser().parseFromString(opfXml, 'text/xml');

      // Extract metadata
      const metadata: EpubMetadata = {
        title: this.getMetadataValue(opfDoc, 'title') || 'Unknown Title',
        author: this.getMetadataValue(opfDoc, 'creator') || 'Unknown Author',
        publisher: this.getMetadataValue(opfDoc, 'publisher'),
        language: this.getMetadataValue(opfDoc, 'language') || 'en',
        isbn: this.getMetadataValue(opfDoc, 'identifier'),
        description: this.getMetadataValue(opfDoc, 'description'),
        publicationDate: this.getMetadataValue(opfDoc, 'date'),
        rights: this.getMetadataValue(opfDoc, 'rights'),
        subjects: this.getMetadataValues(opfDoc, 'subject'),
      };

      return metadata;
    } catch (error) {
      console.error('Error extracting metadata:', error);
      return {
        title: 'Unknown Title',
        author: 'Unknown Author',
        language: 'en',
      };
    }
  }

  /**
   * Extract table of contents from EPUB
   */
  private static async extractTableOfContents(zip: JSZip): Promise<EpubTableOfContents> {
    try {
      // Try to find NCX file first
      const ncxFile = zip.file(/\.ncx$/)[0];
      if (ncxFile) {
        return await this.parseNcxTableOfContents(ncxFile);
      }

      // Fallback to parsing spine from OPF
      return await this.parseSpineTableOfContents(zip);
    } catch (error) {
      console.error('Error extracting table of contents:', error);
      return { chapters: [] };
    }
  }

  /**
   * Parse NCX table of contents
   */
  private static async parseNcxTableOfContents(ncxFile: JSZip.JSZipObject): Promise<EpubTableOfContents> {
    const ncxXml = await ncxFile.async('text');
    const ncxDoc = new DOMParser().parseFromString(ncxXml, 'text/xml');
    
    const navPoints = ncxDoc.getElementsByTagName('navPoint');
    const chapters: EpubTableOfContents['chapters'] = [];

    for (let i = 0; i < navPoints.length; i++) {
      const navPoint = navPoints[i];
      const id = navPoint.getAttribute('id') || `chapter-${i}`;
      
      const navLabel = navPoint.getElementsByTagName('navLabel')[0];
      const title = navLabel?.getElementsByTagName('text')[0]?.textContent || `Chapter ${i + 1}`;
      
      const content = navPoint.getElementsByTagName('content')[0];
      const href = content?.getAttribute('src') || '';
      
      chapters.push({
        id,
        title,
        href,
        order: i,
      });
    }

    return { chapters };
  }

  /**
   * Parse spine-based table of contents
   */
  private static async parseSpineTableOfContents(zip: JSZip): Promise<EpubTableOfContents> {
    // Find OPF file
    const containerFile = zip.file('META-INF/container.xml');
    if (!containerFile) {
      throw new Error('Missing container.xml');
    }

    const containerXml = await containerFile.async('text');
    const containerDoc = new DOMParser().parseFromString(containerXml, 'text/xml');
    const opfPath = containerDoc.getElementsByTagName('rootfile')[0]?.getAttribute('full-path');
    
    if (!opfPath) {
      throw new Error('Missing OPF path');
    }

    const opfFile = zip.file(opfPath);
    if (!opfFile) {
      throw new Error('Missing OPF file');
    }

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

    const chapters: EpubTableOfContents['chapters'] = [];
    
    for (let i = 0; i < spineItems.length; i++) {
      const spineItem = spineItems[i];
      const idref = spineItem.getAttribute('idref');
      
      if (idref && manifestMap.has(idref)) {
        const manifestItem = manifestMap.get(idref)!;
        
        chapters.push({
          id: idref,
          title: `Chapter ${i + 1}`,
          href: manifestItem.href,
          order: i,
        });
      }
    }

    return { chapters };
  }

  /**
   * Extract chapters content
   */
  private static async extractChapters(zip: JSZip, toc: EpubTableOfContents): Promise<EpubChapter[]> {
    const chapters: EpubChapter[] = [];

    for (const tocChapter of toc.chapters) {
      try {
        const chapterFile = zip.file(tocChapter.href);
        if (!chapterFile) {
          console.warn(`Chapter file not found: ${tocChapter.href}`);
          continue;
        }

        const chapterHtml = await chapterFile.async('text');
        
        // Clean and extract text content
        const textContent = this.extractTextFromHtml(chapterHtml);
        const wordCount = this.countWords(textContent);

        chapters.push({
          id: tocChapter.id,
          title: tocChapter.title,
          href: tocChapter.href,
          content: chapterHtml,
          wordCount,
          order: tocChapter.order,
        });
      } catch (error) {
        console.error(`Error processing chapter ${tocChapter.href}:`, error);
      }
    }

    return chapters;
  }

  /**
   * Extract assets (images, CSS, fonts) and store on persistent volume
   */
  private static async extractAssets(zip: JSZip, bookId: string): Promise<EpubAsset[]> {
    const assets: EpubAsset[] = [];
    const assetExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.css', '.ttf', '.otf', '.woff', '.woff2'];

    for (const [relativePath, file] of Object.entries(zip.files)) {
      if (file.dir) continue;

      const ext = path.extname(relativePath).toLowerCase();
      if (!assetExtensions.includes(ext)) continue;

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
            id: relativePath,
            href: relativePath,
            mediaType: this.getMimeType(ext),
            data,
            isImage: ['.jpg', '.jpeg', '.png', '.gif', '.svg'].includes(ext),
            isCss: ext === '.css',
            isFont: ['.ttf', '.otf', '.woff', '.woff2'].includes(ext),
          });
        }
      } catch (error) {
        console.error(`Error processing asset ${relativePath}:`, error);
      }
    }

    return assets;
  }

  /**
   * Find cover image
   */
  private static async findCoverImage(zip: JSZip, assets: EpubAsset[]): Promise<EpubAsset | undefined> {
    // Look for common cover image names
    const coverNames = ['cover.jpg', 'cover.png', 'cover.jpeg', 'cover.gif'];
    
    for (const asset of assets) {
      if (asset.isImage) {
        const filename = path.basename(asset.href).toLowerCase();
        if (coverNames.includes(filename) || filename.includes('cover')) {
          return asset;
        }
      }
    }

    // Return first image if no cover found
    return assets.find(asset => asset.isImage);
  }

  /**
   * Helper methods
   */
  private static getMetadataValue(doc: Document, tagName: string): string | undefined {
    const elements = doc.getElementsByTagName(`dc:${tagName}`);
    return elements.length > 0 ? elements[0].textContent || undefined : undefined;
  }

  private static getMetadataValues(doc: Document, tagName: string): string[] {
    const elements = doc.getElementsByTagName(`dc:${tagName}`);
    const values: string[] = [];
    
    for (let i = 0; i < elements.length; i++) {
      const value = elements[i].textContent;
      if (value) values.push(value);
    }
    
    return values;
  }

  private static extractTextFromHtml(html: string): string {
    // Remove HTML tags and extract text content
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

  private static getAssetSubType(ext: string): string {
    if (['.jpg', '.jpeg', '.png', '.gif', '.svg'].includes(ext)) return 'images';
    if (ext === '.css') return 'stylesheets';
    if (['.ttf', '.otf', '.woff', '.woff2'].includes(ext)) return 'fonts';
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
      '.ttf': 'font/ttf',
      '.otf': 'font/otf',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
    };
    
    return mimeTypes[ext] || 'application/octet-stream';
  }
}

export default EpubProcessingService;