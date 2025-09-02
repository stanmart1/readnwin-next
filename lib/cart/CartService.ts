import { query } from '@/utils/database';
import { sanitizeApiResponse, safeLog } from '@/utils/security';
import { validateAndSanitizeInput } from '@/utils/input-validation';
import { initCartTable } from '@/utils/init-cart-table';

export interface CartItem {
  id: number;
  user_id: number;
  book_id: number;
  quantity: number;
  price: number;
  total_price: number;
  created_at: Date;
  updated_at: Date;
  book: {
    id: number;
    title: string;
    author_name: string;
    price: number;
    original_price?: number;
    cover_image_url: string;
    format: 'ebook' | 'physical' | 'both';
    stock_quantity: number;
    is_available: boolean;
  };
}

export interface CartSummary {
  totalItems: number;
  totalValue: number;
  totalSavings: number;
  ebookCount: number;
  physicalCount: number;
  isEbookOnly: boolean;
  isPhysicalOnly: boolean;
  isMixedCart: boolean;
}

export class CartService {
  private static instance: CartService;

  static getInstance(): CartService {
    if (!CartService.instance) {
      CartService.instance = new CartService();
    }
    return CartService.instance;
  }

  async getCartItems(userId: number): Promise<CartItem[]> {
    try {
      const validation = validateAndSanitizeInput({ userId }, {
        userId: { required: true, type: 'number', min: 1 }
      });

      if (!validation.isValid) {
        throw new Error('Invalid user ID');
      }

      // Check if cart_items table exists, if not return empty array
      let result;
      try {
        result = await query(`
          SELECT 
            ci.id,
            ci.user_id,
            ci.book_id,
            ci.quantity,
            ci.price,
            ci.total_price,
            ci.created_at,
            ci.updated_at,
            b.id as book_id,
            b.title,
            COALESCE(a.name, 'Unknown Author') as author_name,
            b.price as current_price,
            b.original_price,
            b.cover_image_url,
            b.format as format,
            COALESCE(b.stock_quantity, 0) as stock_quantity,
            (b.status = 'published' AND COALESCE(b.stock_quantity, 0) > 0) as is_available
          FROM cart_items ci
          JOIN books b ON ci.book_id = b.id
          LEFT JOIN authors a ON b.author_id = a.id
          WHERE ci.user_id = $1 AND b.status = 'published'
          ORDER BY ci.created_at DESC
        `, [validation.sanitizedData.userId]);
      } catch (tableError) {
        // If table doesn't exist, try to create it and return empty array
        safeLog.warn('Cart table may not exist, attempting to create it');
        await initCartTable();
        return [];
      }

        const cartItems: CartItem[] = result.rows.map(row => ({
          id: row.id,
          user_id: row.user_id,
          book_id: row.book_id,
          quantity: row.quantity,
          price: parseFloat(row.price),
          total_price: parseFloat(row.total_price),
          created_at: row.created_at,
          updated_at: row.updated_at,
          book: {
            id: row.book_id,
            title: row.title,
            author_name: row.author_name,
            price: parseFloat(row.current_price),
            original_price: row.original_price ? parseFloat(row.original_price) : undefined,
            cover_image_url: row.cover_image_url || '/placeholder-book.jpg',
            format: row.format,
            stock_quantity: row.stock_quantity,
            is_available: row.is_available
          }
        }));

        return sanitizeApiResponse(cartItems);
    } catch (error) {
      safeLog.error('Error fetching cart items:', error);
      throw new Error('Failed to fetch cart items');
    }
  }

