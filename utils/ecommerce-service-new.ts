import { query, transaction } from './database.ts';
import {
  Book, CartItem, CartAnalytics, Order, OrderItem, UserLibraryItem,
  ShippingAddress, BillingAddress, ShippingMethod, TaxRate, Discount,
  PaymentTransaction, BankTransferProof, CheckoutSummary, PaymentGateway,
  FlutterwavePaymentData, PayStackPaymentData, ApiResponse
} from '@/types/ecommerce';

export class EcommerceService {
  // Book Management
  async getBookById(id: number): Promise<Book | null> {
    try {
      const result = await query(`
        SELECT 
          b.id,
          b.title,
          b.author_id,
          b.category_id,
          b.price,
          b.isbn,
          b.description,
          b.language,
          b.pages,
          b.publication_date,
          b.publisher,
          'ebook' as book_type,
          COALESCE(b.format, 'unknown') as format,
          'pending' as parsing_status,
          b.cover_image_url,
          b.ebook_file_url,
          b.status,
          b.created_at,
          b.updated_at,
          a.name as author_name,
          c.name as category_name
        FROM books b
        LEFT JOIN authors a ON b.author_id = a.id
        LEFT JOIN categories c ON b.category_id = c.id
        WHERE b.id = $1 AND b.status = 'published'
      `, [id]);

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting book by ID:', error);
      throw error;
    }
  }

  async getBooksByFormat(format: 'ebook' | 'physical' | 'both', limit: number = 20): Promise<Book[]> {
    try {
      const result = await query(`
        SELECT 
          b.*,
          a.name as author_name,
          c.name as category_name
        FROM books b
        LEFT JOIN authors a ON b.author_id = a.id
        LEFT JOIN categories c ON b.category_id = c.id
        WHERE b.format = $1 AND b.status = 'published'
        ORDER BY b.created_at DESC
        LIMIT $2
      `, [format, limit]);

      return result.rows;
    } catch (error) {
      console.error('Error getting books by format:', error);
      throw error;
    }
  }

  // Cart Management
  async getCartItems(userId: number): Promise<CartItem[]> {
    try {
      const result = await query(`
        SELECT 
          ci.*,
          b.id as book_id,
          b.title, b.price, b.original_price, b.cover_image_url, b.author_id,
          b.category_id, b.format, b.status, b.stock_quantity,
          a.name as author_name,
          c.name as category_name
        FROM cart_items ci
        JOIN books b ON ci.book_id = b.id
        LEFT JOIN authors a ON b.author_id = a.id
        LEFT JOIN categories c ON b.category_id = c.id
        WHERE ci.user_id = $1 AND b.status = 'published'
        ORDER BY ci.created_at DESC
      `, [userId]);

      return result.rows.map(row => ({
        id: row.id,
        user_id: row.user_id,
        book_id: row.book_id,
        quantity: row.quantity,
        added_at: row.created_at,
        book: {
          id: row.book_id,
          title: row.title,
          author_name: row.author_name,
          price: row.price,
          original_price: row.original_price,
          cover_image_url: row.cover_image_url,
          category_name: row.category_name,
          format: row.format,
          status: row.status,
          stock_quantity: row.stock_quantity
        }
      }));
    } catch (error) {
      console.error('Error getting cart items:', error);
      throw error;
    }
  }

