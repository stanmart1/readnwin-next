import { query, transaction } from './database';
import { OrderStatus, OrderStatusHistory, OrderNote, isValidStatusTransition, requiresNoteForTransition } from './order-types';

export interface Book {
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
  format: 'ebook' | 'physical' | 'audiobook' | 'both';
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
  status: 'draft' | 'published' | 'archived' | 'out_of_stock';
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  view_count: number;
  rating?: number;
  review_count?: number;
  inventory_enabled?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  order_number: string;
  user_id?: number;
  guest_email?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  payment_method?: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_transaction_id?: string;
  shipping_address?: any;
  billing_address?: any;
  shipping_method?: string;
  tracking_number?: string;
  estimated_delivery_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  book_id: number;
  title: string;
  author_name: string;
  price: number;
  quantity: number;
  total_price: number;
  format: string;
  created_at: string;
}

export interface CartItem {
  id: number;
  user_id: number;
  book_id: number;
  quantity: number;
  added_at: string;
  book?: Book;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  image_url?: string;
  is_active: boolean;
  sort_order: number;
  book_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Author {
  id: number;
  name: string;
  email?: string;
  bio?: string;
  avatar_url?: string;
  website_url?: string;
  social_media?: any;
  is_verified: boolean;
  status: 'active' | 'inactive' | 'pending';
  books_count?: number;
  total_sales?: number;
  revenue?: number;
  created_at: string;
  updated_at: string;
}

export interface BookReview {
  id: number;
  book_id: number;
  user_id: number;
  user_name?: string;
  rating: number;
  title?: string;
  review_text?: string;
  is_verified_purchase: boolean;
  is_helpful_count: number;
  is_featured: boolean;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface SalesAnalytics {
  total_revenue: number;
  total_orders: number;
  average_order_value: number;
  monthly_sales: Array<{
    month: string;
    sales: number;
    orders: number;
    avg_order: number;
  }>;
  top_books: Array<{
    title: string;
    sales: number;
    revenue: number;
    growth: number;
  }>;
  category_sales: Array<{
    name: string;
    value: number;
    sales: number;
    color: string;
  }>;
}

class EcommerceService {
  // Ensure authors table exists
  private async ensureAuthorsTable(): Promise<void> {
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS authors (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          bio TEXT,
          avatar_url VARCHAR(500),
          website_url VARCHAR(500),
          social_media JSONB,
          is_verified BOOLEAN DEFAULT false,
          status VARCHAR(50) DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } catch (error) {
      console.error('Error ensuring authors table:', error);
    }
  }

  // Ensure books table exists
  private async ensureBooksTable(): Promise<void> {
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS books (
          id SERIAL PRIMARY KEY,
          title VARCHAR(500) NOT NULL,
          author_id INTEGER REFERENCES authors(id),
          category_id INTEGER,
          price DECIMAL(10,2) NOT NULL,
          status VARCHAR(50) DEFAULT 'published',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } catch (error) {
      console.error('Error ensuring books table:', error);
    }
  }

  // Book Management
  async getBooks(filters: any = {}, page: number = 1, limit: number = 12, showAll: boolean = false): Promise<{ books: Book[], total: number, pages: number }> {
    try {
      await this.ensureBooksTable();
      
      let whereClause = showAll ? 'WHERE 1=1' : 'WHERE b.status = $1';
      let params: any[] = showAll ? [] : ['published'];
      let paramIndex = showAll ? 1 : 2;

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

    if (filters.search) {
      whereClause += ` AND (b.title ILIKE $${paramIndex} OR b.description ILIKE $${paramIndex})`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    if (filters.min_price) {
      whereClause += ` AND b.price >= $${paramIndex}`;
      params.push(filters.min_price);
      paramIndex++;
    }

    if (filters.max_price) {
      whereClause += ` AND b.price <= $${paramIndex}`;
      params.push(filters.max_price);
      paramIndex++;
    }

    if (filters.is_featured) {
      whereClause += ` AND b.is_featured = $${paramIndex}`;
      params.push(filters.is_featured);
      paramIndex++;
    }

    if (filters.is_bestseller) {
      whereClause += ` AND b.is_bestseller = $${paramIndex}`;
      params.push(filters.is_bestseller);
      paramIndex++;
    }

    if (filters.is_new_release) {
      whereClause += ` AND b.is_new_release = $${paramIndex}`;
      params.push(filters.is_new_release);
      paramIndex++;
    }

    if (filters.min_rating) {
      whereClause += ` AND EXISTS (
        SELECT 1 FROM book_reviews br2 
        WHERE br2.book_id = b.id 
        AND br2.status = 'approved' 
        GROUP BY br2.book_id 
        HAVING AVG(br2.rating) >= $${paramIndex}
      )`;
      params.push(filters.min_rating);
      paramIndex++;
    }

    const offset = (page - 1) * limit;
    const countQuery = `
      SELECT COUNT(*) as total
      FROM books b
      ${whereClause}
    `;

    const booksQuery = `
      SELECT 
        b.*,
        a.name as author_name,
        c.name as category_name,
        COALESCE(AVG(br.rating), 0) as rating,
        COUNT(br.id) as review_count
      FROM books b
      LEFT JOIN authors a ON b.author_id = a.id
      LEFT JOIN categories c ON b.category_id = c.id
      LEFT JOIN book_reviews br ON b.id = br.book_id AND br.status = 'approved'
      ${whereClause}
      GROUP BY b.id, a.name, c.name
      ORDER BY b.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countParams = params;
    const booksParams = [...params, limit, offset];

    const [countResult, booksResult] = await Promise.all([
      query(countQuery, countParams),
      query(booksQuery, booksParams)
    ]);

    const total = parseInt(countResult.rows[0].total);
    const pages = Math.ceil(total / limit);

    return {
      books: booksResult.rows,
      total,
      pages
    };
    } catch (error) {
      console.error('Error in getBooks:', error);
      return { books: [], total: 0, pages: 0 };
    }
  }

  async getBookById(id: number): Promise<Book | null> {
    const result = await query(`
      SELECT 
        b.*,
        a.name as author_name,
        c.name as category_name,
        COALESCE(AVG(br.rating), 0) as rating,
        COUNT(br.id) as review_count
      FROM books b
      LEFT JOIN authors a ON b.author_id = a.id
      LEFT JOIN categories c ON b.category_id = c.id
      LEFT JOIN book_reviews br ON b.id = br.book_id AND br.status = 'approved'
      WHERE b.id = $1
      GROUP BY b.id, a.name, c.name
    `, [id]);

    return result.rows[0] || null;
  }

  async createBook(bookData: Partial<Book>): Promise<Book> {
    const result = await query(`
      INSERT INTO books (
        title, subtitle, author_id, category_id, isbn, description, short_description,
        cover_image_url, sample_pdf_url, ebook_file_url, format, language, pages,
        publication_date, publisher, price, original_price, cost_price, weight_grams,
        dimensions, stock_quantity, low_stock_threshold, is_featured, is_bestseller,
        is_new_release, status, seo_title, seo_description, seo_keywords, inventory_enabled
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30
      ) RETURNING *
    `, [
      bookData.title, bookData.subtitle, bookData.author_id, bookData.category_id,
      bookData.isbn, bookData.description, bookData.short_description, bookData.cover_image_url,
      bookData.sample_pdf_url, bookData.ebook_file_url, bookData.format, bookData.language,
      bookData.pages, bookData.publication_date, bookData.publisher, bookData.price,
      bookData.original_price, bookData.cost_price, bookData.weight_grams, bookData.dimensions,
      bookData.stock_quantity, bookData.low_stock_threshold, bookData.is_featured,
      bookData.is_bestseller, bookData.is_new_release, bookData.status, bookData.seo_title,
      bookData.seo_description, bookData.seo_keywords, bookData.inventory_enabled
    ]);

    return result.rows[0];
  }

  async updateBook(id: number, bookData: Partial<Book>): Promise<Book | null> {
    try {
      console.log(`🔍 Updating book ${id} with data:`, JSON.stringify(bookData, null, 2));
      
      // Handle dimensions field properly for JSONB
      let dimensionsValue = bookData.dimensions;
      if (dimensionsValue && typeof dimensionsValue === 'object') {
        dimensionsValue = JSON.stringify(dimensionsValue);
      }
      
      // Build dynamic update query based on provided fields
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      let paramIndex = 1;
      
      // Map of field names to their parameter index
      const fieldMappings = [
        { field: 'title', value: bookData.title },
        { field: 'subtitle', value: bookData.subtitle },
        { field: 'author_id', value: bookData.author_id },
        { field: 'category_id', value: bookData.category_id },
        { field: 'isbn', value: bookData.isbn },
        { field: 'description', value: bookData.description },
        { field: 'short_description', value: bookData.short_description },
        { field: 'cover_image_url', value: bookData.cover_image_url },
        { field: 'sample_pdf_url', value: bookData.sample_pdf_url },
        { field: 'ebook_file_url', value: bookData.ebook_file_url },
        { field: 'format', value: bookData.format },
        { field: 'language', value: bookData.language },
        { field: 'pages', value: bookData.pages },
        { field: 'publication_date', value: bookData.publication_date },
        { field: 'publisher', value: bookData.publisher },
        { field: 'price', value: bookData.price },
        { field: 'original_price', value: bookData.original_price },
        { field: 'cost_price', value: bookData.cost_price },
        { field: 'weight_grams', value: bookData.weight_grams },
        { field: 'dimensions', value: dimensionsValue },
        { field: 'stock_quantity', value: bookData.stock_quantity },
        { field: 'low_stock_threshold', value: bookData.low_stock_threshold },
        { field: 'is_featured', value: bookData.is_featured },
        { field: 'is_bestseller', value: bookData.is_bestseller },
        { field: 'is_new_release', value: bookData.is_new_release },
        { field: 'status', value: bookData.status },
        { field: 'seo_title', value: bookData.seo_title },
        { field: 'seo_description', value: bookData.seo_description },
        { field: 'seo_keywords', value: bookData.seo_keywords },
        { field: 'inventory_enabled', value: bookData.inventory_enabled }
      ];
      
      // Only include fields that are actually provided
      for (const mapping of fieldMappings) {
        if (mapping.value !== undefined) {
          updateFields.push(`${mapping.field} = $${paramIndex}`);
          updateValues.push(mapping.value);
          paramIndex++;
        }
      }
      
      // Always update the updated_at timestamp
      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      
      if (updateFields.length === 0) {
        console.log(`🔍 No fields to update for book ${id}`);
        // Return the existing book if no updates
        return await this.getBookById(id);
      }
      
      // Add the book ID as the last parameter
      updateValues.push(id);
      
      const updateQuery = `
        UPDATE books SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;
      
      console.log(`🔍 Update query:`, updateQuery);
      console.log(`🔍 Update values:`, updateValues);
      
      const result = await query(updateQuery, updateValues);

      if (result.rows.length === 0) {
        console.log(`❌ No rows affected when updating book ${id}`);
        return null;
      }

      console.log(`✅ Book ${id} updated successfully`);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`❌ Error updating book ${id}:`, error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        code: (error as any)?.code || 'Unknown',
        detail: (error as any)?.detail || 'Unknown',
        hint: (error as any)?.hint || 'Unknown'
      });
      
      // Re-throw with more context
      if (error instanceof Error) {
        const enhancedError = new Error(`Failed to update book ${id}: ${error.message}`);
        (enhancedError as any).originalError = error;
        (enhancedError as any).bookId = id;
        (enhancedError as any).updateData = bookData;
        throw enhancedError;
      }
      
      throw error;
    }
  }

