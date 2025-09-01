import { query } from './database';
import { ecommerceService } from './ecommerce-service-new';
import { sanitizeLogInput } from './security-safe';

export class LibrarySyncService {
  /**
   * Sync books to user library after successful order payment
   */
  static async syncOrderToLibrary(orderId: number, userId: number): Promise<void> {
    try {
      // Get all books from the order
      const orderItems = await query(`
        SELECT DISTINCT oi.book_id, b.title, b.format, b.book_type
        FROM order_items oi
        JOIN books b ON oi.book_id = b.id
        WHERE oi.order_id = $1
      `, [orderId]);

      // Add books to user library in batch for better performance
      const bookPromises = orderItems.rows.map(async (item) => {
        await ecommerceService.addToUserLibrary(userId, item.book_id, orderId);
        console.log(`✅ Synced book "${sanitizeLogInput(item.title)}" to user ${userId} library`);
        return item;
      });
      
      await Promise.all(bookPromises);

      console.log(`✅ Library sync completed for order ${sanitizeLogInput(orderId.toString())}`);
    } catch (error) {
      console.error('❌ Library sync failed:', error);
      throw error;
    }
  }

  /**
   * Admin assignment of book to user library
   */
  static async assignBookToUser(userId: number, bookId: number, adminId: number, reason?: string): Promise<void> {
    try {
      // Verify book exists
      const bookResult = await query(`
        SELECT id, title FROM books WHERE id = $1
      `, [bookId]);

      if (bookResult.rows.length === 0) {
        throw new Error('Book not found');
      }

      // Use transaction for atomicity
      await query('BEGIN');
      try {
        // Add to library with admin assignment type
        await query(`
          INSERT INTO user_library (user_id, book_id, access_type, added_at)
          VALUES ($1, $2, 'admin_assigned', CURRENT_TIMESTAMP)
          ON CONFLICT (user_id, book_id) DO UPDATE SET
            access_type = 'admin_assigned',
            added_at = CURRENT_TIMESTAMP
        `, [userId, bookId]);

        // Log the assignment
        await query(`
          INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, admin_user_id)
          VALUES ($1, 'library_add', 'user_library', $2, $3, $4)
        `, [userId, bookId, JSON.stringify({
          bookTitle: sanitizeLogInput(bookResult.rows[0].title),
          reason: sanitizeLogInput(reason || 'Admin assignment'),
          assignedBy: adminId
        }), adminId]);
        
        await query('COMMIT');
      } catch (error) {
        await query('ROLLBACK');
        throw error;
      }

      console.log(`✅ Admin assigned book "${sanitizeLogInput(bookResult.rows[0].title)}" to user ${userId}`);
    } catch (error) {
      console.error('❌ Admin book assignment failed:', error);
      throw error;
    }
  }

  /**
   * Remove book from user library
   */
  static async removeBookFromUser(userId: number, bookId: number, adminId?: number): Promise<void> {
    try {
      // Get book info for logging
      const bookResult = await query(`
        SELECT b.title FROM books b
        JOIN user_library ul ON b.id = ul.book_id
        WHERE ul.user_id = $1 AND ul.book_id = $2
      `, [userId, bookId]);

      if (bookResult.rows.length === 0) {
        throw new Error('Book not found in user library');
      }

      // Remove from library
      const result = await query(`
        DELETE FROM user_library 
        WHERE user_id = $1 AND book_id = $2
      `, [userId, bookId]);

      if (result.rowCount === 0) {
        throw new Error('Book not found in user library');
      }

      // Log the removal if done by admin
      if (adminId) {
        await query(`
          INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, admin_user_id)
          VALUES ($1, 'library_remove', 'user_library', $2, $3, $4)
        `, [userId, bookId, JSON.stringify({
          bookTitle: bookResult.rows[0].title,
          removedBy: adminId
        }), adminId]);
      }

      console.log(`✅ Removed book "${sanitizeLogInput(bookResult.rows[0].title)}" from user ${userId} library`);
    } catch (error) {
      console.error('❌ Book removal failed:', error);
      throw error;
    }
  }

  /**
   * Verify library integrity for a user
   */
  static async verifyUserLibrary(userId: number): Promise<{
    totalBooks: number;
    purchasedBooks: number;
    assignedBooks: number;
    issues: string[];
  }> {
    try {
      // Combined query for better performance
      const result = await query(`
        WITH library_stats AS (
          SELECT 
            COUNT(*) as total_books,
            COUNT(CASE WHEN access_type = 'purchased' THEN 1 END) as purchased_books,
            COUNT(CASE WHEN access_type = 'admin_assigned' THEN 1 END) as assigned_books
          FROM user_library ul
          JOIN books b ON ul.book_id = b.id
          WHERE ul.user_id = $1 AND COALESCE(ul.status, 'active') = 'active'
        ),
        orphaned_stats AS (
          SELECT COUNT(*) as orphaned_count
          FROM user_library ul
          LEFT JOIN books b ON ul.book_id = b.id
          WHERE ul.user_id = $1 AND b.id IS NULL
        )
        SELECT 
          ls.total_books,
          ls.purchased_books,
          ls.assigned_books,
          os.orphaned_count
        FROM library_stats ls, orphaned_stats os
      `, [userId]);

      const stats = result.rows[0];
      const issues: string[] = [];

      if (+stats.orphaned_count > 0) {
        issues.push(`${stats.orphaned_count} orphaned library entries found`);
      }

      return {
        totalBooks: +stats.total_books,
        purchasedBooks: +stats.purchased_books,
        assignedBooks: +stats.assigned_books,
        issues
      };
    } catch (error) {
      console.error('❌ Library verification failed:', error);
      throw error;
    }
  }
}

export const librarySyncService = new LibrarySyncService();