  async addToCart(userId: number, bookId: number, quantity: number = 1): Promise<CartItem> {
    try {
      // Check if book exists and has stock
      const book = await this.getBookById(bookId);
      if (!book) {
        throw new Error('Book not found');
      }

      // Only check stock for physical books with inventory tracking (stock_quantity > 0)
      if (book.format === 'physical' && book.stock_quantity > 0 && book.stock_quantity < quantity) {
        throw new Error('Insufficient stock');
      }

      // Check if item already exists in cart
      const existingItem = await query(`
        SELECT * FROM cart_items WHERE user_id = $1 AND book_id = $2
      `, [userId, bookId]);

      if (existingItem.rows.length > 0) {
        // Update quantity and ensure format is correct
        const newQuantity = existingItem.rows[0].quantity + quantity;
        await query(`
          UPDATE cart_items SET quantity = $1, format = $2 WHERE user_id = $3 AND book_id = $4
        `, [newQuantity, book.format, userId, bookId]);

        const items = await this.getCartItems(userId);
        const cartItem = items.find(item => item.book_id === bookId);
        if (!cartItem) {
          throw new Error('Failed to retrieve cart item after updating');
        }
        return cartItem;
      } else {
        // Add new item
        const result = await query(`
          INSERT INTO cart_items (user_id, book_id, quantity, format)
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `, [userId, bookId, quantity, book.format]);

        const items = await this.getCartItems(userId);
        const cartItem = items.find(item => item.book_id === bookId);
        if (!cartItem) {
          throw new Error('Failed to retrieve cart item after adding');
        }
        return cartItem;
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  async updateCartItemQuantity(userId: number, bookId: number, quantity: number): Promise<CartItem> {
    try {
      if (quantity <= 0) {
        await this.removeFromCart(userId, bookId);
        throw new Error('Item removed from cart');
      }

      // Check stock for physical books with inventory tracking
      const book = await this.getBookById(bookId);
      if (book?.format === 'physical' && book.stock_quantity > 0 && book.stock_quantity < quantity) {
        throw new Error('Insufficient stock');
      }

      await query(`
        UPDATE cart_items SET quantity = $1, format = $2 WHERE user_id = $3 AND book_id = $4
      `, [quantity, book?.format || 'ebook', userId, bookId]);

      const items = await this.getCartItems(userId);
      const cartItem = items.find(item => item.book_id === bookId);
      if (!cartItem) {
        throw new Error('Failed to retrieve cart item after updating quantity');
      }
      return cartItem;
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      throw error;
    }
  }

  async removeFromCart(userId: number, bookId: number): Promise<void> {
    try {
      await query(`
        DELETE FROM cart_items WHERE user_id = $1 AND book_id = $2
      `, [userId, bookId]);
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  }

  async clearCart(userId: number): Promise<void> {
    try {
      await query(`
        DELETE FROM cart_items WHERE user_id = $1
      `, [userId]);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
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
        await query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
        return true;
      } else {
        console.log('⚠️ Payment not confirmed yet, preserving cart. Status:', order.payment_status, 'Order status:', order.status);
        return false;
      }
    } catch (error) {
      console.error('Error clearing cart after payment success:', error);
      return false;
    }
  }

  async getCartAnalytics(userId: number): Promise<CartAnalytics> {
    try {
      const cartItems = await this.getCartItems(userId);
      
      const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
      const totalValue = cartItems.reduce((total, item) => {
        const price = item.book?.price || 0;
        return total + (price * item.quantity);
      }, 0);

      const totalSavings = cartItems.reduce((total, item) => {
        const book = item.book;
        if (book?.original_price && book.original_price > book.price) {
          return total + ((book.original_price - book.price) * item.quantity);
        }
        return total;
      }, 0);

      const ebookCount = cartItems.filter(item => 
        item.book?.format === 'ebook' || item.book?.format === 'both'
      ).reduce((total, item) => total + item.quantity, 0);

      const physicalCount = cartItems.filter(item => 
        item.book?.format === 'physical' || item.book?.format === 'both'
      ).reduce((total, item) => total + item.quantity, 0);

      const isEbookOnly = ebookCount > 0 && physicalCount === 0;
      const isPhysicalOnly = physicalCount > 0 && ebookCount === 0;
      const isMixedCart = ebookCount > 0 && physicalCount > 0;

      return {
        totalItems,
        totalValue,
        totalSavings,
        itemCount: cartItems.length,
        averageItemValue: totalItems > 0 ? totalValue / totalItems : 0,
        ebookCount,
        physicalCount,
        isEbookOnly,
        isPhysicalOnly,
        isMixedCart
      };
    } catch (error) {
      console.error('Error getting cart analytics:', error);
      throw error;
    }
  }

  // Shipping and Tax
  async getShippingMethods(): Promise<ShippingMethod[]> {
    try {
      const result = await query(`
        SELECT * FROM shipping_methods 
        WHERE is_active = true 
        ORDER BY sort_order ASC
      `);
      return result.rows;
    } catch (error) {
      console.error('Error getting shipping methods:', error);
      throw error;
    }
  }

  async getShippingMethodName(shippingMethodId: number): Promise<string> {
    try {
      const result = await query(`
        SELECT name FROM shipping_methods WHERE id = $1
      `, [shippingMethodId]);
      return result.rows[0]?.name || 'Not specified';
    } catch (error) {
      console.error('Error getting shipping method name:', error);
              return 'Not specified';
    }
  }

  async calculateShippingCost(cartItems: CartItem[], shippingMethodId?: number, userId?: number): Promise<number> {
    try {
      // If userId is provided, use it; otherwise try to get it from cart items
      const targetUserId = userId || cartItems[0]?.user_id;
      
      if (!targetUserId) {
        console.warn('No user ID available for shipping calculation, assuming e-book only');
        return 0;
      }
      
      const analytics = await this.getCartAnalytics(targetUserId);
      
      if (analytics.isEbookOnly) {
        return 0; // No shipping for eBooks
      }

      if (!shippingMethodId) {
        const methods = await this.getShippingMethods();
        shippingMethodId = methods[0]?.id;
      }

      if (!shippingMethodId) {
        return 0;
      }

      const method = await query(`
        SELECT * FROM shipping_methods WHERE id = $1
      `, [shippingMethodId]);

      if (!method.rows[0]) {
        return 0;
      }

      const shippingMethod = method.rows[0];
      const subtotal = analytics.totalValue;

      // Check if free shipping threshold is met
      if (shippingMethod.free_shipping_threshold && subtotal >= shippingMethod.free_shipping_threshold) {
        return 0;
      }

      // Calculate shipping cost
      const baseCost = Number(shippingMethod.base_cost) || 0;
      const perItemCost = Number(shippingMethod.cost_per_item) || 0;
      const totalItems = analytics.physicalCount;

      const shippingCost = baseCost + (perItemCost * totalItems);
      
      // Debug logging for shipping
      console.log('Shipping Cost Debug:', {
        baseCost,
        perItemCost,
        totalItems,
        shippingCost,
        baseCost_type: typeof baseCost,
        perItemCost_type: typeof perItemCost,
        totalItems_type: typeof totalItems,
        shippingCost_type: typeof shippingCost
      });

      return shippingCost;
    } catch (error) {
      console.error('Error calculating shipping cost:', error);
      return 0;
    }
  }

  async calculateTax(subtotal: number, country: string = 'NG'): Promise<number> {
    try {
      const result = await query(`
        SELECT rate FROM tax_rates 
        WHERE country = $1 AND is_active = true
        ORDER BY id ASC LIMIT 1
      `, [country]);

      if (result.rows.length === 0) {
        return 0;
      }

      const taxRate = Number(result.rows[0].rate);
      return subtotal * taxRate;
    } catch (error) {
      console.error('Error calculating tax:', error);
      return 0;
    }
  }

  async validateDiscountCode(code: string, subtotal: number): Promise<Discount | null> {
    try {
      const result = await query(`
        SELECT * FROM discounts 
        WHERE code = $1 AND is_active = true
        AND (valid_from IS NULL OR valid_from <= CURRENT_TIMESTAMP)
        AND (valid_until IS NULL OR valid_until >= CURRENT_TIMESTAMP)
        AND (usage_limit IS NULL OR used_count < usage_limit)
        AND minimum_order_amount <= $2
      `, [code, subtotal]);

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error validating discount code:', error);
      return null;
    }
  }

  // Order Management
  async createOrder(
    userId: number,
    cartItems: CartItem[],
    shippingAddress: ShippingAddress,
    billingAddress: BillingAddress,
    shippingMethodId?: number,
    discountCode?: string
  ): Promise<Order> {
    try {
      // Calculate totals first
      const analytics = await this.getCartAnalytics(userId);
      const shippingCost = await this.calculateShippingCost(cartItems, shippingMethodId, userId);
      const taxAmount = await this.calculateTax(analytics.totalValue, shippingAddress.country);
      
      let discountAmount = 0;
      if (discountCode) {
        const discount = await this.validateDiscountCode(discountCode, analytics.totalValue);
        if (discount) {
          if (discount.discount_type === 'percentage') {
            discountAmount = analytics.totalValue * (Number(discount.discount_value) / 100);
            if (discount.maximum_discount_amount) {
              discountAmount = Math.min(discountAmount, Number(discount.maximum_discount_amount));
            }
          } else {
            discountAmount = Number(discount.discount_value);
          }
        }
      }

      const totalAmount = analytics.totalValue + shippingCost + taxAmount - discountAmount;

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Validate all numeric values before inserting
      const validatedUserId = isNaN(userId) ? 0 : userId;
      const validatedSubtotal = isNaN(analytics.totalValue) ? 0 : analytics.totalValue;
      const validatedTaxAmount = isNaN(taxAmount) ? 0 : taxAmount;
      const validatedShippingCost = isNaN(shippingCost) ? 0 : shippingCost;
      const validatedDiscountAmount = isNaN(discountAmount) ? 0 : discountAmount;
      const validatedTotalAmount = isNaN(totalAmount) ? 0 : totalAmount;
      const validatedShippingMethodId = shippingMethodId && !isNaN(shippingMethodId) ? shippingMethodId : null;

      // Create order using direct query
      const orderResult = await query(`
        INSERT INTO orders (
          order_number, user_id, status, subtotal, tax_amount, shipping_amount,
          discount_amount, total_amount, currency, shipping_address, billing_address,
          shipping_method_id, shipping_method
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `, [
        orderNumber, validatedUserId, 'pending', validatedSubtotal, validatedTaxAmount, validatedShippingCost,
        validatedDiscountAmount, validatedTotalAmount, 'NGN', JSON.stringify(shippingAddress),
        JSON.stringify(billingAddress), validatedShippingMethodId, 
        analytics.isEbookOnly ? 'Digital Download' : (validatedShippingMethodId ? await this.getShippingMethodName(validatedShippingMethodId) : 'Not specified')
      ]);

      const order = orderResult.rows[0];

      // Create order items
      for (const item of cartItems) {
        // Validate numeric values for order items
        const validatedBookId = isNaN(item.book_id) ? 0 : item.book_id;
        const validatedPrice = isNaN(item.book?.price) ? 0 : (item.book?.price || 0);
        const validatedQuantity = isNaN(item.quantity) ? 1 : item.quantity;
        const validatedTotalPrice = validatedPrice * validatedQuantity;

        await query(`
          INSERT INTO order_items (
            order_id, book_id, title, author_name, price, quantity, total_price, format
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          order.id, validatedBookId, item.book?.title || '', item.book?.author_name || '',
          validatedPrice, validatedQuantity, validatedTotalPrice,
          item.book?.format || 'ebook'
        ]);

        // Update stock for physical books with inventory tracking
        if ((item.book?.format === 'physical' || item.book?.format === 'both') && item.book?.stock_quantity > 0) {
          await query(`
            UPDATE books SET stock_quantity = stock_quantity - $1
            WHERE id = $2
          `, [item.quantity, item.book_id]);
        }
      }

      // Update discount usage if applicable
      if (discountCode && discountAmount > 0) {
        await query(`
          UPDATE discounts SET used_count = used_count + 1
          WHERE code = $1
        `, [discountCode]);
      }

      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async getOrderById(orderId: number): Promise<Order | null> {
    try {
      const orderResult = await query(`
        SELECT * FROM orders WHERE id = $1
      `, [orderId]);

      if (!orderResult.rows[0]) {
        return null;
      }

      const order = orderResult.rows[0];
      const itemsResult = await query(`
        SELECT oi.*, b.cover_image_url, b.format
        FROM order_items oi
        LEFT JOIN books b ON oi.book_id = b.id
        WHERE oi.order_id = $1
      `, [orderId]);

      return {
        ...order,
        items: itemsResult.rows
      };
    } catch (error) {
      console.error('Error getting order by ID:', error);
      throw error;
    }
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    try {
      const result = await query(`
        SELECT oi.*, b.cover_image_url, b.format
        FROM order_items oi
        LEFT JOIN books b ON oi.book_id = b.id
        WHERE oi.order_id = $1
        ORDER BY oi.created_at
      `, [orderId]);
      return result.rows;
    } catch (error) {
      console.error('Error getting order items:', error);
      throw error;
    }
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    try {
      const result = await query(`
        SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC
      `, [userId]);

      return result.rows;
    } catch (error) {
      console.error('Error getting user orders:', error);
      throw error;
    }
  }

  // User Library Management
  async addToUserLibrary(userId: number, bookId: number, orderId?: number): Promise<UserLibraryItem> {
    try {
      const result = await query(`
        INSERT INTO user_library (user_id, book_id, order_id)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, book_id) DO NOTHING
        RETURNING *
      `, [userId, bookId, orderId]);

      return result.rows[0];
    } catch (error) {
      console.error('Error adding to user library:', error);
      throw error;
    }
  }

  async getUserLibrary(userId: number): Promise<UserLibraryItem[]> {
    try {
      const result = await query(`
        SELECT ul.*, b.*, a.name as author_name, c.name as category_name
        FROM user_library ul
        JOIN books b ON ul.book_id = b.id
        LEFT JOIN authors a ON b.author_id = a.id
        LEFT JOIN categories c ON b.category_id = c.id
        WHERE ul.user_id = $1
        ORDER BY ul.purchase_date DESC
      `, [userId]);

      return result.rows.map(row => ({
        id: row.id,
        user_id: row.user_id,
        book_id: row.book_id,
        order_id: row.order_id,
        purchase_date: row.purchase_date,
        download_count: row.download_count,
        last_downloaded_at: row.last_downloaded_at,
        is_favorite: row.is_favorite,
        book: {
          id: row.book_id,
          title: row.title,
          author_name: row.author_name,
          category_name: row.category_name,
          cover_image_url: row.cover_image_url,
          format: row.format,
          ebook_file_url: row.ebook_file_url
        }
      }));
    } catch (error) {
      console.error('Error getting user library:', error);
      throw error;
    }
  }

  async updateDownloadCount(userId: number, bookId: number): Promise<void> {
    try {
      await query(`
        UPDATE user_library 
        SET download_count = download_count + 1, last_downloaded_at = CURRENT_TIMESTAMP
        WHERE user_id = $1 AND book_id = $2
      `, [userId, bookId]);
    } catch (error) {
      console.error('Error updating download count:', error);
      throw error;
    }
  }

  // Payment Management
  async createPaymentTransaction(
    orderNumber: string,
    gatewayId: string,
    userId: number,
    amount: number,
    transactionId: string
  ): Promise<PaymentTransaction> {
    try {
      // The payment_transactions table has order_id as VARCHAR, not INTEGER
      // So we can use the order_number directly
      const result = await query(`
        INSERT INTO payment_transactions (
          transaction_id, order_id, user_id, gateway_type, amount, currency, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [transactionId, orderNumber, userId, gatewayId, amount, 'NGN', 'pending']);

      return result.rows[0];
    } catch (error) {
      console.error('Error creating payment transaction:', error);
      throw error;
    }
  }

  async updatePaymentStatus(
    transactionId: string,
    status: 'pending' | 'success' | 'failed' | 'cancelled',
    gatewayResponse?: Record<string, any>
  ): Promise<void> {
    try {
      await query(`
        UPDATE payment_transactions 
        SET status = $1, gateway_response = $2, updated_at = CURRENT_TIMESTAMP
        WHERE transaction_id = $3
      `, [status, gatewayResponse ? JSON.stringify(gatewayResponse) : null, transactionId]);
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  async updateOrderPaymentStatus(
    orderId: number,
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded',
    transactionId?: string
  ): Promise<void> {
    try {
      await query(`
        UPDATE orders 
        SET payment_status = $1, payment_transaction_id = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
      `, [paymentStatus, transactionId, orderId]);
    } catch (error) {
      console.error('Error updating order payment status:', error);
      throw error;
    }
  }

  async updateOrderPaymentMethod(
    orderId: number,
    paymentMethod: string,
    transactionId?: string
  ): Promise<void> {
    try {
      await query(`
        UPDATE orders 
        SET payment_method = $1, payment_transaction_id = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
      `, [paymentMethod, transactionId, orderId]);
    } catch (error) {
      console.error('Error updating order payment method:', error);
      throw error;
    }
  }

  // Bank Transfer Proof Management
  async createBankTransferProof(
    transactionId: string,
    userId: number,
    bankName: string,
    accountNumber: string,
    accountName: string,
    amount: number,
    referenceNumber?: string,
    proofImageUrl?: string
  ): Promise<BankTransferProof> {
    try {
      const result = await query(`
        INSERT INTO bank_transfer_proofs (
          transaction_id, user_id, bank_name, account_number, account_name,
          amount, reference_number, proof_image_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [transactionId, userId, bankName, accountNumber, accountName, amount, referenceNumber, proofImageUrl]);

      return result.rows[0];
    } catch (error) {
      console.error('Error creating bank transfer proof:', error);
      throw error;
    }
  }

  // Checkout Summary
  async getCheckoutSummary(
    userId: number,
    shippingMethodId?: number,
    discountCode?: string
  ): Promise<CheckoutSummary> {
    try {
      const cartItems = await this.getCartItems(userId);
      const analytics = await this.getCartAnalytics(userId);
      const shippingCost = await this.calculateShippingCost(cartItems, shippingMethodId, userId);
      const taxAmount = await this.calculateTax(analytics.totalValue);

      let discountAmount = 0;
      if (discountCode) {
        const discount = await this.validateDiscountCode(discountCode, analytics.totalValue);
        if (discount) {
          if (discount.discount_type === 'percentage') {
            discountAmount = analytics.totalValue * (discount.discount_value / 100);
            if (discount.maximum_discount_amount) {
              discountAmount = Math.min(discountAmount, discount.maximum_discount_amount);
            }
          } else {
            discountAmount = discount.discount_value;
          }
        }
      }

      const totalAmount = Number(analytics.totalValue) + Number(shippingCost) + Number(taxAmount) - Number(discountAmount);
      
      // Debug logging
      console.log('Checkout Summary Debug:', {
        analytics_totalValue: analytics.totalValue,
        shippingCost,
        taxAmount,
        discountAmount,
        totalAmount,
        analytics_totalValue_type: typeof analytics.totalValue,
        shippingCost_type: typeof shippingCost,
        taxAmount_type: typeof taxAmount,
        totalAmount_type: typeof totalAmount
      });

      // Get estimated delivery for shipping method
      let estimatedDelivery;
      if (shippingMethodId && !analytics.isEbookOnly) {
        const method = await query(`
          SELECT estimated_days_min, estimated_days_max FROM shipping_methods WHERE id = $1
        `, [shippingMethodId]);
        
        if (method.rows[0]) {
          const minDays = method.rows[0].estimated_days_min;
          const maxDays = method.rows[0].estimated_days_max;
          const today = new Date();
          const minDate = new Date(today.getTime() + (minDays * 24 * 60 * 60 * 1000));
          const maxDate = new Date(today.getTime() + (maxDays * 24 * 60 * 60 * 1000));
          estimatedDelivery = `${minDate.toLocaleDateString()} - ${maxDate.toLocaleDateString()}`;
        }
      }

      return {
        subtotal: Number(analytics.totalValue),
        tax_amount: Number(taxAmount),
        shipping_amount: Number(shippingCost),
        discount_amount: Number(discountAmount),
        total_amount: Number(totalAmount),
        currency: 'NGN',
        estimated_delivery: estimatedDelivery,
        isEbookOnly: analytics.isEbookOnly,
        isPhysicalOnly: analytics.isPhysicalOnly,
        isMixedCart: analytics.isMixedCart
      };
    } catch (error) {
      console.error('Error getting checkout summary:', error);
      throw error;
    }
  }

  async updateBook(id: number, bookData: Partial<Book>): Promise<Book | null> {
    try {
      const result = await query(`
        UPDATE books SET
          title = COALESCE($2, title),
          subtitle = COALESCE($3, subtitle),
          author_id = COALESCE($4, author_id),
          category_id = COALESCE($5, category_id),
          isbn = COALESCE($6, isbn),
          description = COALESCE($7, description),
          short_description = COALESCE($8, short_description),
          cover_image_url = COALESCE($9, cover_image_url),
          sample_pdf_url = COALESCE($10, sample_pdf_url),
          ebook_file_url = COALESCE($11, ebook_file_url),
          format = COALESCE($12, format),
          language = COALESCE($13, language),
          pages = COALESCE($14, pages),
          publication_date = COALESCE($15, publication_date),
          publisher = COALESCE($16, publisher),
          price = COALESCE($17, price),
          original_price = COALESCE($18, original_price),
          cost_price = COALESCE($19, cost_price),
          weight_grams = COALESCE($20, weight_grams),
          dimensions = COALESCE($21, dimensions),
          stock_quantity = COALESCE($22, stock_quantity),
          low_stock_threshold = COALESCE($23, low_stock_threshold),
          is_featured = COALESCE($24, is_featured),
          is_bestseller = COALESCE($25, is_bestseller),
          is_new_release = COALESCE($26, is_new_release),
          status = COALESCE($27, status),
          seo_title = COALESCE($28, seo_title),
          seo_description = COALESCE($29, seo_description),
          seo_keywords = COALESCE($30, seo_keywords),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `, [
        id, bookData.title, bookData.subtitle, bookData.author_id, bookData.category_id,
        bookData.isbn, bookData.description, bookData.short_description, bookData.cover_image_url,
        bookData.sample_pdf_url, bookData.ebook_file_url, bookData.format, bookData.language,
        bookData.pages, bookData.publication_date, bookData.publisher, bookData.price,
        bookData.original_price, bookData.cost_price, bookData.weight_grams, bookData.dimensions,
        bookData.stock_quantity, bookData.low_stock_threshold, bookData.is_featured,
        bookData.is_bestseller, bookData.is_new_release, bookData.status, bookData.seo_title,
        bookData.seo_description, bookData.seo_keywords
      ]);

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error updating book:', error);
      throw error;
    }
  }

  async deleteBook(id: number): Promise<boolean> {
    try {
      // Use a transaction to ensure data consistency
      return await transaction(async (client) => {
        // First, check if the book exists
        const bookCheck = await client.query('SELECT id FROM books WHERE id = $1', [id]);
        if (bookCheck.rowCount === 0) {
          return false;
        }

        // Delete related records in the correct order to avoid foreign key constraint violations
        // Note: order_items doesn't have CASCADE DELETE, so we need to handle it manually
        
        // 1. Delete from order_items (this is the main constraint issue)
        await client.query('DELETE FROM order_items WHERE book_id = $1', [id]);
        
        // 2. Delete from other related tables (these have CASCADE DELETE but we'll be explicit)
        await client.query('DELETE FROM book_reviews WHERE book_id = $1', [id]);
        await client.query('DELETE FROM cart_items WHERE book_id = $1', [id]);
        await client.query('DELETE FROM book_tag_relations WHERE book_id = $1', [id]);
        await client.query('DELETE FROM reading_progress WHERE book_id = $1', [id]);
        await client.query('DELETE FROM user_library WHERE book_id = $1', [id]);
        
        // 3. Finally delete the book
        const result = await client.query('DELETE FROM books WHERE id = $1', [id]);
        return result.rowCount > 0;
      });
    } catch (error) {
      console.error('Error deleting book:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const ecommerceService = new EcommerceService(); 