  async addToCart(userId: number, bookId: number, quantity: number = 1): Promise<CartItem> {
    try {
      const validation = validateAndSanitizeInput({ userId, bookId, quantity }, {
        userId: { required: true, type: 'number', min: 1 },
        bookId: { required: true, type: 'number', min: 1 },
        quantity: { required: true, type: 'number', min: 1, max: 99 }
      });

      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const { userId: validUserId, bookId: validBookId, quantity: validQuantity } = validation.sanitizedData;

      // Check if book exists and is available
      const bookResult = await query(`
        SELECT id, title, price, original_price, format, stock_quantity, status
        FROM books 
        WHERE id = $1 AND status = 'published'
      `, [validBookId]);

      if (bookResult.rows.length === 0) {
        throw new Error('Book not found or not available');
      }

      const book = bookResult.rows[0];

      // Stock validation removed - allow zero stock checkouts

      // Check if item already exists in cart
      const existingResult = await query(`
        SELECT id, quantity FROM cart_items 
        WHERE user_id = $1 AND book_id = $2
      `, [validUserId, validBookId]);

      const currentPrice = parseFloat(book.price);
      const totalPrice = currentPrice * validQuantity;

      let cartItem: CartItem;

      if (existingResult.rows.length > 0) {
        // Update existing item
        const existingItem = existingResult.rows[0];
        const newQuantity = existingItem.quantity + validQuantity;

        // Stock validation removed - allow zero stock checkouts

        const newTotalPrice = currentPrice * newQuantity;

        const updateResult = await query(`
          UPDATE cart_items 
          SET quantity = $1, price = $2, total_price = $3, format = $4, updated_at = NOW()
          WHERE id = $5
          RETURNING *
        `, [newQuantity, currentPrice, newTotalPrice, book.format || 'physical', existingItem.id]);

        cartItem = this.mapRowToCartItem(updateResult.rows[0], book);
      } else {
        // Create new item
        const insertResult = await query(`
          INSERT INTO cart_items (user_id, book_id, quantity, format, price, total_price, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
          RETURNING *
        `, [validUserId, validBookId, validQuantity, book.format || 'physical', currentPrice, totalPrice]);

        cartItem = this.mapRowToCartItem(insertResult.rows[0], book);
      }

      safeLog.info('Item added to cart successfully', { userId: validUserId, bookId: validBookId, quantity: validQuantity });
      return sanitizeApiResponse(cartItem);
    } catch (error) {
      safeLog.error('Error adding to cart:', error);
      throw error;
    }
  }

  async updateQuantity(userId: number, bookId: number, quantity: number): Promise<CartItem> {
    try {
      const validation = validateAndSanitizeInput({ userId, bookId, quantity }, {
        userId: { required: true, type: 'number', min: 1 },
        bookId: { required: true, type: 'number', min: 1 },
        quantity: { required: true, type: 'number', min: 1, max: 99 }
      });

      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const { userId: validUserId, bookId: validBookId, quantity: validQuantity } = validation.sanitizedData;

      // Get book and cart item info
      const result = await query(`
        SELECT ci.id, ci.price, b.format, b.stock_quantity, b.title, b.status
        FROM cart_items ci
        JOIN books b ON ci.book_id = b.id
        WHERE ci.user_id = $1 AND ci.book_id = $2 AND b.status = 'published'
      `, [validUserId, validBookId]);

      if (result.rows.length === 0) {
        throw new Error('Cart item not found');
      }

      const { id: cartItemId, price, format, stock_quantity, title } = result.rows[0];

      // Check stock for physical books
      if (format === 'physical' && stock_quantity < validQuantity) {
        throw new Error('Insufficient stock available');
      }

      const totalPrice = parseFloat(price) * validQuantity;

      const updateResult = await query(`
        UPDATE cart_items 
        SET quantity = $1, total_price = $2, updated_at = NOW()
        WHERE id = $3
        RETURNING *
      `, [validQuantity, totalPrice, cartItemId]);

      const updatedItem = this.mapRowToCartItem(updateResult.rows[0], { title, format });
      
      safeLog.info('Cart quantity updated', { userId: validUserId, bookId: validBookId, quantity: validQuantity });
      return sanitizeApiResponse(updatedItem);
    } catch (error) {
      safeLog.error('Error updating cart quantity:', error);
      throw error;
    }
  }

