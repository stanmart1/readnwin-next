import { query, transaction } from './database';

export interface BookFormat {
  id: number;
  book_id: number;
  format: 'ebook' | 'physical' | 'audiobook';
  file_url?: string;
  file_size?: number;
  file_type?: string;
  is_available: boolean;
  price?: number;
  created_at: string;
  updated_at: string;
}

export interface BookUpload {
  id: number;
  book_id: number;
  upload_type: 'cover' | 'ebook' | 'audiobook' | 'sample';
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  upload_status: 'pending' | 'processing' | 'completed' | 'failed';
  processing_metadata?: any;
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
  cover_image_url?: string;
  sample_pdf_url?: string;
  ebook_file_url?: string;
  audiobook_file_url?: string;
  format: string;
  language: string;
  pages?: number;
  publication_date?: string;
  publisher?: string;
  price: number;
  original_price?: number;
  cost_price?: number;
  weight_grams?: number;
  dimensions?: any;
  stock_quantity: number;
  low_stock_threshold: number;
  is_featured: boolean;
  is_bestseller: boolean;
  is_new_release: boolean;
  status: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  view_count: number;
  rating?: number;
  review_count?: number;
  inventory_enabled?: boolean;
  created_at: string;
  updated_at: string;
  created_by?: number;
  updated_by?: number;
  formats?: BookFormat[];
  uploads?: BookUpload[];
}

export interface CreateBookData {
  title: string;
  subtitle?: string;
  author_id: number;
  category_id: number;
  isbn?: string;
  description?: string;
  short_description?: string;
  language?: string;
  pages?: number;
  publication_date?: string;
  publisher?: string;
  price: number;
  original_price?: number;
  cost_price?: number;
  weight_grams?: number;
  dimensions?: any;
  shipping_class?: string;
  stock_quantity?: number;
  low_stock_threshold?: number;
  inventory_enabled?: boolean;
  cover_image_url?: string;
  sample_pdf_url?: string;
  ebook_file_url?: string;
  audiobook_file_url?: string;
  format?: 'ebook' | 'physical' | 'audiobook' | 'both';
  status?: 'draft' | 'published' | 'archived' | 'out_of_stock';
  is_featured?: boolean;
  is_bestseller?: boolean;
  is_new_release?: boolean;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  created_by?: number;
  formats?: Array<{
    format: 'ebook' | 'physical' | 'audiobook';
    file_url?: string;
    file_size?: number;
    file_type?: string;
    is_available?: boolean;
    price?: number;
  }>;
}