  async deleteBook(id: number): Promise<boolean> {
    console.log(`🔍 Starting book deletion for ID: ${id}`);
    
    try {
      // Use a transaction to ensure data consistency
      return await transaction(async (client) => {
        try {
          console.log(`🔍 Transaction started for book deletion ID: ${id}`);
          
          // First, check if the book exists
          console.log(`🔍 Checking if book ${id} exists...`);
          const bookCheck = await client.query('SELECT id, title FROM books WHERE id = $1', [id]);
          if (bookCheck.rowCount === 0) {
            console.log(`❌ Book with ID ${id} not found`);
            return false;
          }

          const bookTitle = bookCheck.rows[0]?.title || 'Unknown';
          console.log(`🔍 Found book: "${bookTitle}" (ID: ${id})`);

          // Delete related records in the correct order to avoid foreign key constraint violations
          // We'll handle each deletion separately and log the results
          
          try {
            // 1. Delete from order_items (this is the main constraint issue)
            console.log(`🔍 Deleting order_items for book ${id}...`);
            const orderItemsResult = await client.query('DELETE FROM order_items WHERE book_id = $1', [id]);
            console.log(`✅ Deleted ${orderItemsResult.rowCount} order items`);
          } catch (error) {
            console.warn(`⚠️ Warning: Could not delete order_items for book ${id}:`, error);
            // Continue with other deletions
          }
          
          try {
            // 2. Delete from book_reviews
            console.log(`🔍 Deleting book_reviews for book ${id}...`);
            const reviewsResult = await client.query('DELETE FROM book_reviews WHERE book_id = $1', [id]);
            console.log(`✅ Deleted ${reviewsResult.rowCount} book reviews`);
          } catch (error) {
            console.warn(`⚠️ Warning: Could not delete book_reviews for book ${id}:`, error);
          }
          
          try {
            // 3. Delete from cart_items
            console.log(`🔍 Deleting cart_items for book ${id}...`);
            const cartItemsResult = await client.query('DELETE FROM cart_items WHERE book_id = $1', [id]);
            console.log(`✅ Deleted ${cartItemsResult.rowCount} cart items`);
          } catch (error) {
            console.warn(`⚠️ Warning: Could not delete cart_items for book ${id}:`, error);
          }
          
          try {
            // 4. Delete from book_tag_relations
            console.log(`🔍 Deleting book_tag_relations for book ${id}...`);
            const tagRelationsResult = await client.query('DELETE FROM book_tag_relations WHERE book_id = $1', [id]);
            console.log(`✅ Deleted ${tagRelationsResult.rowCount} tag relations`);
          } catch (error) {
            console.warn(`⚠️ Warning: Could not delete book_tag_relations for book ${id}:`, error);
          }
          
          try {
            // 5. Delete from reading_progress
            console.log(`🔍 Deleting reading_progress for book ${id}...`);
            const readingProgressResult = await client.query('DELETE FROM reading_progress WHERE book_id = $1', [id]);
            console.log(`✅ Deleted ${readingProgressResult.rowCount} reading progress records`);
          } catch (error) {
            console.warn(`⚠️ Warning: Could not delete reading_progress for book ${id}:`, error);
          }
          
          try {
            // 6. Delete from user_library
            console.log(`🔍 Deleting user_library entries for book ${id}...`);
            const userLibraryResult = await client.query('DELETE FROM user_library WHERE book_id = $1', [id]);
            console.log(`✅ Deleted ${userLibraryResult.rowCount} user library entries`);
          } catch (error) {
            console.warn(`⚠️ Warning: Could not delete user_library for book ${id}:`, error);
          }
          
          // 7. Finally delete the book
          console.log(`🔍 Deleting book ${id}...`);
          const result = await client.query('DELETE FROM books WHERE id = $1', [id]);
          
          if (result.rowCount && result.rowCount > 0) {
            console.log(`✅ Successfully deleted book "${bookTitle}" (ID: ${id})`);
            return true;
          } else {
            console.log(`❌ Failed to delete book ${id} - no rows affected`);
            return false;
          }
        } catch (transactionError) {
          console.error(`❌ Transaction error for book ${id}:`, transactionError);
          throw transactionError; // Re-throw to rollback transaction
        }
      });
    } catch (error) {
      console.error(`❌ Error deleting book ${id}:`, error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        code: (error as any)?.code || 'Unknown',
        name: error instanceof Error ? error.name : 'Unknown'
      });
      
      // Return false instead of throwing to handle gracefully
      return false;
    }
  }

