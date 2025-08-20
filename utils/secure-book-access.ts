import { query } from './database';
import StorageService from '@/lib/services/StorageService';

export interface BookAccessResult {
  hasAccess: boolean;
  accessType: 'purchased' | 'library' | 'free' | 'public' | 'denied';
  bookInfo?: {
    id: string;
    title: string;
    format: string;
    storage_path: string;
  };
}

export class SecureBookAccess {
  /**
   * Verify user has access to a specific book
   */
  static async verifyBookAccess(userId: string, bookId: string): Promise<BookAccessResult> {
    try {
      // Get book information
      const bookResult = await query(`
        SELECT id, title, format, price, visibility, storage_path, ebook_file_url
        FROM books 
        WHERE id = $1 AND status = 'published'
      `, [bookId]);

      if (bookResult.rows.length === 0) {
        return { hasAccess: false, accessType: 'denied' };
      }

      const book = bookResult.rows[0];

      // Check if book is free or public
      if (book.price === 0 || book.visibility === 'public') {
        return {
          hasAccess: true,
          accessType: book.price === 0 ? 'free' : 'public',
          bookInfo: {
            id: book.id,
            title: book.title,
            format: book.format,
            storage_path: book.storage_path || `/storage/books/${bookId}`,
          }
        };
      }

      // Check user library access
      const libraryResult = await query(`
        SELECT 1 FROM user_library 
        WHERE user_id = $1 AND book_id = $2
      `, [userId, bookId]);

      if (libraryResult.rows.length > 0) {
        return {
          hasAccess: true,
          accessType: 'library',
          bookInfo: {
            id: book.id,
            title: book.title,
            format: book.format,
            storage_path: book.storage_path || `/storage/books/${bookId}`,
          }
        };
      }

      // Check purchase history
      const purchaseResult = await query(`
        SELECT 1 FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.user_id = $1 AND oi.book_id = $2 AND o.payment_status = 'paid'
      `, [userId, bookId]);

      if (purchaseResult.rows.length > 0) {
        return {
          hasAccess: true,
          accessType: 'purchased',
          bookInfo: {
            id: book.id,
            title: book.title,
            format: book.format,
            storage_path: book.storage_path || `/storage/books/${bookId}`,
          }
        };
      }

      return { hasAccess: false, accessType: 'denied' };

    } catch (error) {
      console.error('Error verifying book access:', error);
      return { hasAccess: false, accessType: 'denied' };
    }
  }

  /**
   * Generate secure URLs for book resources
   */
  static async generateSecureBookUrls(
    userId: string, 
    bookId: string, 
    resources: string[]
  ): Promise<{ [key: string]: string }> {
    const accessResult = await this.verifyBookAccess(userId, bookId);
    
    if (!accessResult.hasAccess || !accessResult.bookInfo) {
      throw new Error('Access denied to book resources');
    }

    const secureUrls: { [key: string]: string } = {};
    const basePath = accessResult.bookInfo.storage_path;

    for (const resource of resources) {
      // Validate resource path
      if (resource.includes('..') || resource.startsWith('/')) {
        continue; // Skip invalid paths
      }

      const fullPath = `${basePath}/${resource}`;
      
      if (StorageService.validateFilePath(fullPath)) {
        secureUrls[resource] = StorageService.createSecureUrl(fullPath, 3600);
      }
    }

    // Log resource access
    await this.logResourceAccess(userId, bookId, resources);

    return secureUrls;
  }

  /**
   * Validate file access request
   */
  static async validateFileAccess(
    userId: string,
    filePath: string,
    token: string,
    expires: string
  ): Promise<boolean> {
    try {
      // Verify token
      if (!StorageService.verifySecureUrl(filePath, expires, token)) {
        return false;
      }

      // Extract book ID from file path
      const bookIdMatch = filePath.match(/\/books\/(\d+)\//);
      if (!bookIdMatch) {
        return false;
      }

      const bookId = bookIdMatch[1];
      const accessResult = await this.verifyBookAccess(userId, bookId);

      return accessResult.hasAccess;

    } catch (error) {
      console.error('Error validating file access:', error);
      return false;
    }
  }

  /**
   * Log resource access for analytics and security
   */
  private static async logResourceAccess(
    userId: string,
    bookId: string,
    resources: string[]
  ): Promise<void> {
    try {
      for (const resource of resources) {
        await query(`
          INSERT INTO book_resource_access_logs (user_id, book_id, resource_path, accessed_at)
          VALUES ($1, $2, $3, NOW())
          ON CONFLICT (user_id, book_id, resource_path) 
          DO UPDATE SET 
            accessed_at = NOW(), 
            access_count = book_resource_access_logs.access_count + 1
        `, [userId, bookId, resource]);
      }
    } catch (error) {
      console.error('Error logging resource access:', error);
    }
  }

  /**
   * Get user's reading session info for security validation
   */
  static async validateReadingSession(
    userId: string,
    bookId: string,
    sessionToken?: string
  ): Promise<boolean> {
    try {
      // Check if user has an active reading session
      const sessionResult = await query(`
        SELECT id, expires_at FROM reading_sessions 
        WHERE user_id = $1 AND book_id = $2 AND expires_at > NOW()
        ORDER BY created_at DESC LIMIT 1
      `, [userId, bookId]);

      if (sessionResult.rows.length === 0) {
        // Create new reading session
        await query(`
          INSERT INTO reading_sessions (user_id, book_id, session_token, expires_at)
          VALUES ($1, $2, $3, NOW() + INTERVAL '24 hours')
        `, [userId, bookId, sessionToken || this.generateSessionToken()]);
        
        return true;
      }

      // Extend existing session
      await query(`
        UPDATE reading_sessions 
        SET expires_at = NOW() + INTERVAL '24 hours', last_activity = NOW()
        WHERE user_id = $1 AND book_id = $2
      `, [userId, bookId]);

      return true;

    } catch (error) {
      console.error('Error validating reading session:', error);
      return false;
    }
  }

  /**
   * Generate secure session token
   */
  private static generateSessionToken(): string {
    return require('crypto').randomBytes(32).toString('hex');
  }

  /**
   * Clean up expired reading sessions
   */
  static async cleanupExpiredSessions(): Promise<number> {
    try {
      const result = await query(`
        DELETE FROM reading_sessions 
        WHERE expires_at < NOW()
      `);
      
      return result.rowCount || 0;
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
      return 0;
    }
  }
}