  async removeFromCart(userId: number, bookId: number): Promise<void> {
    try {
      const validation = validateAndSanitizeInput({ userId, bookId }, {
        userId: { required: true, type: 'number', min: 1 },
        bookId: { required: true, type: 'number', min: 1 }
      });

      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const { userId: validUserId, bookId: validBookId } = validation.sanitizedData;

      const result = await query(`
        DELETE FROM cart_items 
        WHERE user_id = $1 AND book_id = $2
        RETURNING id
      `, [validUserId, validBookId]);

      if (result.rows.length === 0) {
        throw new Error('Cart item not found');
      }

      safeLog.info('Item removed from cart', { userId: validUserId, bookId: validBookId });
    } catch (error) {
      safeLog.error('Error removing from cart:', error);
      throw error;
    }
  }

  async clearCart(userId: number): Promise<void> {
    try {
      const validation = validateAndSanitizeInput({ userId }, {
        userId: { required: true, type: 'number', min: 1 }
      });

      if (!validation.isValid) {
        throw new Error('Invalid user ID');
      }

      await query(`DELETE FROM cart_items WHERE user_id = $1`, [validation.sanitizedData.userId]);
      
      safeLog.info('Cart cleared', { userId: validation.sanitizedData.userId });
    } catch (error) {
      safeLog.error('Error clearing cart:', error);
      throw error;
    }
  }

  async getCartSummary(userId: number): Promise<CartSummary> {
    try {
      const validation = validateAndSanitizeInput({ userId }, {
        userId: { required: true, type: 'number', min: 1 }
      });

      if (!validation.isValid) {
        throw new Error('Invalid user ID');
      }

      const result = await query(`
        SELECT 
          COUNT(*) as total_items,
          SUM(ci.total_price) as total_value,
          SUM(CASE WHEN b.original_price > b.price THEN (b.original_price - b.price) * ci.quantity ELSE 0 END) as total_savings,
          SUM(CASE WHEN b.format = 'ebook' THEN ci.quantity ELSE 0 END) as ebook_count,
          SUM(CASE WHEN b.format = 'physical' THEN ci.quantity ELSE 0 END) as physical_count
        FROM cart_items ci
        JOIN books b ON ci.book_id = b.id
        WHERE ci.user_id = $1 AND b.status = 'published'
      `, [validation.sanitizedData.userId]);

      const row = result.rows[0];
      const totalItems = parseInt(row.total_items) || 0;
      const totalValue = parseFloat(row.total_value) || 0;
      const totalSavings = parseFloat(row.total_savings) || 0;
      const ebookCount = parseInt(row.ebook_count) || 0;
      const physicalCount = parseInt(row.physical_count) || 0;

      const summary: CartSummary = {
        totalItems,
        totalValue,
        totalSavings,
        ebookCount,
        physicalCount,
        isEbookOnly: totalItems > 0 && ebookCount > 0 && physicalCount === 0,
        isPhysicalOnly: totalItems > 0 && physicalCount > 0 && ebookCount === 0,
        isMixedCart: totalItems > 0 && ebookCount > 0 && physicalCount > 0
      };

      return sanitizeApiResponse(summary);
    } catch (error) {
      safeLog.error('Error getting cart summary:', error);
      throw new Error('Failed to get cart summary');
    }
  }

  private mapRowToCartItem(row: any, bookInfo: any): CartItem {
    return {
      id: row.id,
      user_id: row.user_id,
      book_id: row.book_id,
      quantity: row.quantity,
      price: parseFloat(row.price),
      total_price: parseFloat(row.total_price),
      created_at: row.created_at,
      updated_at: row.updated_at,
      book: {
        id: row.book_id,
        title: bookInfo.title,
        author_name: bookInfo.author_name || 'Unknown Author',
        price: parseFloat(row.price),
        original_price: bookInfo.original_price ? parseFloat(bookInfo.original_price) : undefined,
        cover_image_url: bookInfo.cover_image_url || '/placeholder-book.jpg',
        format: bookInfo.format,
        stock_quantity: bookInfo.stock_quantity || 0,
        is_available: true
      }
    };
  }
}

export const cartService = CartService.getInstance();