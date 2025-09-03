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
      // Verify book exists and get its details
      const bookResult = await query(`
        SELECT id, title, format, ebook_file_url FROM books WHERE id = $1
      `, [bookId]);

      if (bookResult.rows.length === 0) {
        throw new Error('Book not found');
      }

      const book = bookResult.rows[0];

      // Use transaction for atomicity
      await query('BEGIN');
      try {
        // Check if book already exists in user library
        const existingEntry = await query(`
          SELECT id FROM user_library WHERE user_id = $1 AND book_id = $2
        `, [userId, bookId]);

        if (existingEntry.rows.length > 0) {
          // Update existing entry
          await query(`
            UPDATE user_library SET
              access_type = 'admin_assigned',
              added_at = CURRENT_TIMESTAMP,
              status = 'active'
            WHERE user_id = $1 AND book_id = $2
          `, [userId, bookId]);
        } else {
          // Insert new entry
          await query(`
            INSERT INTO user_library (user_id, book_id, access_type, added_at, status)
            VALUES ($1, $2, 'admin_assigned', CURRENT_TIMESTAMP, 'active')
          `, [userId, bookId]);
        }

        // Also create book assignment record for tracking
        await query(`
          INSERT INTO book_assignments (user_id, book_id, assigned_by, assigned_at, status, reason)
          VALUES ($1, $2, $3, CURRENT_TIMESTAMP, 'active', $4)
          ON CONFLICT (user_id, book_id) DO UPDATE SET
            assigned_by = $3,
            assigned_at = CURRENT_TIMESTAMP,
            status = 'active',
            reason = $4
        `, [userId, bookId, adminId, reason || 'Admin assignment']);

        // Log the assignment
        await query(`
          INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, admin_user_id)
          VALUES ($1, 'library_add', 'user_library', $2, $3, $4)
        `, [userId, bookId, JSON.stringify({
          bookTitle: sanitizeLogInput(book.title),
          bookFormat: book.format,
          reason: sanitizeLogInput(reason || 'Admin assignment'),
          assignedBy: adminId,
          hasEbookFile: !!book.ebook_file_url
        }), adminId]);
        
        await query('COMMIT');
      } catch (error) {
        await query('ROLLBACK');
        throw error;
      }

      console.log(`✅ Admin assigned book "${sanitizeLogInput(book.title)}" (${book.format}) to user ${userId}`);
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
        SELECT b.title, b.format FROM books b
        JOIN user_library ul ON b.id = ul.book_id
        WHERE ul.user_id = $1 AND ul.book_id = $2
      `, [userId, bookId]);

      if (bookResult.rows.length === 0) {
        throw new Error('Book not found in user library');
      }

      // Use transaction for atomicity
      await query('BEGIN');
      try {
        // Remove from library
        const result = await query(`
          DELETE FROM user_library 
          WHERE user_id = $1 AND book_id = $2
        `, [userId, bookId]);

        if (result.rowCount === 0) {
          throw new Error('Book not found in user library');
        }

        // Also remove/deactivate book assignment if it exists
        await query(`
          UPDATE book_assignments SET
            status = 'removed',
            removed_at = CURRENT_TIMESTAMP,
            removed_by = $3
          WHERE user_id = $1 AND book_id = $2 AND status = 'active'
        `, [userId, bookId, adminId]);

        // Log the removal if done by admin
        if (adminId) {
          await query(`
            INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, admin_user_id)
            VALUES ($1, 'library_remove', 'user_library', $2, $3, $4)
          `, [userId, bookId, JSON.stringify({
            bookTitle: sanitizeLogInput(bookResult.rows[0].title),
            bookFormat: bookResult.rows[0].format,
            removedBy: adminId
          }), adminId]);
        }

        await query('COMMIT');
      } catch (error) {
        await query('ROLLBACK');
        throw error;
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
    ebookCount: number;
    physicalCount: number;
    hybridCount: number;
    issues: string[];
  }> {
    try {
      // Combined query for better performance
      const result = await query(`
        WITH library_stats AS (
          SELECT 
            COUNT(*) as total_books,
            COUNT(CASE WHEN ul.access_type = 'purchased' THEN 1 END) as purchased_books,
            COUNT(CASE WHEN ul.access_type = 'admin_assigned' THEN 1 END) as assigned_books,
            COUNT(CASE WHEN b.format = 'ebook' THEN 1 END) as ebook_count,
            COUNT(CASE WHEN b.format = 'physical' THEN 1 END) as physical_count,
            COUNT(CASE WHEN b.format = 'hybrid' THEN 1 END) as hybrid_count
          FROM user_library ul
          JOIN books b ON ul.book_id = b.id
          WHERE ul.user_id = $1 AND COALESCE(ul.status, 'active') = 'active'
        ),
        orphaned_stats AS (
          SELECT COUNT(*) as orphaned_count
          FROM user_library ul
          LEFT JOIN books b ON ul.book_id = b.id
          WHERE ul.user_id = $1 AND b.id IS NULL
        ),
        assignment_sync AS (
          SELECT COUNT(*) as unsynced_assignments
          FROM book_assignments ba
          LEFT JOIN user_library ul ON ba.user_id = ul.user_id AND ba.book_id = ul.book_id
          WHERE ba.user_id = $1 AND ba.status = 'active' AND ul.id IS NULL
        )
        SELECT 
          ls.total_books,
          ls.purchased_books,
          ls.assigned_books,
          ls.ebook_count,
          ls.physical_count,
          ls.hybrid_count,
          os.orphaned_count,
          ass.unsynced_assignments
        FROM library_stats ls, orphaned_stats os, assignment_sync ass
      `, [userId]);

      const stats = result.rows[0];
      const issues: string[] = [];

      if (+stats.orphaned_count > 0) {
        issues.push(`${stats.orphaned_count} orphaned library entries found`);
      }

      if (+stats.unsynced_assignments > 0) {
        issues.push(`${stats.unsynced_assignments} book assignments not synced to library`);
      }

      return {
        totalBooks: +stats.total_books,
        purchasedBooks: +stats.purchased_books,
        assignedBooks: +stats.assigned_books,
        ebookCount: +stats.ebook_count,
        physicalCount: +stats.physical_count,
        hybridCount: +stats.hybrid_count,
        issues
      };
    } catch (error) {
      console.error('❌ Library verification failed:', error);
      throw error;
    }
  }

  /**
   * Sync book assignments to user library (for fixing any sync issues)
   */
  static async syncAssignmentsToLibrary(userId?: number): Promise<{ synced: number; errors: string[] }> {
    try {
      const whereClause = userId ? 'WHERE ba.user_id = $1' : '';
      const params = userId ? [userId] : [];
      
      // Get all active assignments that aren't in user_library
      const result = await query(`
        SELECT ba.user_id, ba.book_id, ba.assigned_by, ba.reason, b.title, b.format
        FROM book_assignments ba
        JOIN books b ON ba.book_id = b.id
        LEFT JOIN user_library ul ON ba.user_id = ul.user_id AND ba.book_id = ul.book_id
        ${whereClause}
        AND ba.status = 'active' 
        AND ul.id IS NULL
      `, params);

      const assignments = result.rows;
      let synced = 0;
      const errors: string[] = [];

      for (const assignment of assignments) {
        try {
          await query(`
            INSERT INTO user_library (user_id, book_id, access_type, added_at, status)
            VALUES ($1, $2, 'admin_assigned', CURRENT_TIMESTAMP, 'active')
          `, [assignment.user_id, assignment.book_id]);
          
          synced++;
          console.log(`✅ Synced assignment: ${assignment.title} to user ${assignment.user_id}`);
        } catch (error) {
          const errorMsg = `Failed to sync ${assignment.title} to user ${assignment.user_id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          console.error(`❌ ${errorMsg}`);
        }
      }

      return { synced, errors };
    } catch (error) {
      console.error('❌ Assignment sync failed:', error);
      throw error;
    }
  }
}

export const librarySyncService = new LibrarySyncService();