  async deleteOrder(id: number): Promise<boolean> {
    // Use a transaction to ensure data consistency
    return await transaction(async (client) => {
      // First, check if the order exists
      const orderCheck = await client.query('SELECT id FROM orders WHERE id = $1', [id]);
      if (orderCheck.rowCount === 0) {
        return false;
      }

      // Handle user_library records first - set order_id to NULL for records that reference this order
      await client.query('UPDATE user_library SET order_id = NULL WHERE order_id = $1', [id]);
      
      // Handle bank_transfer_payments - delete records that reference this order
      await client.query('DELETE FROM bank_transfer_payments WHERE order_id = $1', [id]);
      
      // Delete payment_transactions (this table doesn't have CASCADE DELETE)
      await client.query('DELETE FROM payment_transactions WHERE order_id = $1', [id]);
      
      // Finally delete the order - this will cascade delete:
      // - order_items (ON DELETE CASCADE)
      // - order_notes (ON DELETE CASCADE) 
      // - order_status_history (ON DELETE CASCADE)
      // - shipping_details (ON DELETE CASCADE)
      // - bank_transfers (ON DELETE CASCADE)
      const result = await client.query('DELETE FROM orders WHERE id = $1', [id]);
      return result.rowCount > 0;
    });
  }

  // Category Management
  async getCategories(filters: any = {}): Promise<Category[] | { categories: Category[], pagination: any }> {
    // If no pagination requested, return simple array for backward compatibility
    if (!filters.page && !filters.limit) {
      const result = await query(`
        SELECT 
          c.*,
          COUNT(b.id) as book_count
        FROM categories c
        LEFT JOIN books b ON c.id = b.category_id AND b.status = 'published'
        WHERE c.is_active = true
        GROUP BY c.id
        ORDER BY c.sort_order, c.name
      `);
      return result.rows;
    }

    // Paginated version
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.search) {
      whereClause += ` AND (c.name ILIKE $${paramIndex} OR c.description ILIKE $${paramIndex})`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    if (filters.status === 'active') {
      whereClause += ` AND c.is_active = true`;
    } else if (filters.status === 'inactive') {
      whereClause += ` AND c.is_active = false`;
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM categories c
      ${whereClause}
    `;

    const categoriesQuery = `
      SELECT 
        c.*,
        COUNT(b.id) as book_count
      FROM categories c
      LEFT JOIN books b ON c.id = b.category_id AND b.status = 'published'
      ${whereClause}
      GROUP BY c.id
      ORDER BY c.sort_order, c.name
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countParams = params;
    const categoriesParams = [...params, limit, offset];

    const [countResult, categoriesResult] = await Promise.all([
      query(countQuery, countParams),
      query(categoriesQuery, categoriesParams)
    ]);

    const total = parseInt(countResult.rows[0].total);
    const pages = Math.ceil(total / limit);

    return {
      categories: categoriesResult.rows,
      pagination: { page, limit, total, pages }
    };
  }

  async createCategory(categoryData: Partial<Category>): Promise<Category> {
    // Generate slug from name if not provided
    const slug = categoryData.slug || categoryData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const result = await query(`
      INSERT INTO categories (name, slug, description, parent_id, image_url, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      categoryData.name, slug, categoryData.description,
      categoryData.parent_id, categoryData.image_url, categoryData.sort_order || 0
    ]);
    return result.rows[0];
  }

  async updateCategory(id: number, categoryData: Partial<Category>): Promise<Category | null> {
    const result = await query(`
      UPDATE categories SET
        name = COALESCE($2, name),
        slug = COALESCE($3, slug),
        description = COALESCE($4, description),
        parent_id = COALESCE($5, parent_id),
        image_url = COALESCE($6, image_url),
        sort_order = COALESCE($7, sort_order),
        is_active = COALESCE($8, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [
      id, categoryData.name, categoryData.slug, categoryData.description,
      categoryData.parent_id, categoryData.image_url, categoryData.sort_order, categoryData.is_active
    ]);
    return result.rows[0] || null;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await query('DELETE FROM categories WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  // Author Management
  async getAuthors(filters: any = {}): Promise<Author[] | { authors: Author[], pagination: any }> {
    try {
      await this.ensureAuthorsTable();
      
      if (!filters.page && !filters.limit) {
        let whereClause = 'WHERE 1=1';
        const params: any[] = [];

        if (filters.status) {
          whereClause += ` AND a.status = $${params.length + 1}`;
          params.push(filters.status);
        }

        const result = await query(`
          SELECT 
            a.*,
            0 as books_count,
            0 as total_sales,
            0 as revenue
          FROM authors a
          ${whereClause}
          ORDER BY a.name
        `, params);

        return result.rows;
      }
    } catch (error) {
      console.error('Error in getAuthors:', error);
      return filters.page ? { authors: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } } : [];
    }

    // Paginated version
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const offset = (page - 1) * limit;

      let whereClause = 'WHERE 1=1';
      const params: any[] = [];
      let paramIndex = 1;

      if (filters.search) {
        whereClause += ` AND a.name ILIKE $${paramIndex}`;
        params.push(`%${filters.search}%`);
        paramIndex++;
      }

      if (filters.status) {
        whereClause += ` AND a.status = $${paramIndex}`;
        params.push(filters.status);
        paramIndex++;
      }

      const countQuery = `
        SELECT COUNT(*) as total
        FROM authors a
        ${whereClause}
      `;

      const authorsQuery = `
        SELECT 
          a.*,
          0 as books_count,
          0 as total_sales,
          0 as revenue
        FROM authors a
        ${whereClause}
        ORDER BY a.name
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      const countParams = params;
      const authorsParams = [...params, limit, offset];

      const [countResult, authorsResult] = await Promise.all([
        query(countQuery, countParams),
        query(authorsQuery, authorsParams)
      ]);

      const total = parseInt(countResult.rows[0].total);
      const pages = Math.ceil(total / limit);

      return {
        authors: authorsResult.rows,
        pagination: { page, limit, total, pages }
      };
    } catch (error) {
      console.error('Error in paginated getAuthors:', error);
      return {
        authors: [],
        pagination: { page: filters.page || 1, limit: filters.limit || 20, total: 0, pages: 0 }
      };
    }
  }

  async createAuthor(authorData: Partial<Author>): Promise<Author> {
    const result = await query(`
      INSERT INTO authors (name, bio, avatar_url, website_url, social_media, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      authorData.name, authorData.bio, authorData.avatar_url,
      authorData.website_url, authorData.social_media, authorData.status || 'active'
    ]);
    return result.rows[0];
  }

  async updateAuthor(id: number, authorData: Partial<Author>): Promise<Author | null> {
    const result = await query(`
      UPDATE authors SET
        name = COALESCE($2, name),
        bio = COALESCE($3, bio),
        avatar_url = COALESCE($4, avatar_url),
        website_url = COALESCE($5, website_url),
        social_media = COALESCE($6, social_media),
        status = COALESCE($7, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [
      id, authorData.name, authorData.bio, authorData.avatar_url,
      authorData.website_url, authorData.social_media, authorData.status
    ]);
    return result.rows[0] || null;
  }

  async deleteAuthor(id: number): Promise<boolean> {
    const result = await query('DELETE FROM authors WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  // Cart Management
  async getCartItems(userId: number): Promise<CartItem[]> {
    const result = await query(`
      SELECT 
        ci.*,
        b.id as book_id,
        b.title, b.price, b.original_price, b.cover_image_url, b.author_id,
        b.category_id, b.format, b.status,
        a.name as author_name,
        c.name as category_name
      FROM cart_items ci
      JOIN books b ON ci.book_id = b.id
      LEFT JOIN authors a ON b.author_id = a.id
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE ci.user_id = $1
      ORDER BY ci.created_at DESC
    `, [userId]);

    // Transform the flat data into the expected CartItem structure
    return result.rows.map(row => ({
      id: row.id,
      user_id: row.user_id,
      book_id: row.book_id,
      quantity: row.quantity,
      added_at: row.created_at, // Map created_at to added_at for compatibility
      book: {
        id: row.book_id,
        title: row.title,
        author_name: row.author_name,
        price: row.price,
        original_price: row.original_price,
        cover_image_url: row.cover_image_url,
        category_name: row.category_name,
        format: row.format,
        status: row.status
      }
    }));
  }

  async addToCart(userId: number, bookId: number, quantity: number = 1): Promise<CartItem> {
    const result = await query(`
      INSERT INTO cart_items (user_id, book_id, quantity)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, book_id)
      DO UPDATE SET quantity = cart_items.quantity + $3
      RETURNING *
    `, [userId, bookId, quantity]);
    
    // Get the complete cart item with book details
    const cartItems = await this.getCartItems(userId);
    const cartItem = cartItems.find(item => item.book_id === bookId);
    
    if (!cartItem) {
      throw new Error('Failed to retrieve cart item after adding');
    }
    
    return cartItem;
  }

  async updateCartItemQuantity(userId: number, bookId: number, quantity: number): Promise<CartItem | null> {
    if (quantity <= 0) {
      await this.removeFromCart(userId, bookId);
      return null;
    }

    const result = await query(`
      UPDATE cart_items 
      SET quantity = $3
      WHERE user_id = $1 AND book_id = $2
      RETURNING *
    `, [userId, bookId, quantity]);
    
    if (result.rows[0]) {
      // Get the complete cart item with book details
      const cartItems = await this.getCartItems(userId);
      const cartItem = cartItems.find(item => item.book_id === bookId);
      return cartItem || null;
    }
    
    return null;
  }

  async removeFromCart(userId: number, bookId: number): Promise<boolean> {
    const result = await query(`
      DELETE FROM cart_items 
      WHERE user_id = $1 AND book_id = $2
    `, [userId, bookId]);
    return result.rowCount > 0;
  }

  async clearCart(userId: number): Promise<boolean> {
    try {
      const result = await query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    }
  }

  /**
   * Clear cart only after confirmed payment success
   * This ensures the cart is not cleared prematurely during checkout
   */
  async clearCartAfterPaymentSuccess(userId: number, orderId: number): Promise<boolean> {
    try {
      // Verify that the order has confirmed payment before clearing cart
      const orderResult = await query(`
        SELECT payment_status, status 
        FROM orders 
        WHERE id = $1 AND user_id = $2
      `, [orderId, userId]);

      if (orderResult.rows.length === 0) {
        console.log('❌ Order not found for cart clearing');
        return false;
      }

      const order = orderResult.rows[0];
      
      // Only clear cart if payment is confirmed as paid
      if (order.payment_status === 'paid' && order.status === 'confirmed') {
        console.log('✅ Payment confirmed, clearing cart for user:', userId);
        const result = await query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
        return result.rowCount !== null && result.rowCount > 0;
      } else {
        console.log('⚠️ Payment not confirmed yet, preserving cart. Status:', order.payment_status, 'Order status:', order.status);
        return false;
      }
    } catch (error) {
      console.error('Error clearing cart after payment success:', error);
      return false;
    }
  }

  async cleanupExpiredCartItems(userId: number, expirationDate: Date): Promise<boolean> {
    try {
      const result = await query(
        'DELETE FROM cart_items WHERE user_id = $1 AND created_at < $2',
        [userId, expirationDate]
      );
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error cleaning up expired cart items:', error);
      return false;
    }
  }

  // Order Management
  async createOrder(orderData: Partial<Order>, items: Array<{ book_id: number, quantity: number }>): Promise<Order> {
    return await transaction(async (client) => {
      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Create order
      const orderResult = await client.query(`
        INSERT INTO orders (
          order_number, user_id, guest_email, status, subtotal, tax_amount,
          shipping_amount, discount_amount, total_amount, currency, payment_method,
          payment_status, shipping_address, billing_address, shipping_method
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *
      `, [
        orderNumber, orderData.user_id, orderData.guest_email, orderData.status || 'pending',
        orderData.subtotal, orderData.tax_amount || 0, orderData.shipping_amount || 0,
        orderData.discount_amount || 0, orderData.total_amount, orderData.currency || 'NGN',
        orderData.payment_method, orderData.payment_status || 'pending',
        orderData.shipping_address, orderData.billing_address, orderData.shipping_method
      ]);

      const order = orderResult.rows[0];

      // Create order items and update inventory
      for (const item of items) {
        const bookResult = await client.query('SELECT * FROM books WHERE id = $1', [item.book_id]);
        const book = bookResult.rows[0];

        if (!book) {
          throw new Error(`Book with ID ${item.book_id} not found`);
        }

        // Only check stock for physical books with inventory tracking
        if (book.format === 'physical' && book.stock_quantity > 0 && book.stock_quantity < item.quantity) {
          throw new Error(`Insufficient stock for book: ${book.title}`);
        }

        // Get author name
        const authorResult = await client.query('SELECT name FROM authors WHERE id = $1', [book.author_id]);
        const authorName = authorResult.rows[0]?.name || 'Unknown Author';

        // Create order item
        await client.query(`
          INSERT INTO order_items (order_id, book_id, title, author_name, price, quantity, total_price, format)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          order.id, item.book_id, book.title, authorName, book.price,
          item.quantity, book.price * item.quantity, book.format
        ]);

        // Update inventory for physical books with inventory tracking
        if (book.format === 'physical' && book.stock_quantity > 0) {
          const newStock = book.stock_quantity - item.quantity;
          await client.query(`
            UPDATE books SET stock_quantity = $1 WHERE id = $2
          `, [newStock, item.book_id]);
        }



        // Add to user library if ebook
        if (book.format === 'ebook' && orderData.user_id) {
          await client.query(`
            INSERT INTO user_library (user_id, book_id, order_id)
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id, book_id) DO NOTHING
          `, [orderData.user_id, item.book_id, order.id]);
        }
      }

      // DON'T clear cart here - wait for payment confirmation
      console.log('🛒 Cart preserved until payment confirmation for user:', orderData.user_id);

      return order;
    });
  }

  async getOrders(filters: any = {}, page: number = 1, limit: number = 20): Promise<{ orders: Order[], total: number, pages: number }> {
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (filters.user_id) {
      whereClause += ` AND o.user_id = $${params.length + 1}`;
      params.push(filters.user_id);
    }

    if (filters.status) {
      whereClause += ` AND o.status = $${params.length + 1}`;
      params.push(filters.status);
    }

    if (filters.payment_status) {
      whereClause += ` AND o.payment_status = $${params.length + 1}`;
      params.push(filters.payment_status);
    }

    const offset = (page - 1) * limit;
    const countQuery = `SELECT COUNT(*) as total FROM orders o ${whereClause}`;
    const ordersQuery = `
      SELECT o.*, 
             u.first_name, u.last_name, u.email as user_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const countParams = params;
    const ordersParams = [...params, limit, offset];

    const [countResult, ordersResult] = await Promise.all([
      query(countQuery, countParams),
      query(ordersQuery, ordersParams)
    ]);

    const total = parseInt(countResult.rows[0].total);
    const pages = Math.ceil(total / limit);

    return {
      orders: ordersResult.rows,
      total,
      pages
    };
  }

  async getOrderById(id: number): Promise<Order | null> {
    const result = await query(`
      SELECT o.*, 
             u.first_name, u.last_name, u.email as user_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = $1
    `, [id]);
    return result.rows[0] || null;
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    const result = await query(`
      SELECT 
        id,
        order_id,
        book_id,
        title,
        author_name,
        price,
        quantity,
        total_price,
        format,
        created_at
      FROM order_items
      WHERE order_id = $1
      ORDER BY created_at
    `, [orderId]);
    return result.rows;
  }

  async updateOrderPaymentInfo(id: number, transactionId: string, paymentMethod: string, amount: number): Promise<Order | null> {
    const result = await query(`
      UPDATE orders 
      SET payment_transaction_id = $2, payment_method = $3, payment_status = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [id, transactionId, paymentMethod, 'paid']);
    return result.rows[0] || null;
  }

  // Enhanced Order Status Management Methods
  async updateOrderStatus(orderId: number, newStatus: OrderStatus, notes?: string, userId?: number): Promise<Order | null> {
    try {
      // Get current order status
      const currentOrder = await this.getOrderById(orderId);
      if (!currentOrder) {
        throw new Error(`Order with ID ${orderId} not found`);
      }

      const currentStatus = currentOrder.status as OrderStatus;

      // Validate status transition
      if (!isValidStatusTransition(currentStatus, newStatus)) {
        throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
      }

      // Check if note is required
      if (requiresNoteForTransition(currentStatus, newStatus) && !notes) {
        throw new Error(`Note is required for status transition from ${currentStatus} to ${newStatus}`);
      }

      // Update order status
      const result = await query(
        `UPDATE orders 
         SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [newStatus, orderId]
      );

      if (!result.rows[0]) {
        return null;
      }

      // Add status history
      await this.addOrderStatusHistory(orderId, newStatus, notes, userId);



      return result.rows[0];
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  async addOrderStatusHistory(orderId: number, status: OrderStatus, notes?: string, userId?: number): Promise<OrderStatusHistory> {
    try {
      const result = await query(
        `INSERT INTO order_status_history (order_id, status, notes, created_by)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [orderId, status, notes, userId]
      );

      return {
        id: result.rows[0].id,
        order_id: result.rows[0].order_id,
        status: result.rows[0].status,
        notes: result.rows[0].notes,
        created_at: new Date(result.rows[0].created_at),
        created_by: result.rows[0].created_by
      };
    } catch (error) {
      console.error('Error adding order status history:', error);
      throw error;
    }
  }

  async getOrderStatusHistory(orderId: number): Promise<OrderStatusHistory[]> {
    try {
      const result = await query(
        `SELECT * FROM order_status_history 
         WHERE order_id = $1 
         ORDER BY created_at ASC`,
        [orderId]
      );

      return result.rows.map(row => ({
        id: row.id,
        order_id: row.order_id,
        status: row.status,
        notes: row.notes,
        created_at: new Date(row.created_at),
        created_by: row.created_by
      }));
    } catch (error) {
      console.error('Error getting order status history:', error);
      return [];
    }
  }

  async addOrderNote(orderId: number, note: string, isInternal: boolean = false, noteType: string = 'general', userId?: number): Promise<OrderNote> {
    try {
      const result = await query(
        `INSERT INTO order_notes (order_id, user_id, note, is_internal, note_type)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [orderId, userId, note, isInternal, noteType]
      );

      return {
        id: result.rows[0].id,
        order_id: result.rows[0].order_id,
        user_id: result.rows[0].user_id,
        note: result.rows[0].note,
        is_internal: result.rows[0].is_internal,
        note_type: result.rows[0].note_type,
        created_at: new Date(result.rows[0].created_at)
      };
    } catch (error) {
      console.error('Error adding order note:', error);
      throw error;
    }
  }

  async getOrderNotes(orderId: number, includeInternal: boolean = false): Promise<OrderNote[]> {
    try {
      const whereClause = includeInternal ? 'WHERE order_id = $1' : 'WHERE order_id = $1 AND is_internal = false';
      const result = await query(
        `SELECT * FROM order_notes 
         ${whereClause}
         ORDER BY created_at DESC`,
        [orderId]
      );

      return result.rows.map(row => ({
        id: row.id,
        order_id: row.order_id,
        user_id: row.user_id,
        note: row.note,
        is_internal: row.is_internal,
        note_type: row.note_type,
        created_at: new Date(row.created_at)
      }));
    } catch (error) {
      console.error('Error getting order notes:', error);
      return [];
    }
  }

  async validateOrder(orderId: number): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      const order = await this.getOrderById(orderId);
      if (!order) {
        errors.push('Order not found');
        return { valid: false, errors };
      }

      const orderItems = await this.getOrderItems(orderId);
      if (orderItems.length === 0) {
        errors.push('Order has no items');
      }

      // Validate payment status
      if (order.payment_status === 'pending' && order.status === 'confirmed') {
        errors.push('Order marked as confirmed but payment status is pending');
      }

      return {
        valid: errors.length === 0,
        errors
      };
    } catch (error) {
      errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { valid: false, errors };
    }
  }

  // Reviews Management
  async getBookReviews(bookId: number, page: number = 1, limit: number = 10): Promise<{ reviews: BookReview[], total: number, pages: number }> {
    const offset = (page - 1) * limit;
    
    const countResult = await query(`
      SELECT COUNT(*) as total
      FROM book_reviews br
      WHERE br.book_id = $1 AND br.status = 'approved'
    `, [bookId]);

    const reviewsResult = await query(`
      SELECT br.*, u.first_name, u.last_name
      FROM book_reviews br
      LEFT JOIN users u ON br.user_id = u.id
      WHERE br.book_id = $1 AND br.status = 'approved'
      ORDER BY br.created_at DESC
      LIMIT $2 OFFSET $3
    `, [bookId, limit, offset]);

    const total = parseInt(countResult.rows[0].total);
    const pages = Math.ceil(total / limit);

    return {
      reviews: reviewsResult.rows,
      total,
      pages
    };
  }

  async createReview(reviewData: Partial<BookReview>): Promise<BookReview> {
    // First check if a review already exists for this book and user
    const existingReview = await query(`
      SELECT id, status FROM book_reviews WHERE book_id = $1 AND user_id = $2
    `, [reviewData.book_id, reviewData.user_id]);

    // If review exists and is approved, prevent update
    if (existingReview.rows.length > 0 && existingReview.rows[0].status === 'approved') {
      throw new Error('Cannot update review. This review has been approved by an admin and cannot be modified.');
    }

    const result = await query(`
      INSERT INTO book_reviews (book_id, user_id, rating, title, review_text, is_verified_purchase)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (book_id, user_id) 
      DO UPDATE SET 
        rating = EXCLUDED.rating,
        title = EXCLUDED.title,
        review_text = EXCLUDED.review_text,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [
      reviewData.book_id, reviewData.user_id, reviewData.rating,
      reviewData.title, reviewData.review_text, reviewData.is_verified_purchase
    ]);
    return result.rows[0];
  }

  async getReviewById(reviewId: number): Promise<BookReview | null> {
    const result = await query(`
      SELECT * FROM book_reviews WHERE id = $1
    `, [reviewId]);
    
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async updateUserReview(reviewId: number, updateData: { rating: number; title?: string | null; review_text: string }): Promise<BookReview> {
    const result = await query(`
      UPDATE book_reviews 
      SET 
        rating = $2,
        title = $3,
        review_text = $4,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [reviewId, updateData.rating, updateData.title, updateData.review_text]);
    
    if (result.rows.length === 0) {
      throw new Error('Review not found or update failed');
    }
    
    return result.rows[0];
  }

  // Admin Review Management
  async getAdminReviews(filters: any = {}, page: number = 1, limit: number = 20): Promise<{ reviews: BookReview[], total: number, pages: number }> {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    let params: any[] = [];
    let paramIndex = 1;

    if (filters.status) {
      if (filters.status === 'featured') {
        whereClause += ` AND br.is_featured = true AND br.status = 'approved'`;
      } else {
        whereClause += ` AND br.status = $${paramIndex}`;
        params.push(filters.status);
        paramIndex++;
      }
    }

    if (filters.rating) {
      whereClause += ` AND br.rating = $${paramIndex}`;
      params.push(filters.rating);
      paramIndex++;
    }

    if (filters.book_id) {
      whereClause += ` AND br.book_id = $${paramIndex}`;
      params.push(filters.book_id);
      paramIndex++;
    }

    if (filters.user_id) {
      whereClause += ` AND br.user_id = $${paramIndex}`;
      params.push(filters.user_id);
      paramIndex++;
    }

    if (filters.search) {
      whereClause += ` AND (br.title ILIKE $${paramIndex} OR br.review_text ILIKE $${paramIndex} OR u.first_name ILIKE $${paramIndex} OR u.last_name ILIKE $${paramIndex} OR b.title ILIKE $${paramIndex})`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    const countResult = await query(`
      SELECT COUNT(*) as total
      FROM book_reviews br
      LEFT JOIN users u ON br.user_id = u.id
      LEFT JOIN books b ON br.book_id = b.id
      ${whereClause}
    `, params);

    const reviewsResult = await query(`
      SELECT 
        br.*,
        u.first_name,
        u.last_name,
        u.email as user_email,
        b.title as book_title,
        b.cover_image_url as book_cover,
        a.name as book_author
      FROM book_reviews br
      LEFT JOIN users u ON br.user_id = u.id
      LEFT JOIN books b ON br.book_id = b.id
      LEFT JOIN authors a ON b.author_id = a.id
      ${whereClause}
      ORDER BY br.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, limit, offset]);

    const total = parseInt(countResult.rows[0].total);
    const pages = Math.ceil(total / limit);

    return {
      reviews: reviewsResult.rows,
      total,
      pages
    };
  }

  async updateReviewStatus(reviewId: number, status: string, adminNotes?: string, adminUserId?: number): Promise<BookReview> {
    try {
      // First check if the review exists and get current status
      const checkResult = await query(`
        SELECT id, status FROM book_reviews WHERE id = $1
      `, [reviewId]);

      if (checkResult.rows.length === 0) {
        throw new Error('Review not found');
      }

      const currentStatus = checkResult.rows[0].status;

      // Update the review status
      const result = await query(`
        UPDATE book_reviews 
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `, [status, reviewId]);

      if (result.rows.length === 0) {
        throw new Error('Failed to update review');
      }

      // Log admin action if adminUserId is provided (with error handling)
      if (adminUserId) {
        try {
          await query(`
            INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address)
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [
            adminUserId,
            'UPDATE_REVIEW_STATUS',
            'book_reviews',
            reviewId,
            JSON.stringify({ 
              old_values: { status: currentStatus },
              new_values: { status, adminNotes }
            }),
            'admin_dashboard'
          ]);
        } catch (auditError) {
          console.error('Audit logging failed, but review was updated:', auditError);
          // Don't fail the main operation if audit logging fails
        }
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error updating review status:', error);
      throw error;
    }
  }

  async deleteReview(reviewId: number, adminUserId?: number): Promise<boolean> {
    try {
      // Get review details before deletion for audit log
      const reviewResult = await query(`
        SELECT * FROM book_reviews WHERE id = $1
      `, [reviewId]);

      if (reviewResult.rows.length === 0) {
        return false;
      }

      const review = reviewResult.rows[0];

      // Delete the review
      await query(`
        DELETE FROM book_reviews WHERE id = $1
      `, [reviewId]);

      // Log admin action if adminUserId is provided
      if (adminUserId) {
        await query(`
          INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          adminUserId,
          'DELETE_REVIEW',
          'book_reviews',
          reviewId,
          JSON.stringify({ 
            old_values: review,
            new_values: {}
          }),
          'admin_dashboard'
        ]);
      }

      return true;
    } catch (error) {
      console.error('Error deleting review:', error);
      return false;
    }
  }

  // Analytics
  async getSalesAnalytics(period: string = 'month'): Promise<SalesAnalytics> {
    // Create date filters for different table contexts
    const ordersDateFilter = period === 'month' 
      ? "AND o.created_at >= CURRENT_DATE - INTERVAL '30 days'"
      : period === 'week'
      ? "AND o.created_at >= CURRENT_DATE - INTERVAL '7 days'"
      : "AND o.created_at >= CURRENT_DATE - INTERVAL '1 year'";

    const singleTableDateFilter = period === 'month' 
      ? "AND created_at >= CURRENT_DATE - INTERVAL '30 days'"
      : period === 'week'
      ? "AND created_at >= CURRENT_DATE - INTERVAL '7 days'"
      : "AND created_at >= CURRENT_DATE - INTERVAL '1 year'";

    // Total revenue and orders
    const totalsResult = await query(`
      SELECT 
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COUNT(*) as total_orders,
        COALESCE(AVG(total_amount), 0) as average_order_value
      FROM orders 
      WHERE status IN ('confirmed', 'processing', 'shipped', 'delivered')
      ${singleTableDateFilter}
    `);

    // Monthly sales trend
    const monthlySalesResult = await query(`
      SELECT 
        TO_CHAR(created_at, 'Mon') as month,
        COALESCE(SUM(total_amount), 0) as sales,
        COUNT(*) as orders,
        COALESCE(AVG(total_amount), 0) as avg_order
      FROM orders 
      WHERE status IN ('confirmed', 'processing', 'shipped', 'delivered')
      ${singleTableDateFilter}
      GROUP BY TO_CHAR(created_at, 'Mon'), EXTRACT(month FROM created_at)
      ORDER BY EXTRACT(month FROM created_at)
    `);

    // Top selling books
    const topBooksResult = await query(`
      SELECT 
        b.title,
        COUNT(oi.id) as sales,
        COALESCE(SUM(oi.total_price), 0) as revenue,
        0 as growth
      FROM order_items oi
      JOIN books b ON oi.book_id = b.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status IN ('confirmed', 'processing', 'shipped', 'delivered')
      ${ordersDateFilter}
      GROUP BY b.id, b.title
      ORDER BY sales DESC
      LIMIT 5
    `);

    // Category sales
    const categorySalesResult = await query(`
      SELECT 
        c.name,
        COUNT(oi.id) as value,
        COALESCE(SUM(oi.total_price), 0) as sales
      FROM order_items oi
      JOIN books b ON oi.book_id = b.id
      JOIN categories c ON b.category_id = c.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status IN ('confirmed', 'processing', 'shipped', 'delivered')
      ${ordersDateFilter}
      GROUP BY c.id, c.name
      ORDER BY sales DESC
      LIMIT 5
    `);

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    const categorySales = categorySalesResult.rows.map((cat, index) => ({
      ...cat,
      color: colors[index % colors.length]
    }));

    return {
      total_revenue: parseFloat(totalsResult.rows[0].total_revenue),
      total_orders: parseInt(totalsResult.rows[0].total_orders),
      average_order_value: parseFloat(totalsResult.rows[0].average_order_value),
      monthly_sales: monthlySalesResult.rows,
      top_books: topBooksResult.rows,
      category_sales: categorySales
    };
  }

  // User Library
  async getUserLibrary(userId: number): Promise<Book[]> {
    const result = await query(`
      SELECT 
        b.*,
        a.name as author_name,
        c.name as category_name,
        ul.purchase_date,
        ul.download_count,
        ul.last_downloaded_at,
        ul.is_favorite
      FROM user_library ul
      JOIN books b ON ul.book_id = b.id
      LEFT JOIN authors a ON b.author_id = a.id
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE ul.user_id = $1
      ORDER BY ul.purchase_date DESC
    `, [userId]);
    return result.rows;
  }

  async addToLibrary(userId: number, bookId: number, orderId?: number): Promise<boolean> {
    const result = await query(`
      INSERT INTO user_library (user_id, book_id, order_id)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, book_id) DO NOTHING
    `, [userId, bookId, orderId]);
    return (result.rowCount || 0) > 0;
  }

  // Alias method for enhanced checkout compatibility
  async addToUserLibrary(userId: number, bookId: number, orderId?: number): Promise<boolean> {
    return this.addToLibrary(userId, bookId, orderId);
  }

  async hasUserPurchasedBook(userId: number, bookId: number): Promise<boolean> {
    const result = await query(`
      SELECT COUNT(*) as count
      FROM user_library
      WHERE user_id = $1 AND book_id = $2
    `, [userId, bookId]);
    
    return parseInt(result.rows[0]?.count || '0') > 0;
  }



  // Reading Progress
  async getReadingProgress(userId: number, bookId: number): Promise<any> {
    const result = await query(`
      SELECT * FROM reading_progress
      WHERE user_id = $1 AND book_id = $2
    `, [userId, bookId]);
    return result.rows[0] || null;
  }

  async updateReadingProgress(userId: number, bookId: number, currentPage: number, totalPages?: number): Promise<any> {
    const progressPercentage = totalPages ? (currentPage / totalPages) * 100 : 0;
    
    const result = await query(`
      INSERT INTO reading_progress (user_id, book_id, current_page, total_pages, progress_percentage, last_read_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, book_id)
      DO UPDATE SET 
        current_page = EXCLUDED.current_page,
        total_pages = EXCLUDED.total_pages,
        progress_percentage = EXCLUDED.progress_percentage,
        last_read_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [userId, bookId, currentPage, totalPages, progressPercentage]);
    
    return result.rows[0];
  }

  async getUserStats(userId: number): Promise<any> {
    try {
      // Get total books in library
      const libraryResult = await query(`
        SELECT COUNT(*) as total_books
        FROM user_library
        WHERE user_id = $1
      `, [userId]);

      // Get completed books (progress = 100%)
      const completedResult = await query(`
        SELECT COUNT(*) as completed_books
        FROM reading_progress
        WHERE user_id = $1 AND progress_percentage >= 100
      `, [userId]);

      // Get currently reading books (progress > 0 and < 100%)
      const readingResult = await query(`
        SELECT COUNT(*) as currently_reading
        FROM reading_progress
        WHERE user_id = $1 AND progress_percentage > 0 AND progress_percentage < 100
      `, [userId]);

      // Get total reading hours (estimated based on pages read)
      const hoursResult = await query(`
        SELECT COALESCE(SUM(rp.current_page * 0.016), 0) as total_hours
        FROM reading_progress rp
        JOIN books b ON rp.book_id = b.id
        WHERE rp.user_id = $1 AND rp.current_page > 0
      `, [userId]);

      // Get reading streak (consecutive days with reading activity)
      const streakResult = await query(`
        WITH reading_days AS (
          SELECT DISTINCT DATE(last_read_at) as read_date
          FROM reading_progress
          WHERE user_id = $1 AND last_read_at >= CURRENT_DATE - INTERVAL '30 days'
          ORDER BY read_date DESC
        ),
        streak_calc AS (
          SELECT 
            read_date,
            ROW_NUMBER() OVER (ORDER BY read_date DESC) as rn,
            read_date + (ROW_NUMBER() OVER (ORDER BY read_date DESC) - 1) * INTERVAL '1 day' as expected_date
          FROM reading_days
        )
        SELECT COUNT(*) as streak
        FROM streak_calc
        WHERE read_date = expected_date
        AND read_date >= CURRENT_DATE - INTERVAL '30 days'
      `, [userId]);

      return {
        booksRead: parseInt(completedResult.rows[0]?.completed_books || '0'),
        currentlyReading: parseInt(readingResult.rows[0]?.currently_reading || '0'),
        totalBooks: parseInt(libraryResult.rows[0]?.total_books || '0'),
        totalHours: Math.round(parseFloat(hoursResult.rows[0]?.total_hours || '0')),
        streak: parseInt(streakResult.rows[0]?.streak || '0')
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }

  // Reading Goals
  async getReadingGoals(userId: number): Promise<any[]> {
    const result = await query(`
      SELECT * FROM reading_goals
      WHERE user_id = $1 AND is_active = TRUE
      ORDER BY start_date DESC
    `, [userId]);
    return result.rows;
  }

  async createReadingGoal(userId: number, goalData: any): Promise<any> {
    const result = await query(`
      INSERT INTO reading_goals (user_id, goal_type, target_value, start_date, end_date)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [userId, goalData.goal_type, goalData.target_value, goalData.start_date, goalData.end_date]);
    return result.rows[0];
  }

  async updateReadingGoal(goalId: number, goalData: any): Promise<any> {
    const result = await query(`
      UPDATE reading_goals
      SET target_value = $1, current_value = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `, [goalData.target_value, goalData.current_value, goalId]);
    return result.rows[0];
  }

  // User Activity
  async getUserActivity(userId: number, limit: number = 10): Promise<any[]> {
    const result = await query(`
      SELECT ua.*, b.title as book_title, b.cover_image_url
      FROM user_activity ua
      LEFT JOIN books b ON ua.book_id = b.id
      WHERE ua.user_id = $1
      ORDER BY ua.created_at DESC
      LIMIT $2
    `, [userId, limit]);
    return result.rows;
  }

  async addUserActivity(userId: number, activityData: any): Promise<any> {
    const result = await query(`
      INSERT INTO user_activity (user_id, activity_type, title, description, book_id, metadata)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [userId, activityData.activity_type, activityData.title, activityData.description, activityData.book_id, JSON.stringify(activityData.metadata || {})]);
    return result.rows[0];
  }

  // Notifications
  async getUserNotifications(userId: number, limit: number = 10): Promise<any[]> {
    const result = await query(`
      SELECT * FROM user_notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `, [userId, limit]);
    return result.rows;
  }

  async createNotification(userId: number, notificationData: any): Promise<any> {
    const result = await query(`
      INSERT INTO user_notifications (user_id, type, title, message, metadata)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [userId, notificationData.type, notificationData.title, notificationData.message, JSON.stringify(notificationData.metadata || {})]);
    return result.rows[0];
  }

  async markNotificationAsRead(notificationId: number): Promise<any> {
    const result = await query(`
      UPDATE user_notifications
      SET is_read = TRUE
      WHERE id = $1
      RETURNING *
    `, [notificationId]);
    return result.rows[0];
  }

  async getUnreadNotificationCount(userId: number): Promise<number> {
    const result = await query(`
      SELECT COUNT(*) as count
      FROM user_notifications
      WHERE user_id = $1 AND is_read = FALSE
    `, [userId]);
    return parseInt(result.rows[0]?.count || '0');
  }

  // Admin Notification Management
  async getAdminNotifications(filters: any = {}, page: number = 1, limit: number = 20): Promise<{ notifications: any[], total: number, pages: number }> {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    let params: any[] = [];
    let paramIndex = 1;

    if (filters.type) {
      whereClause += ` AND un.type = $${paramIndex}`;
      params.push(filters.type);
      paramIndex++;
    }

    if (filters.is_read !== undefined) {
      whereClause += ` AND un.is_read = $${paramIndex}`;
      params.push(filters.is_read);
      paramIndex++;
    }

    if (filters.user_id) {
      whereClause += ` AND un.user_id = $${paramIndex}`;
      params.push(filters.user_id);
      paramIndex++;
    }

    if (filters.search) {
      whereClause += ` AND (un.title ILIKE $${paramIndex} OR un.message ILIKE $${paramIndex} OR u.first_name ILIKE $${paramIndex} OR u.last_name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    const countResult = await query(`
      SELECT COUNT(*) as total
      FROM user_notifications un
      LEFT JOIN users u ON un.user_id = u.id
      ${whereClause}
    `, params);

    const notificationsResult = await query(`
      SELECT 
        un.*,
        u.first_name,
        u.last_name,
        u.email as user_email
      FROM user_notifications un
      LEFT JOIN users u ON un.user_id = u.id
      ${whereClause}
      ORDER BY un.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, limit, offset]);

    const total = parseInt(countResult.rows[0].total);
    const pages = Math.ceil(total / limit);

    return {
      notifications: notificationsResult.rows,
      total,
      pages
    };
  }

  async updateNotification(notificationId: number, updateData: any, adminUserId?: number): Promise<any> {
    const updateFields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (updateData.isRead !== undefined) {
      updateFields.push(`is_read = $${paramIndex}`);
      params.push(updateData.isRead);
      paramIndex++;
    }

    if (updateData.title) {
      updateFields.push(`title = $${paramIndex}`);
      params.push(updateData.title);
      paramIndex++;
    }

    if (updateData.message) {
      updateFields.push(`message = $${paramIndex}`);
      params.push(updateData.message);
      paramIndex++;
    }

    if (updateFields.length === 0) {
      throw new Error('No fields to update');
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    const result = await query(`
      UPDATE user_notifications 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `, [...params, notificationId]);

    // Log admin action if adminUserId is provided
    if (adminUserId) {
      await query(`
        INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        adminUserId,
        'UPDATE_NOTIFICATION',
        'user_notifications',
        notificationId,
        JSON.stringify({ 
          old_values: {},
          new_values: updateData
        }),
        'admin_dashboard'
      ]);
    }

    return result.rows[0];
  }

  async deleteNotification(notificationId: number, adminUserId?: number): Promise<boolean> {
    try {
      // Get notification details before deletion for audit log
      const notificationResult = await query(`
        SELECT * FROM user_notifications WHERE id = $1
      `, [notificationId]);

      if (notificationResult.rows.length === 0) {
        return false;
      }

      const notification = notificationResult.rows[0];

      // Delete the notification
      await query(`
        DELETE FROM user_notifications WHERE id = $1
      `, [notificationId]);

      // Log admin action if adminUserId is provided
      if (adminUserId) {
        await query(`
          INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          adminUserId,
          'DELETE_NOTIFICATION',
          'user_notifications',
          notificationId,
          JSON.stringify({ 
            old_values: notification,
            new_values: {}
          }),
          'admin_dashboard'
        ]);
      }

      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  async batchDeleteNotifications(notificationIds: number[], adminUserId?: number): Promise<{ deletedCount: number }> {
    try {
      if (notificationIds.length === 0) {
        return { deletedCount: 0 };
      }

      // Get notification details before deletion for audit log
      const notificationsResult = await query(`
        SELECT * FROM user_notifications WHERE id = ANY($1)
      `, [notificationIds]);

      const notifications = notificationsResult.rows;

      // Delete the notifications
      const deleteResult = await query(`
        DELETE FROM user_notifications WHERE id = ANY($1)
      `, [notificationIds]);

      const deletedCount = deleteResult.rowCount || 0;

      // Log admin action if adminUserId is provided
      if (adminUserId && deletedCount > 0) {
        await query(`
          INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          adminUserId,
          'BATCH_DELETE_NOTIFICATIONS',
          'user_notifications',
          0,
          JSON.stringify({ 
            old_values: { notifications },
            new_values: {},
            deleted_count: deletedCount,
            notification_ids: notificationIds
          }),
          'admin_dashboard'
        ]);
      }

      return { deletedCount };
    } catch (error) {
      console.error('Error batch deleting notifications:', error);
      return { deletedCount: 0 };
    }
  }

  async createSystemNotification(notificationData: any): Promise<any> {
    // Get all active users
    const usersResult = await query(`
      SELECT id FROM users WHERE status = 'active'
    `);

    const notifications = [];
    for (const user of usersResult.rows) {
      const result = await query(`
        INSERT INTO user_notifications (user_id, type, title, message, metadata)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [
        user.id,
        notificationData.type,
        notificationData.title,
        notificationData.message,
        notificationData.metadata ? JSON.stringify(notificationData.metadata) : null
      ]);
      notifications.push(result.rows[0]);
    }

    // Log system notification creation
    if (notificationData.createdBy) {
      await query(`
        INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        notificationData.createdBy,
        'CREATE_SYSTEM_NOTIFICATION',
        'user_notifications',
        0,
        JSON.stringify({ 
          old_values: {},
          new_values: { ...notificationData, recipients_count: notifications.length }
        }),
        'admin_dashboard'
      ]);
    }

    return {
      success: true,
      notifications_created: notifications.length,
      notifications
    };
  }

  // Admin Review Statistics
  async getAdminReviewStats(): Promise<any> {
    try {
      const result = await query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
          COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
          COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
          COUNT(CASE WHEN is_featured = true AND status = 'approved' THEN 1 END) as featured,
          AVG(rating) as average_rating
        FROM book_reviews
      `);

      return {
        total: parseInt(result.rows[0]?.total || '0'),
        pending: parseInt(result.rows[0]?.pending || '0'),
        approved: parseInt(result.rows[0]?.approved || '0'),
        rejected: parseInt(result.rows[0]?.rejected || '0'),
        featured: parseInt(result.rows[0]?.featured || '0'),
        averageRating: parseFloat(result.rows[0]?.average_rating || '0')
      };
    } catch (error) {
      console.error('Error in getAdminReviewStats:', error);
      
      // Return default stats if query fails
      return {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        featured: 0,
        averageRating: 0
      };
    }
  }

  // Admin Notification Statistics
  async getAdminNotificationStats(): Promise<any> {
    const result = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN is_read = false THEN 1 END) as unread,
        COUNT(CASE WHEN is_read = true THEN 1 END) as read,
        COUNT(CASE WHEN type = 'achievement' THEN 1 END) as achievement,
        COUNT(CASE WHEN type = 'book' THEN 1 END) as book,
        COUNT(CASE WHEN type = 'social' THEN 1 END) as social,
        COUNT(CASE WHEN type = 'reminder' THEN 1 END) as reminder,
        COUNT(CASE WHEN type = 'system' THEN 1 END) as system
      FROM user_notifications
    `);

    return {
      total: parseInt(result.rows[0]?.total || '0'),
      unread: parseInt(result.rows[0]?.unread || '0'),
      read: parseInt(result.rows[0]?.read || '0'),
      byType: {
        achievement: parseInt(result.rows[0]?.achievement || '0'),
        book: parseInt(result.rows[0]?.book || '0'),
        social: parseInt(result.rows[0]?.social || '0'),
        reminder: parseInt(result.rows[0]?.reminder || '0'),
        system: parseInt(result.rows[0]?.system || '0')
      }
    };
  }

  // Achievements
  async getUserAchievements(userId: number): Promise<any[]> {
    const result = await query(`
      SELECT * FROM user_achievements
      WHERE user_id = $1
      ORDER BY earned_at DESC
    `, [userId]);
    return result.rows;
  }

  async createAchievement(userId: number, achievementData: any): Promise<any> {
    const result = await query(`
      INSERT INTO user_achievements (user_id, achievement_type, title, description, icon, metadata)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [userId, achievementData.achievement_type, achievementData.title, achievementData.description, achievementData.icon, JSON.stringify(achievementData.metadata || {})]);
    return result.rows[0];
  }

  // Review Statistics
  async getReviewStats(userId: number): Promise<any> {
    const result = await query(`
      SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as average_rating,
        SUM(is_helpful_count) as helpful_votes
      FROM book_reviews
      WHERE user_id = $1 AND status = 'approved'
    `, [userId]);

    const recentReviews = await query(`
      SELECT br.*, b.title as book_title
      FROM book_reviews br
      JOIN books b ON br.book_id = b.id
      WHERE br.user_id = $1 AND br.status = 'approved'
      ORDER BY br.created_at DESC
      LIMIT 5
    `, [userId]);

    return {
      totalReviews: parseInt(result.rows[0]?.total_reviews || '0'),
      averageRating: parseFloat(result.rows[0]?.average_rating || '0'),
      helpfulVotes: parseInt(result.rows[0]?.helpful_votes || '0'),
      recentReviews: recentReviews.rows
    };
  }

  // Reading Analytics
  async getReadingAnalytics(userId: number): Promise<any> {
    // Monthly reading data
    const monthlyData = await query(`
      SELECT 
        TO_CHAR(DATE(last_read_at), 'Mon') as month,
        COUNT(DISTINCT book_id) as books,
        COALESCE(SUM(current_page * 0.016), 0) as hours
      FROM reading_progress
      WHERE user_id = $1 
        AND last_read_at >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY TO_CHAR(DATE(last_read_at), 'Mon'), DATE_TRUNC('month', last_read_at)
      ORDER BY DATE_TRUNC('month', last_read_at)
    `, [userId]);

    // Genre distribution
    const genreData = await query(`
      SELECT 
        c.name,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
      FROM reading_progress rp
      JOIN books b ON rp.book_id = b.id
      JOIN categories c ON b.category_id = c.id
      WHERE rp.user_id = $1 AND rp.progress_percentage >= 100
      GROUP BY c.name
      ORDER BY count DESC
      LIMIT 5
    `, [userId]);

    // Overall stats
    const stats = await query(`
      SELECT 
        COALESCE(SUM(rp.current_page * 0.016), 0) as total_hours,
        COUNT(DISTINCT DATE(rp.last_read_at)) as reading_days,
        COUNT(DISTINCT rp.book_id) as total_books,
        COALESCE(AVG(rp.current_page), 0) as avg_pages_per_book
      FROM reading_progress rp
      WHERE rp.user_id = $1
    `, [userId]);

    return {
      monthlyData: monthlyData.rows,
      genreData: genreData.rows,
      stats: {
        totalHours: Math.round(parseFloat(stats.rows[0]?.total_hours || '0')),
        readingDays: parseInt(stats.rows[0]?.reading_days || '0'),
        totalBooks: parseInt(stats.rows[0]?.total_books || '0'),
        avgPagesPerBook: Math.round(parseFloat(stats.rows[0]?.avg_pages_per_book || '0'))
      }
    };
  }
}

export const ecommerceService = new EcommerceService(); 