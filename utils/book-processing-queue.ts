import { EnhancedBookProcessor } from '@/lib/services/EnhancedBookProcessor';
import { query } from '@/utils/database';
import logger from '@/lib/logger';
import path from 'path';

interface QueuedBook {
  id: number;
  title: string;
  ebook_file_url: string;
  file_format: string;
  processing_status: string;
}

export class BookProcessingQueue {
  private static isProcessing = false;
  private static processingInterval: NodeJS.Timeout | null = null;

  /**
   * Start the background processing queue
   */
  static startQueue() {
    if (this.processingInterval) {
      return; // Already running
    }

    logger.info('Starting book processing queue...');
    
    this.processingInterval = setInterval(async () => {
      if (!this.isProcessing) {
        await this.processNextBook();
      }
    }, 5000); // Check every 5 seconds
  }

  /**
   * Stop the background processing queue
   */
  static stopQueue() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
      logger.info('Book processing queue stopped');
    }
  }

  /**
   * Process the next book in the queue
   */
  private static async processNextBook() {
    if (this.isProcessing) {
      return;
    }

    try {
      this.isProcessing = true;

      // Get next book to process
      const result = await query(`
        SELECT id, title, ebook_file_url, file_format, processing_status
        FROM books 
        WHERE processing_status = 'pending' 
        AND ebook_file_url IS NOT NULL
        ORDER BY created_at ASC
        LIMIT 1
      `);

      if (result.rows.length === 0) {
        return; // No books to process
      }

      const book: QueuedBook = result.rows[0];
      logger.info(`Processing book ${book.id}: ${book.title}`);

      // Update status to processing
      await query(`
        UPDATE books SET 
          processing_status = 'processing',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [book.id]);

      // Determine file path
      let filePath: string;
      
      if (book.ebook_file_url.startsWith('/api/')) {
        // New format: stored in /storage/books/{id}/
        const fileName = book.ebook_file_url.split('/').pop();
        filePath = path.join(process.cwd(), 'storage', 'books', book.id.toString(), fileName);
      } else {
        // Legacy format: stored in /storage/ebooks/
        const fileName = book.ebook_file_url.split('/').pop();
        filePath = path.join(process.cwd(), 'storage', 'ebooks', fileName);
      }

      // Get original filename
      const originalFileName = book.ebook_file_url.split('/').pop() || 'unknown.epub';

      // Process the book
      const processingResult = await EnhancedBookProcessor.processUploadedBook(
        book.id,
        filePath,
        originalFileName
      );

      if (processingResult.success) {
        logger.info(`Successfully processed book ${book.id}: ${book.title}`);
      } else {
        logger.error(`Failed to process book ${book.id}:`, processingResult.error);
        
        // Update status to failed
        await query(`
          UPDATE books SET 
            processing_status = 'failed',
            parsing_error = $1,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [processingResult.error, book.id]);
      }

    } catch (error) {
      logger.error('Error in book processing queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Add a book to the processing queue
   */
  static async queueBook(bookId: number) {
    try {
      await query(`
        UPDATE books SET 
          processing_status = 'pending',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND processing_status NOT IN ('processing', 'completed')
      `, [bookId]);

      logger.info(`Queued book ${bookId} for processing`);
    } catch (error) {
      logger.error(`Error queuing book ${bookId}:`, error);
    }
  }

  /**
   * Get processing queue status
   */
  static async getQueueStatus() {
    try {
      const result = await query(`
        SELECT 
          processing_status,
          COUNT(*) as count
        FROM books 
        WHERE ebook_file_url IS NOT NULL
        GROUP BY processing_status
      `);

      const status = {
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0
      };

      result.rows.forEach(row => {
        status[row.processing_status as keyof typeof status] = parseInt(row.count);
      });

      return status;
    } catch (error) {
      logger.error('Error getting queue status:', error);
      return { pending: 0, processing: 0, completed: 0, failed: 0 };
    }
  }

  /**
   * Retry failed books
   */
  static async retryFailedBooks() {
    try {
      const result = await query(`
        UPDATE books SET 
          processing_status = 'pending',
          parsing_error = NULL,
          updated_at = CURRENT_TIMESTAMP
        WHERE processing_status = 'failed' AND ebook_file_url IS NOT NULL
      `);

      logger.info(`Queued ${result.rowCount} failed books for retry`);
      return result.rowCount || 0;
    } catch (error) {
      logger.error('Error retrying failed books:', error);
      return 0;
    }
  }
}

// Auto-start the queue in production
if (process.env.NODE_ENV === 'production') {
  BookProcessingQueue.startQueue();
}