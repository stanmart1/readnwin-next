import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import { ProcessedContent, TableOfContentsItem } from '@/types/ereader';

export class ContentProcessor {
  private static instance: ContentProcessor;
  
  public static getInstance(): ContentProcessor {
    if (!ContentProcessor.instance) {
      ContentProcessor.instance = new ContentProcessor();
    }
    return ContentProcessor.instance;
  }

  /**
   * Process markdown content into HTML and extract metadata
   */
  public async processMarkdown(markdown: string): Promise<ProcessedContent> {
    try {
      // Clean and ensure the markdown content is properly formatted
      const cleanedMarkdown = this.ensureCleanContent(markdown, 'markdown');
      
      const processor = unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeRaw)
        .use(rehypeSanitize)
        .use(rehypeStringify);

      const result = await processor.process(cleanedMarkdown);
      const html = String(result);
      
      return this.createProcessedContent(html, cleanedMarkdown, 'markdown');
    } catch (error) {
      console.error('Error processing markdown:', error);
      throw new Error('Failed to process markdown content');
    }
  }

  /**
   * Process HTML content and sanitize it
   */
  public async processHTML(html: string): Promise<ProcessedContent> {
    try {
      // Clean and ensure the HTML content is properly formatted
      const cleanedHtml = this.ensureCleanContent(html, 'html');
      
      const processor = unified()
        .use(rehypeRaw)
        .use(rehypeSanitize)
        .use(rehypeStringify);

      // Extract plain text safely (works on both server and client)
      const plainText = this.extractPlainText(cleanedHtml);

      const result = await processor.process(cleanedHtml);
      const sanitizedHtml = String(result);
      
      return this.createProcessedContent(sanitizedHtml, plainText, 'html');
    } catch (error) {
      console.error('Error processing HTML:', error);
      throw new Error('Failed to process HTML content');
    }
  }

  /**
   * Create ProcessedContent object with metadata
   */
  private createProcessedContent(html: string, originalText: string, contentType?: 'markdown' | 'html'): ProcessedContent {
    const plainText = this.extractPlainText(html);
    const wordCount = this.calculateWordCount(plainText);
    const estimatedReadingTime = this.calculateReadingTime(wordCount);
    const tableOfContents = this.extractTableOfContents(html);

    // For markdown, use original text; for HTML, use extracted plain text
    const finalPlainText = contentType === 'markdown' ? originalText : plainText;

    return {
      html: this.addContentAnchors(html),
      plainText: finalPlainText,
      wordCount,
      estimatedReadingTime,
      tableOfContents,
    };
  }

  /**
   * Extract plain text from HTML
   */
  private extractPlainText(html: string): string {
    if (typeof window === 'undefined') {
      // Server-side: simple regex-based extraction
      return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    }
    
    // Client-side: use DOM parsing
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  }

  /**
   * Calculate word count from text
   */
  private calculateWordCount(text: string): number {
    return text
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0)
      .length;
  }

  /**
   * Calculate estimated reading time (average 200 WPM)
   */
  private calculateReadingTime(wordCount: number): number {
    const averageWPM = 200;
    return Math.ceil(wordCount / averageWPM);
  }

  /**
   * Extract table of contents from HTML headings
   */
  private extractTableOfContents(html: string): TableOfContentsItem[] {
    const headings: TableOfContentsItem[] = [];
    
    if (typeof window === 'undefined') {
      // Server-side: regex-based extraction
      const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi;
      let match;
      let position = 0;
      
      while ((match = headingRegex.exec(html)) !== null) {
        const level = parseInt(match[1]);
        const title = this.extractPlainText(match[2]);
        const id = this.generateHeadingId(title);
        
        headings.push({
          id,
          title,
          level,
          position: match.index,
        });
      }
    } else {
      // Client-side: DOM parsing
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      const headingElements = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
      
      headingElements.forEach((heading, index) => {
        const level = parseInt(heading.tagName.charAt(1));
        const title = heading.textContent || '';
        const id = this.generateHeadingId(title);
        
        headings.push({
          id,
          title,
          level,
          position: index * 100, // Approximate position
        });
      });
    }

    return this.buildNestedTableOfContents(headings);
  }

  /**
   * Generate heading ID from title
   */
  private generateHeadingId(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * Build nested table of contents structure
   */
  private buildNestedTableOfContents(headings: TableOfContentsItem[]): TableOfContentsItem[] {
    const nested: TableOfContentsItem[] = [];
    const stack: TableOfContentsItem[] = [];

    headings.forEach((heading) => {
      const item = { ...heading, children: [] };

      // Find the appropriate parent
      while (stack.length > 0 && stack[stack.length - 1].level >= item.level) {
        stack.pop();
      }

      if (stack.length === 0) {
        nested.push(item);
      } else {
        const parent = stack[stack.length - 1];
        if (!parent.children) parent.children = [];
        parent.children.push(item);
      }

      stack.push(item);
    });

    return nested;
  }

  /**
   * Add anchor IDs to headings in HTML for navigation
   */
  private addContentAnchors(html: string): string {
    return html.replace(
      /<h([1-6])([^>]*)>(.*?)<\/h[1-6]>/gi,
      (match, level, attributes, content) => {
        const plainContent = this.extractPlainText(content);
        const id = this.generateHeadingId(plainContent);
        
        // Check if ID already exists in attributes
        if (attributes.includes('id=')) {
          return match;
        }
        
        return `<h${level}${attributes} id="${id}">${content}</h${level}>`;
      }
    );
  }

  /**
   * Preprocess content for better text selection and highlighting
   */
  public preprocessForHighlighting(html: string): string {
    // Add data attributes for text selection
    return html.replace(
      /(<p[^>]*>)(.*?)(<\/p>)/gi,
      (match, openTag, content, closeTag) => {
        // Wrap text nodes in spans for precise highlighting
        const processedContent = content.replace(
          /([^<]+)/g,
          '<span class="selectable-text">$1</span>'
        );
        return openTag + processedContent + closeTag;
      }
    );
  }

  /**
   * Extract text content between two character positions
   */
  public extractTextBetweenPositions(
    plainText: string, 
    startPos: number, 
    endPos: number
  ): string {
    return plainText.substring(startPos, endPos).trim();
  }

  /**
   * Find text position in HTML content
   */
  public findTextPositionInHTML(html: string, searchText: string): number {
    const plainText = this.extractPlainText(html);
    return plainText.indexOf(searchText);
  }

  /**
   * Calculate reading progress based on scroll position
   */
  public calculateReadingProgress(
    scrollTop: number,
    scrollHeight: number,
    clientHeight: number
  ): number {
    const maxScroll = scrollHeight - clientHeight;
    if (maxScroll <= 0) return 100;
    
    const progress = (scrollTop / maxScroll) * 100;
    return Math.min(100, Math.max(0, progress));
  }

  /**
   * Estimate words read based on scroll position
   */
  public estimateWordsRead(
    scrollProgress: number,
    totalWordCount: number
  ): number {
    return Math.floor((scrollProgress / 100) * totalWordCount);
  }

  /**
   * Generate a summary of content for quick preview
   */
  public generateContentSummary(plainText: string, maxLength: number = 300): string {
    if (plainText.length <= maxLength) {
      return plainText;
    }

    // Find the last complete sentence within the limit
    const truncated = plainText.substring(0, maxLength);
    const lastSentenceEnd = Math.max(
      truncated.lastIndexOf('.'),
      truncated.lastIndexOf('!'),
      truncated.lastIndexOf('?')
    );

    if (lastSentenceEnd > maxLength * 0.7) {
      return truncated.substring(0, lastSentenceEnd + 1);
    }

    // If no good sentence break, find last space
    const lastSpace = truncated.lastIndexOf(' ');
    return truncated.substring(0, lastSpace) + '...';
  }

  /**
   * Validate content format
   */
  public validateContent(content: string, type: 'markdown' | 'html'): boolean {
    if (!content || content.trim().length === 0) {
      return false;
    }

    if (type === 'html') {
      // Basic HTML validation
      const htmlRegex = /<[^>]+>/;
      return htmlRegex.test(content);
    }

    if (type === 'markdown') {
      // Basic markdown validation (looking for markdown syntax)
      const markdownRegex = /[#*_`\[\]()]/;
      return markdownRegex.test(content) || content.length > 0;
    }

    return true;
  }

  /**
   * Check if content contains raw HTML tags that might be displayed
   */
  public hasRawHtmlTags(content: string): boolean {
    // Check for common HTML tags that might be displayed as text
    const rawHtmlPatterns = [
      /&lt;/g,  // <
      /&gt;/g,  // >
      /&amp;/g, // &
      /&quot;/g, // "
      /&#39;/g, // '
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi
    ];

    return rawHtmlPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Clean raw HTML entities that might be displayed as text
   */
  public cleanRawHtmlEntities(content: string): string {
    return content
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
      .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(parseInt(dec, 10)));
  }

  /**
   * Clean and normalize content
   */
  public normalizeContent(content: string): string {
    return content
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  /**
   * Ensure content is properly formatted for display
   */
  public ensureCleanContent(content: string, type: 'markdown' | 'html'): string {
    // First clean any HTML entities
    let cleanedContent = this.cleanRawHtmlEntities(content);
    
    if (type === 'markdown') {
      // For markdown, ensure we don't have any raw HTML tags that would be displayed
      cleanedContent = cleanedContent.replace(/<[^>]*>/g, '');
    } else {
      // For HTML, ensure it's properly sanitized
      cleanedContent = cleanedContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      cleanedContent = cleanedContent.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    }
    
    return this.normalizeContent(cleanedContent);
  }
} 