export class EnhancedBookService {
  async createBookWithFormats(bookData: CreateBookData): Promise<EnhancedBook> {
    return await transaction(async (client) => {
      // Create the main book record
      const bookResult = await client.query(`
        INSERT INTO books (
          title, subtitle, author_id, category_id, isbn, description, short_description,
          language, pages, publication_date, publisher, price, original_price, cost_price,
          weight_grams, dimensions, shipping_class, stock_quantity, low_stock_threshold,
          inventory_enabled, cover_image_url, sample_pdf_url, ebook_file_url, audiobook_file_url,
          format, status, is_featured, is_bestseller, is_new_release, seo_title, seo_description,
          seo_keywords, created_by
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19,
          $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33
        ) RETURNING *
      `, [
        bookData.title, bookData.subtitle, bookData.author_id, bookData.category_id,
        bookData.isbn, bookData.description, bookData.short_description, bookData.language,
        bookData.pages, bookData.publication_date, bookData.publisher, bookData.price,
        bookData.original_price, bookData.cost_price, bookData.weight_grams, bookData.dimensions,
        bookData.shipping_class, bookData.stock_quantity, bookData.low_stock_threshold,
        bookData.inventory_enabled, bookData.cover_image_url, bookData.sample_pdf_url,
        bookData.ebook_file_url, bookData.audiobook_file_url, bookData.format || 'ebook',
        bookData.status || 'draft', bookData.is_featured, bookData.is_bestseller, bookData.is_new_release,
        bookData.seo_title, bookData.seo_description, bookData.seo_keywords, bookData.created_by
      ]);

      const book = bookResult.rows[0];

      // Create book formats if provided
      if (bookData.formats && bookData.formats.length > 0) {
        for (const formatData of bookData.formats) {
          await client.query(`
            INSERT INTO book_formats (
              book_id, format, file_url, file_size, file_type, is_available, price
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [
            book.id, formatData.format, formatData.file_url, formatData.file_size,
            formatData.file_type, formatData.is_available ?? true, formatData.price
          ]);
        }
      }

      // Return the complete book with formats
      return await this.getBookWithFormats(book.id);
    });
  }

  async getBookWithFormats(bookId: number): Promise<EnhancedBook | null> {
    const bookResult = await query(`
      SELECT b.*, a.name as author_name, c.name as category_name
      FROM books b
      LEFT JOIN authors a ON b.author_id = a.id
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.id = $1
    `, [bookId]);

    if (bookResult.rows.length === 0) {
      return null;
    }

    const book = bookResult.rows[0];

    // Get book formats
    const formatsResult = await query(`
      SELECT * FROM book_formats WHERE book_id = $1 ORDER BY format
    `, [bookId]);

    // Get book uploads
    const uploadsResult = await query(`
      SELECT * FROM book_uploads WHERE book_id = $1 ORDER BY created_at DESC
    `, [bookId]);

    return {
      ...book,
      formats: formatsResult.rows,
      uploads: uploadsResult.rows
    };
  }

  async updateBookWithFormats(bookId: number, bookData: Partial<CreateBookData>): Promise<EnhancedBook | null> {
    return await transaction(async (client) => {
      // Update the main book record
      const updateFields = [];
      const updateValues = [];
      let paramIndex = 1;

      const fieldsToUpdate = [
        'title', 'subtitle', 'author_id', 'category_id', 'isbn', 'description', 'short_description',
        'language', 'pages', 'publication_date', 'publisher', 'price', 'original_price', 'cost_price',
        'weight_grams', 'dimensions', 'shipping_class', 'stock_quantity', 'low_stock_threshold',
        'inventory_enabled', 'cover_image_url', 'sample_pdf_url', 'ebook_file_url', 'audiobook_file_url',
        'format', 'status', 'is_featured', 'is_bestseller', 'is_new_release', 'seo_title', 'seo_description',
        'seo_keywords', 'updated_by'
      ];

      for (const field of fieldsToUpdate) {
        if (bookData[field as keyof CreateBookData] !== undefined) {
          updateFields.push(`${field} = $${paramIndex}`);
          updateValues.push(bookData[field as keyof CreateBookData]);
          paramIndex++;
        }
      }

      if (updateFields.length === 0) {
        return await this.getBookWithFormats(bookId);
      }

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      updateValues.push(bookId);

      const updateQuery = `
        UPDATE books SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const bookResult = await client.query(updateQuery, updateValues);

      if (bookResult.rows.length === 0) {
        return null;
      }

      // Update book formats if provided
      if (bookData.formats) {
        // Delete existing formats
        await client.query('DELETE FROM book_formats WHERE book_id = $1', [bookId]);

        // Insert new formats
        for (const formatData of bookData.formats) {
          await client.query(`
            INSERT INTO book_formats (
              book_id, format, file_url, file_size, file_type, is_available, price
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [
            bookId, formatData.format, formatData.file_url, formatData.file_size,
            formatData.file_type, formatData.is_available ?? true, formatData.price
          ]);
        }
      }

      return await this.getBookWithFormats(bookId);
    });
  }

  async getBooksWithFormats(filters: any = {}, page: number = 1, limit: number = 20): Promise<{
    books: EnhancedBook[];
    total: number;
    pages: number;
  }> {
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.search) {
      whereClause += ` AND (b.title ILIKE $${paramIndex} OR b.isbn ILIKE $${paramIndex})`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    if (filters.status) {
      whereClause += ` AND b.status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.category_id) {
      whereClause += ` AND b.category_id = $${paramIndex}`;
      params.push(filters.category_id);
      paramIndex++;
    }

    if (filters.format) {
      whereClause += ` AND EXISTS (
        SELECT 1 FROM book_formats bf 
        WHERE bf.book_id = b.id AND bf.format = $${paramIndex}
      )`;
      params.push(filters.format);
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
    const offset = (page - 1) * limit;

    // Get books with pagination
    const booksResult = await query(`
      SELECT b.*, a.name as author_name, c.name as category_name
      FROM books b
      LEFT JOIN authors a ON b.author_id = a.id
      LEFT JOIN categories c ON b.category_id = c.id
      ${whereClause}
      ORDER BY b.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, limit, offset]);

    const books = booksResult.rows;

    // Get formats for all books
    const bookIds = books.map(book => book.id);
    if (bookIds.length > 0) {
      const formatsResult = await query(`
        SELECT * FROM book_formats 
        WHERE book_id = ANY($1) 
        ORDER BY book_id, format
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
      pages
    };
  }

  async getBookFormats(bookId: number): Promise<BookFormat[]> {
    const result = await query(`
      SELECT * FROM book_formats 
      WHERE book_id = $1 
      ORDER BY format
    `, [bookId]);

    return result.rows;
  }

  async updateBookFormat(bookId: number, format: string, formatData: Partial<BookFormat>): Promise<BookFormat | null> {
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    const fieldsToUpdate = ['file_url', 'file_size', 'file_type', 'is_available', 'price'];

    for (const field of fieldsToUpdate) {
      if (formatData[field as keyof BookFormat] !== undefined) {
        updateFields.push(`${field} = $${paramIndex}`);
        updateValues.push(formatData[field as keyof BookFormat]);
        paramIndex++;
      }
    }

    if (updateFields.length === 0) {
      return null;
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(bookId, format);

    const updateQuery = `
      UPDATE book_formats 
      SET ${updateFields.join(', ')}
      WHERE book_id = $${paramIndex} AND format = $${paramIndex + 1}
      RETURNING *
    `;

    const result = await query(updateQuery, updateValues);
    return result.rows[0] || null;
  }

  async createBookUpload(uploadData: {
    book_id: number;
    upload_type: 'cover' | 'ebook' | 'audiobook' | 'sample';
    file_name: string;
    file_path: string;
    file_size: number;
    mime_type: string;
    processing_metadata?: any;
  }): Promise<BookUpload> {
    const result = await query(`
      INSERT INTO book_uploads (
        book_id, upload_type, file_name, file_path, file_size, mime_type, processing_metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      uploadData.book_id, uploadData.upload_type, uploadData.file_name,
      uploadData.file_path, uploadData.file_size, uploadData.mime_type,
      uploadData.processing_metadata ? JSON.stringify(uploadData.processing_metadata) : null
    ]);

    return result.rows[0];
  }

  async updateBookUploadStatus(uploadId: number, status: 'pending' | 'processing' | 'completed' | 'failed', metadata?: any): Promise<BookUpload | null> {
    const result = await query(`
      UPDATE book_uploads 
      SET upload_status = $1, processing_metadata = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `, [status, metadata ? JSON.stringify(metadata) : null, uploadId]);

    return result.rows[0] || null;
  }

  async getBookUploads(bookId: number): Promise<BookUpload[]> {
    const result = await query(`
      SELECT * FROM book_uploads 
      WHERE book_id = $1 
      ORDER BY created_at DESC
    `, [bookId]);

    return result.rows;
  }

  async deleteBook(bookId: number): Promise<boolean> {
    return await transaction(async (client) => {
      // Delete related records first
      await client.query('DELETE FROM book_uploads WHERE book_id = $1', [bookId]);
      await client.query('DELETE FROM book_formats WHERE book_id = $1', [bookId]);
      
      // Delete the book
      const result = await client.query('DELETE FROM books WHERE id = $1', [bookId]);
      return result.rowCount > 0;
    });
  }
}

// Export singleton instance
export const enhancedBookService = new EnhancedBookService(); 