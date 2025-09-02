import { query, transaction } from '../../utils/database';
import StorageService from './StorageService';
import EpubProcessingService from './EpubProcessingService';
import HtmlProcessingService from './HtmlProcessingService';
import { sanitizeForLog, sanitizeInt } from '../../utils/security';
import path from 'path';

export interface BookCreationData {
  // Basic Information
  title: string;
  subtitle?: string;
  author_id: number;
  category_id: number;
  isbn?: string;
  description?: string;
  short_description?: string;
  
  // Book Type and Format
  format: 'physical' | 'ebook' | 'both';
  primary_format?: 'epub' | 'html' | 'pdf' | 'hardcover' | 'paperback';
  
  // Pricing
  price: number;
  original_price?: number;
  cost_price?: number;
  currency?: string;
  
  // Physical Book Properties
  weight_grams?: number;
  dimensions?: { width: number; height: number; depth: number };
  shipping_class?: string;
  stock_quantity?: number;
  low_stock_threshold?: number;
  inventory_tracking?: boolean;
  
  // Digital Book Properties
  download_limit?: number;
  drm_protected?: boolean;
  
  // Metadata
  language?: string;
  pages?: number;
  publication_date?: string;
  publisher?: string;
  edition?: string;
  
  // Status and Visibility
  status?: 'draft' | 'published' | 'archived' | 'out_of_stock';
  is_featured?: boolean;
  is_bestseller?: boolean;
  is_new_release?: boolean;
  visibility?: 'public' | 'private' | 'members_only';
  
  // SEO
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  marketing_tags?: string[];
  
  // Files
  cover_image?: File;
  ebook_file?: File;
  sample_content?: File;
  
  // System
  created_by?: number;
}

export interface BookFormat {
  id: number;
  book_id: number;
  format_type: 'epub' | 'html' | 'pdf' | 'mobi' | 'azw3';
  file_path: string;
  file_size_bytes: number;
  file_hash: string;
  mime_type: string;
  is_primary: boolean;
  is_available: boolean;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  processing_error?: string;
  quality_score: number;
  created_at: string;
  updated_at: string;
}

export interface EnhancedBook {
  id: number;
  title: string;
  subtitle?: string;
  author_id: number;
  author_name?: string;
  category_id: number;
  category_name?: string;
  isbn?: string;
  description?: string;
  short_description?: string;
  format: 'physical' | 'ebook' | 'both';
  primary_format?: string;
  price: number;
  original_price?: number;
  cost_price?: number;
  currency: string;
  weight_grams?: number;
  dimensions?: any;
  shipping_class?: string;
  stock_quantity: number;
  low_stock_threshold: number;
  inventory_tracking: boolean;
  file_size_bytes?: number;
  download_limit: number;
  drm_protected: boolean;
  cover_image_path?: string;
  cover_image_url?: string;
  sample_content_path?: string;
  language: string;
  pages?: number;
  word_count?: number;
  reading_time_minutes?: number;
  publication_date?: string;
  publisher?: string;
  edition?: string;
  status: string;
  is_featured: boolean;
  is_bestseller: boolean;
  is_new_release: boolean;
  visibility: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  marketing_tags?: string[];
  view_count: number;
  download_count: number;
  purchase_count: number;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
  created_by?: number;
  updated_by?: number;
  formats?: BookFormat[];
}

export class ModernBookService {
  /**
   * Create a new book with file processing
   */
  static async createBook(bookData: BookCreationData): Promise<{
    success: boolean;
    book?: EnhancedBook;
    error?: string;
  }> {
    try {
      return await transaction(async (client) => {
        console.log('Creating book:', sanitizeForLog(bookData.title));

        // Insert book record
        const bookResult = await client.query(`
          INSERT INTO books (
            title, subtitle, author_id, category_id, isbn, description, short_description,
            format, primary_format, price, original_price, cost_price, currency,
            weight_grams, dimensions, shipping_class, stock_quantity, low_stock_threshold,
            inventory_tracking, download_limit, drm_protected, language, pages,
            publication_date, publisher, edition, status, is_featured, is_bestseller,
            is_new_release, visibility, seo_title, seo_description, seo_keywords,
            marketing_tags, created_by
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18,
            $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34,
            $35, $36, $37
          ) RETURNING *
        `, [
          bookData.title, bookData.subtitle, bookData.author_id, bookData.category_id,
          bookData.isbn, bookData.description, bookData.short_description,
          bookData.format, bookData.primary_format, bookData.price,
          bookData.original_price, bookData.cost_price, bookData.currency || 'NGN',
          bookData.weight_grams, bookData.dimensions ? JSON.stringify(bookData.dimensions) : null,
          bookData.shipping_class, bookData.stock_quantity || 0, bookData.low_stock_threshold || 5,
          bookData.inventory_tracking ?? true, bookData.download_limit || -1,
          bookData.drm_protected || false, bookData.language || 'en', bookData.pages,
          bookData.publication_date, bookData.publisher, bookData.edition,
          bookData.status || 'draft', bookData.is_featured || false,
          bookData.is_bestseller || false, bookData.is_new_release || false,
          bookData.visibility || 'public', bookData.seo_title, bookData.seo_description,
          bookData.seo_keywords, bookData.marketing_tags, bookData.created_by
        ]);

        const book = bookResult.rows[0];
        const bookId = book.id.toString();

        console.log('Book created with ID:', sanitizeForLog(bookId));

        // Process cover image if provided
        if (bookData.cover_image) {
          const coverResult = await this.processCoverImage(bookData.cover_image, bookId);
          if (coverResult.success) {
            await client.query(
              'UPDATE books SET cover_image_path = $1, cover_image_url = $2 WHERE id = $3',
              [coverResult.filePath, coverResult.secureUrl, book.id]
            );
            book.cover_image_path = coverResult.filePath;
            book.cover_image_url = coverResult.secureUrl;
          }
        }

        // Process ebook file if provided
        if (bookData.ebook_file && bookData.format !== 'physical') {
          const ebookResult = await this.processEbookFile(bookData.ebook_file, bookId);
          if (ebookResult.success) {
            // Create book format record
            await client.query(`
              INSERT INTO book_formats (
                book_id, format_type, file_path, file_size_bytes, file_hash,
                mime_type, is_primary, is_available, processing_status
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [
              book.id, ebookResult.format, ebookResult.filePath, ebookResult.fileSize,
              ebookResult.fileHash, ebookResult.mimeType, true, true, 'completed'
            ]);

            // Update book with file information
            await client.query(`
              UPDATE books SET 
                file_size_bytes = $1, 
                word_count = $2, 
                reading_time_minutes = $3,
                primary_format = $4
              WHERE id = $5
            `, [
              ebookResult.fileSize, ebookResult.wordCount, 
              ebookResult.readingTime, ebookResult.format, book.id
            ]);

            book.file_size_bytes = ebookResult.fileSize;
            book.word_count = ebookResult.wordCount;
            book.reading_time_minutes = ebookResult.readingTime;
            book.primary_format = ebookResult.format;
          }
        }

        // Get complete book data with relations
        const completeBook = await this.getBookById(book.id);
        
        return {
          success: true,
          book: completeBook,
        };
      });
    } catch (error) {
      console.error('Error creating book:', sanitizeForLog(error));
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error creating book',
      };
    }
  }

  /**
   * Process cover image and store on persistent volume
   */
  private static async processCoverImage(coverFile: File, bookId: string): Promise<{
    success: boolean;
    filePath?: string;
    secureUrl?: string;
    error?: string;
  }> {
    try {
      // Generate secure file path on persistent volume
      const filePath = StorageService.generateSecureFilePath(
        'cover',
        bookId,
        coverFile.name,
        'original'
      );

      // Store file on persistent volume
      const storeResult = await StorageService.storeFile(coverFile, filePath);
      
      if (!storeResult.success) {
        throw new Error(storeResult.error || 'Failed to store cover image');
      }

      // Create secure URL
      const secureUrl = StorageService.createSecureUrl(filePath);

      return {
        success: true,
        filePath,
        secureUrl,
      };
    } catch (error) {
      console.error('Error processing cover image:', sanitizeForLog(error));
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error processing cover image',
      };
    }
  }

  /**
   * Process ebook file and extract content
   */
  private static async processEbookFile(ebookFile: File, bookId: string): Promise<{
    success: boolean;
    filePath?: string;
    fileSize?: number;
    fileHash?: string;
    mimeType?: string;
    format?: string;
    wordCount?: number;
    readingTime?: number;
    error?: string;
  }> {
    try {
      const ext = path.extname(ebookFile.name).toLowerCase();
      let format: string;
      
      // Determine format
      if (ext === '.epub') {
        format = 'epub';
      } else if (ext === '.html' || ext === '.htm' || ext === '.zip') {
        format = 'html';
      } else {
        throw new Error(`Unsupported ebook format: ${ext}`);
      }

      // Generate secure file path on persistent volume
      const filePath = StorageService.generateSecureFilePath(
        'book',
        bookId,
        ebookFile.name,
        format
      );

      // Store original file on persistent volume
      const storeResult = await StorageService.storeFile(ebookFile, filePath);
      
      if (!storeResult.success) {
        throw new Error(storeResult.error || 'Failed to store ebook file');
      }

      // Process content based on format
      let wordCount = 0;
      let readingTime = 0;

      if (format === 'epub') {
        const processResult = await EpubProcessingService.processEpubFile(filePath, bookId);
        if (processResult.success && processResult.data) {
          wordCount = processResult.data.wordCount;
          readingTime = processResult.data.estimatedReadingTime;
          
          // Store processed content in database
          await this.storeEpubContent(bookId, processResult.data);
        }
      } else if (format === 'html') {
        const processResult = await HtmlProcessingService.processHtmlBook(filePath, bookId);
        if (processResult.success && processResult.data) {
          wordCount = processResult.data.metadata.wordCount;
          readingTime = processResult.data.metadata.estimatedReadingTime;
          
          // Store processed content in database
          await this.storeHtmlContent(bookId, processResult.data);
        }
      }

      return {
        success: true,
        filePath,
        fileSize: storeResult.fileSize,
        fileHash: storeResult.fileHash,
        mimeType: ebookFile.type,
        format,
        wordCount,
        readingTime,
      };
    } catch (error) {
      console.error('Error processing ebook file:', sanitizeForLog(error));
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error processing ebook file',
      };
    }
  }

  /**
   * Store EPUB content in database
   */
  private static async storeEpubContent(bookId: string, epubData: {
    tableOfContents: unknown[];
    chapters: Array<{ order: number; title: string; content: string; wordCount: number }>;
    metadata: Record<string, unknown>;
    assets: Array<{ isImage?: boolean; isCss?: boolean; isFont?: boolean; href: string; data: Buffer; mediaType: string }>;
  }): Promise<void> {
    await transaction(async (client) => {
      // Store content structure
      const structureResult = await client.query(`
        INSERT INTO book_content_structure (
          book_id, table_of_contents, chapter_count, content_metadata,
          navigation_structure, extraction_method, extraction_version
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
      `, [
        bookId,
        JSON.stringify(epubData.tableOfContents),
        epubData.chapters.length,
        JSON.stringify(epubData.metadata),
        JSON.stringify({ type: 'epub', structure: 'linear' }),
        'epub-parser',
        '1.0'
      ]);

      const structureId = structureResult.rows[0].id;

      // Store chapters concurrently
      const chapterPromises = epubData.chapters.map(chapter => 
        client.query(`
          INSERT INTO book_chapters (
            book_id, structure_id, chapter_number, chapter_title,
            content_html, word_count, reading_time_minutes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          bookId, structureId, chapter.order + 1, chapter.title,
          chapter.content, chapter.wordCount, Math.ceil(chapter.wordCount / 200)
        ])
      );
      await Promise.all(chapterPromises);

      // Store assets concurrently
      const assetPromises = epubData.assets.map(asset => 
        client.query(`
          INSERT INTO book_assets (
            book_id, asset_type, asset_path, original_path, file_size_bytes, mime_type
          ) VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          bookId,
          asset.isImage ? 'image' : asset.isCss ? 'stylesheet' : asset.isFont ? 'font' : 'other',
          asset.href,
          asset.href,
          asset.data.length,
          asset.mediaType
        ])
      );
      await Promise.all(assetPromises);
    });
  }

  /**
   * Store HTML content in database
   */
  private static async storeHtmlContent(bookId: string, htmlData: {
    tableOfContents: unknown[];
    chapters: Array<{ order: number; title: string; content: string; wordCount: number }>;
    metadata: Record<string, unknown>;
    assets: Array<{ type: string; storedPath: string; originalPath: string; data?: Buffer; mimeType: string }>;
  }): Promise<void> {
    await transaction(async (client) => {
      // Store content structure
      const structureResult = await client.query(`
        INSERT INTO book_content_structure (
          book_id, table_of_contents, chapter_count, content_metadata,
          navigation_structure, extraction_method, extraction_version
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
      `, [
        bookId,
        JSON.stringify(htmlData.tableOfContents),
        htmlData.chapters.length,
        JSON.stringify(htmlData.metadata),
        JSON.stringify({ type: 'html', structure: 'single-file' }),
        'html-parser',
        '1.0'
      ]);

      const structureId = structureResult.rows[0].id;

      // Store chapters concurrently
      const chapterPromises = htmlData.chapters.map(chapter => 
        client.query(`
          INSERT INTO book_chapters (
            book_id, structure_id, chapter_number, chapter_title,
            content_html, word_count, reading_time_minutes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          bookId, structureId, chapter.order + 1, chapter.title,
          chapter.content, chapter.wordCount, Math.ceil(chapter.wordCount / 200)
        ])
      );
      await Promise.all(chapterPromises);

      // Store assets concurrently
      const assetPromises = htmlData.assets.map(asset => 
        client.query(`
          INSERT INTO book_assets (
            book_id, asset_type, asset_path, original_path, file_size_bytes, mime_type
          ) VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          bookId, asset.type, asset.storedPath, asset.originalPath, asset.data?.length || 0, asset.mimeType
        ])
      );
      await Promise.all(assetPromises);
    });
  }

  /**
   * Get book by ID with all related data
   */
  static async getBookById(bookId: number): Promise<EnhancedBook | null> {
    try {
      const result = await query(`
        SELECT 
          b.*,
          a.name as author_name,
          c.name as category_name
        FROM books b
        LEFT JOIN authors a ON b.author_id = a.id
        LEFT JOIN categories c ON b.category_id = c.id
        WHERE b.id = $1
      `, [bookId]);

      if (result.rows.length === 0) {
        return null;
      }

      const book = result.rows[0];

      // Get formats
      const formatsResult = await query(`
        SELECT * FROM book_formats WHERE book_id = $1 ORDER BY is_primary DESC, created_at ASC
      `, [bookId]);

      book.formats = formatsResult.rows;

      return book;
    } catch (error) {
      console.error('Error getting book by ID:', sanitizeForLog(error));
      return null;
    }
  }

  /**
   * Get books with pagination and filters
   */
  static async getBooks(filters: {
    search?: string;
    category_id?: number;
    author_id?: number;
    format?: string;
    status?: string;
    is_featured?: boolean;
    is_bestseller?: boolean;
    is_new_release?: boolean;
    visibility?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    books: EnhancedBook[];
    total: number;
    pages: number;
    currentPage: number;
  }> {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const offset = (page - 1) * limit;

      let whereClause = 'WHERE 1=1';
      const params: unknown[] = [];
      let paramIndex = 1;

      // Build where clause
      if (filters.search) {
        whereClause += ` AND (b.search_vector @@ plainto_tsquery($${paramIndex}) OR b.title ILIKE $${paramIndex + 1} OR b.isbn ILIKE $${paramIndex + 2})`;
        params.push(filters.search, `%${filters.search}%`, `%${filters.search}%`);
        paramIndex += 3;
      }

      if (filters.category_id) {
        whereClause += ` AND b.category_id = $${paramIndex}`;
        params.push(filters.category_id);
        paramIndex++;
      }

      if (filters.author_id) {
        whereClause += ` AND b.author_id = $${paramIndex}`;
        params.push(filters.author_id);
        paramIndex++;
      }

      if (filters.format) {
        whereClause += ` AND b.format = $${paramIndex}`;
        params.push(filters.format);
        paramIndex++;
      }

      if (filters.status) {
        whereClause += ` AND b.status = $${paramIndex}`;
        params.push(filters.status);
        paramIndex++;
      }

      if (filters.is_featured !== undefined) {
        whereClause += ` AND b.is_featured = $${paramIndex}`;
        params.push(filters.is_featured);
        paramIndex++;
      }

      if (filters.is_bestseller !== undefined) {
        whereClause += ` AND b.is_bestseller = $${paramIndex}`;
        params.push(filters.is_bestseller);
        paramIndex++;
      }

      if (filters.is_new_release !== undefined) {
        whereClause += ` AND b.is_new_release = $${paramIndex}`;
        params.push(filters.is_new_release);
        paramIndex++;
      }

      if (filters.visibility) {
        whereClause += ` AND b.visibility = $${paramIndex}`;
        params.push(filters.visibility);
        paramIndex++;
      }

      // Get total count
      const countResult = await query(`
        SELECT COUNT(*) as total
        FROM books b
        ${whereClause}
      `, params);

      const total = parseInt(countResult.rows[0].total);
      const pages = Math.ceil(total / limit);

      // Get books
      const booksResult = await query(`
        SELECT 
          b.*,
          a.name as author_name,
          c.name as category_name
        FROM books b
        LEFT JOIN authors a ON b.author_id = a.id
        LEFT JOIN categories c ON b.category_id = c.id
        ${whereClause}
        ORDER BY b.created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `, [...params, limit, offset]);

      const books = booksResult.rows.map(book => {
        // Convert cover_image_url to use consistent API route only if not already an API URL
        if (book.cover_image_url && !book.cover_image_url.startsWith('/api/images/covers/')) {
          const filename = book.cover_image_url.split('/').pop();
          book.cover_image_url = `/api/images/covers/${filename}`;
        }
        return book;
      });

      // Get formats for all books
      if (books.length > 0) {
        const bookIds = books.map(book => book.id);
        const formatsResult = await query(`
          SELECT * FROM book_formats 
          WHERE book_id = ANY($1) 
          ORDER BY book_id, is_primary DESC, created_at ASC
        `, [bookIds]);

        // Group formats by book_id
        const formatsByBookId = formatsResult.rows.reduce((acc, format) => {
          if (!acc[format.book_id]) {
            acc[format.book_id] = [];
          }
          acc[format.book_id].push(format);
          return acc;
        }, {} as Record<number, BookFormat[]>);

        // Attach formats to books
        books.forEach(book => {
          book.formats = formatsByBookId[book.id] || [];
        });
      }

      return {
        books,
        total,
        pages,
        currentPage: page,
      };
    } catch (error) {
      console.error('Error getting books:', sanitizeForLog(error));
      return {
        books: [],
        total: 0,
        pages: 0,
        currentPage: 1,
      };
    }
  }

  /**
   * Update book
   */
  static async updateBook(bookId: number, updateData: Partial<BookCreationData>): Promise<{
    success: boolean;
    book?: EnhancedBook;
    error?: string;
  }> {
    try {
      return await transaction(async (client) => {
        // Build update query
        const updateFields: string[] = [];
        const updateValues: unknown[] = [];
        let paramIndex = 1;

        const allowedFields = [
          'title', 'subtitle', 'author_id', 'category_id', 'isbn', 'description',
          'short_description', 'format', 'primary_format', 'price', 'original_price',
          'cost_price', 'currency', 'weight_grams', 'dimensions', 'shipping_class',
          'stock_quantity', 'low_stock_threshold', 'inventory_tracking', 'download_limit',
          'drm_protected', 'language', 'pages', 'publication_date', 'publisher',
          'edition', 'status', 'is_featured', 'is_bestseller', 'is_new_release',
          'visibility', 'seo_title', 'seo_description', 'seo_keywords', 'marketing_tags'
        ];

        for (const field of allowedFields) {
          if (updateData[field as keyof BookCreationData] !== undefined) {
            updateFields.push(`${field} = $${paramIndex}`);
            let value = updateData[field as keyof BookCreationData];
            
            // Handle JSON fields
            if (field === 'dimensions' && value) {
              value = JSON.stringify(value);
            }
            if (field === 'marketing_tags' && value) {
              value = JSON.stringify(value);
            }
            
            updateValues.push(value);
            paramIndex++;
          }
        }

        if (updateFields.length === 0) {
          return {
            success: true,
            book: await this.getBookById(bookId),
          };
        }

        updateFields.push('updated_at = CURRENT_TIMESTAMP');
        updateValues.push(bookId);

        const updateQuery = `
          UPDATE books 
          SET ${updateFields.join(', ')}
          WHERE id = $${paramIndex}
          RETURNING *
        `;

        const result = await client.query(updateQuery, updateValues);

        if (result.rows.length === 0) {
          throw new Error('Book not found');
        }

        const updatedBook = await this.getBookById(bookId);

        return {
          success: true,
          book: updatedBook,
        };
      });
    } catch (error) {
      console.error('Error updating book:', sanitizeForLog(error));
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error updating book',
      };
    }
  }

  /**
   * Delete book and all associated files
   */
  static async deleteBook(bookId: number): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      return await transaction(async (client) => {
        // Get book data to find files to delete
        const book = await this.getBookById(bookId);
        if (!book) {
          throw new Error('Book not found');
        }

        // Get all file paths to delete from persistent volume
        const filesToDelete: string[] = [];
        
        if (book.cover_image_path) {
          filesToDelete.push(book.cover_image_path);
        }

        // Get format files
        if (book.formats) {
          for (const format of book.formats) {
            filesToDelete.push(format.file_path);
          }
        }

        // Get asset files
        const assetsResult = await client.query(
          'SELECT asset_path FROM book_assets WHERE book_id = $1',
          [bookId]
        );
        
        for (const asset of assetsResult.rows) {
          filesToDelete.push(asset.asset_path);
        }

        // Delete from all related tables in correct order to avoid foreign key violations
        await client.query('DELETE FROM order_items WHERE book_id = $1', [bookId]);
        await client.query('DELETE FROM cart_items WHERE book_id = $1', [bookId]);
        await client.query('DELETE FROM user_library WHERE book_id = $1', [bookId]);
        await client.query('DELETE FROM reading_progress WHERE book_id = $1', [bookId]);
        await client.query('DELETE FROM book_reviews WHERE book_id = $1', [bookId]);
        await client.query('DELETE FROM book_chapters WHERE book_id = $1', [bookId]);
        await client.query('DELETE FROM book_assets WHERE book_id = $1', [bookId]);
        await client.query('DELETE FROM book_content_structure WHERE book_id = $1', [bookId]);
        await client.query('DELETE FROM book_formats WHERE book_id = $1', [bookId]);
        
        // Finally delete the book itself
        await client.query('DELETE FROM books WHERE id = $1', [bookId]);

        // Delete files from persistent volume
        for (const filePath of filesToDelete) {
          try {
            await StorageService.deleteFile(filePath);
          } catch (error) {
            console.warn(`Failed to delete file ${filePath}:`, error);
          }
        }

        return { success: true };
      });
    } catch (error) {
      console.error('Error deleting book:', sanitizeForLog(error));
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error deleting book',
      };
    }
  }
}

export default ModernBookService;