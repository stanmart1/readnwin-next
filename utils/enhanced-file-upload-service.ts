import { join, extname, basename } from 'path';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { createHash } from 'crypto';
import { query } from './database';
import { EnhancedBookParser } from './enhanced-book-parser';

export interface FileUploadResult {
  success: boolean;
  filePath: string;
  fileName: string;
  fileSize: number;
  fileHash: string;
  mimeType: string;
  error?: string;
}

export interface BookFileInfo {
  originalFilename: string;
  storedFilename: string;
  filePath: string;
  fileSize: number;
  fileHash: string;
  mimeType: string;
  fileFormat: 'epub' | 'html' | 'image';
}

export class EnhancedFileUploadService {
  private mediaRootDir: string;
  private booksDir: string;
  private tempDir: string;
  private coversDir: string;
  private bookParser: EnhancedBookParser;

  constructor() {
    // Use server-side storage (not in public directory for security)
    this.mediaRootDir = process.env.NODE_ENV === 'production' 
      ? '/app/storage' 
      : join(process.cwd(), 'storage');
    
    this.booksDir = join(this.mediaRootDir, 'books');
    this.tempDir = join(this.booksDir, 'temp');
    
    // In production, covers also go to persistent storage
    this.coversDir = process.env.NODE_ENV === 'production'
      ? join('/app/storage/covers')
      : join(process.cwd(), 'storage', 'covers');
    
    this.bookParser = new EnhancedBookParser();
  }

  private initializeStorage() {
    // Only create directories when actually needed, not during build
    if (typeof window === 'undefined' && process.env.NODE_ENV !== 'development' || process.env.NEXT_PHASE !== 'phase-production-build') {
      [
        this.mediaRootDir,
        this.booksDir, 
        this.tempDir, 
        this.coversDir
      ].forEach(dir => {
        if (!existsSync(dir)) {
          console.log(`📁 Creating directory: ${dir}`);
          mkdirSync(dir, { recursive: true });
        }
      });
    }
  }

  /**
   * Upload and process a book file
   */
  async uploadBookFile(
    file: File, 
    bookId: number, 
    fileType: 'cover' | 'ebook' | 'sample'
  ): Promise<FileUploadResult> {
    try {
      // Initialize storage directories
      this.initializeStorage();
      
      console.log(`📁 Starting file upload for book ${bookId}: ${file.name}`);
      
      // Validate file
      const validation = this.validateFile(file, fileType);
      if (!validation.valid) {
        return {
          success: false,
          filePath: '',
          fileName: '',
          fileSize: 0,
          fileHash: '',
          mimeType: file.type,
          error: validation.error
        };
      }

      // Generate secure filename
      const fileExtension = extname(file.name).toLowerCase();
      const secureFilename = this.generateSecureFilename(file.name, bookId);
      
      // Create book-specific directory
      const bookDir = join(this.booksDir, bookId.toString());
      if (!existsSync(bookDir)) {
        mkdirSync(bookDir, { recursive: true });
        console.log(`📁 Created book directory: ${bookDir}`);
      }
      
      // Determine target directory based on file type
      let targetDir: string;
      let relativePath: string;
      
      if (fileType === 'cover') {
        // Cover images go to covers directory (persistent storage in production)
        targetDir = this.coversDir;
        relativePath = `/api/images/covers/${secureFilename}`;
        console.log(`📁 Cover image will be stored at: ${targetDir}/${secureFilename}`);
        console.log(`📁 Cover image URL will be: ${relativePath}`);
      } else {
        // Book files go to secure server-side directory
        targetDir = bookDir;
        relativePath = `/api/ebooks/${bookId}/${secureFilename}`; // Secure path for API access
      }
      
      const filePath = join(targetDir, secureFilename);

      // Read file buffer and calculate hash
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileHash = createHash('sha256').update(buffer).digest('hex');
      const fileSize = buffer.length;

      // Check if file already exists (duplicate detection)
      const existingFile = await this.checkFileExists(fileHash);
      if (existingFile) {
        console.log(`📁 File already exists: ${existingFile.filePath}`);
        return {
          success: true,
          filePath: existingFile.filePath,
          fileName: existingFile.storedFilename,
          fileSize: existingFile.fileSize,
          fileHash: existingFile.fileHash,
          mimeType: existingFile.mimeType
        };
      }

      // Write file to disk
      writeFileSync(filePath, buffer);
      console.log(`📁 File written to: ${filePath}`);

      // Store file information in database
      const fileInfo: BookFileInfo = {
        originalFilename: file.name,
        storedFilename: secureFilename,
        filePath: relativePath, // Store relative path for database
        fileSize: fileSize,
        fileHash: fileHash,
        mimeType: file.type,
        fileFormat: this.detectFileFormat(file.name, file.type)
      };

      await this.storeFileInfo(bookId, fileInfo, fileType);

      // Queue book parsing for e-books
      if (fileType === 'ebook') {
        const fileFormat = this.detectFileFormat(file.name, file.type);
        if (fileFormat === 'epub' || fileFormat === 'html') {
          await this.queueBookParsing(bookId, filePath, fileFormat);
        }
      }

      return {
        success: true,
        filePath: relativePath, // Return relative path for database storage
        fileName: secureFilename,
        fileSize: fileSize,
        fileHash: fileHash,
        mimeType: file.type
      };

    } catch (error) {
      console.error(`❌ Error uploading file:`, error);
      return {
        success: false,
        filePath: '',
        fileName: '',
        fileSize: 0,
        fileHash: '',
        mimeType: file.type,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Validate uploaded file
   */
  private validateFile(file: File, fileType: 'cover' | 'ebook' | 'sample'): { valid: boolean; error?: string } {
    const maxSizes = {
      cover: 10 * 1024 * 1024, // 10MB
      ebook: 50 * 1024 * 1024, // 50MB
      sample: 50 * 1024 * 1024 // 50MB
    };

    if (file.size > maxSizes[fileType]) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${Math.round(maxSizes[fileType] / (1024 * 1024))}MB`
      };
    }

    if (fileType === 'ebook') {
      const fileExtension = extname(file.name).toLowerCase();
      const allowedExtensions = ['.epub', '.html', '.htm'];
      const allowedMimeTypes = ['application/epub+zip', 'text/html', 'application/octet-stream'];
      
      const isValidExtension = allowedExtensions.includes(fileExtension);
      const isValidMimeType = allowedMimeTypes.includes(file.type);
      
      if (!isValidExtension) {
        return {
          valid: false,
          error: 'Only EPUB (.epub) and HTML (.html, .htm) files are supported'
        };
      }
    }

    return { valid: true };
  }

  /**
   * Generate secure filename
   */
  private generateSecureFilename(originalName: string, bookId: number): string {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 15);
    const extension = extname(originalName).toLowerCase();
    const baseName = basename(originalName, extension);
    
    // Create a sanitized base name
    const sanitizedBaseName = baseName
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .substring(0, 50);
    
    return `${bookId}_${sanitizedBaseName}_${timestamp}_${randomSuffix}${extension}`;
  }

  /**
   * Generate relative URL for database storage
   */
  private generateRelativeUrl(absolutePath: string, fileType: 'cover' | 'ebook' | 'sample'): string {
    // Extract the filename from the absolute path
    const filename = basename(absolutePath);
    
    // Generate appropriate relative URL based on file type
    if (fileType === 'cover') {
      return `/api/images/covers/${filename}`;
    } else if (fileType === 'ebook') {
      // For ebooks, we need to include the book ID in the path
      // This will be handled by the uploadBookFile method
      return `/uploads/books/${filename}`;
    } else {
      return `/uploads/temp/${filename}`;
    }
  }

  /**
   * Convert relative URL back to absolute path
   */
  private getAbsolutePath(relativeUrl: string): string {
    const filename = basename(relativeUrl);
    
    if (relativeUrl.startsWith('/uploads/covers/') || relativeUrl.startsWith('/api/images/covers/')) {
      return join(this.coversDir, filename);
    } else if (relativeUrl.startsWith('/uploads/books/') || relativeUrl.startsWith('/api/ebooks/')) {
      // Extract book ID from path like /api/ebooks/111/filename.epub
      const pathParts = relativeUrl.split('/');
      const bookId = pathParts[3]; // api/ebooks/111/filename.epub -> 111
      return join(this.booksDir, bookId, filename);
    } else if (relativeUrl.startsWith('/uploads/temp/')) {
      return join(this.tempDir, filename);
    } else {
      // Fallback to books directory
      return join(this.booksDir, filename);
    }
  }

  /**
   * Detect file format from filename and MIME type
   */
  private detectFileFormat(filename: string, mimeType: string): 'epub' | 'html' | 'image' {
    const extension = extname(filename).toLowerCase();
    
    if (extension === '.epub' || mimeType === 'application/epub+zip') {
      return 'epub';
    } else if (extension === '.html' || extension === '.htm' || mimeType === 'text/html') {
      return 'html';
    } else if (mimeType.startsWith('image/')) {
      return 'image';
    }
    
    return extension === '.epub' ? 'epub' : 'html';
  }

  /**
   * Check if file already exists by hash
   */
  private async checkFileExists(fileHash: string): Promise<BookFileInfo | null> {
    try {
      const result = await query(`
        SELECT original_filename, stored_filename, file_path, file_size, file_hash, mime_type
        FROM book_files 
        WHERE file_hash = $1
        LIMIT 1
      `, [fileHash]);

      if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
          originalFilename: row.original_filename,
          storedFilename: row.stored_filename,
          filePath: row.file_path,
          fileSize: row.file_size,
          fileHash: row.file_hash,
          mimeType: row.mime_type,
          fileFormat: this.detectFileFormat(row.original_filename, row.mime_type)
        };
      }

      return null;
    } catch (error) {
      console.error('Error checking file existence:', error);
      return null;
    }
  }

  /**
   * Store file information in database
   */
  private async storeFileInfo(bookId: number, fileInfo: BookFileInfo, fileType: string): Promise<void> {
    try {
      await query(`
        INSERT INTO book_files (book_id, file_type, original_filename, stored_filename, file_path, file_size, mime_type, file_hash, file_format, processing_status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        bookId,
        fileType,
        fileInfo.originalFilename,
        fileInfo.storedFilename,
        fileInfo.filePath,
        fileInfo.fileSize,
        fileInfo.mimeType,
        fileInfo.fileHash,
        fileInfo.fileFormat,
        fileType === 'ebook' ? 'pending' : 'completed' // Only ebook files need processing
      ]);

      console.log(`💾 File info stored in database for book ${bookId}`);
    } catch (error) {
      console.error(`❌ Error storing file info for book ${bookId}:`, error);
      throw error;
    }
  }

  /**
   * Queue book parsing for background processing
   */
  private async queueBookParsing(bookId: number, filePath: string, fileFormat: 'epub' | 'html'): Promise<void> {
    try {
      // Update book parsing status
      await query(`
        UPDATE books 
        SET parsing_status = 'processing'
        WHERE id = $1
      `, [bookId]);

      // Add to parsing queue
      await query(`
        INSERT INTO book_parsing_queue (book_id, priority, status)
        VALUES ($1, $2, $3)
      `, [bookId, 5, 'queued']);

      console.log(`📋 Book parsing queued for book ${bookId}`);

      // Start parsing immediately (in production, this would be a background job)
      this.parseBookInBackground(bookId, filePath, fileFormat);

    } catch (error) {
      console.error(`❌ Error queuing book parsing for book ${bookId}:`, error);
      
      // Update book parsing status to failed
      await query(`
        UPDATE books 
        SET parsing_status = 'failed', parsing_error = $2
        WHERE id = $1
      `, [bookId, error instanceof Error ? error.message : 'Unknown error']);
    }
  }

  /**
   * Parse book in background
   */
  private async parseBookInBackground(bookId: number, filePath: string, fileFormat: 'epub' | 'html'): Promise<void> {
    try {
      console.log(`🔄 Starting background parsing for book ${bookId}`);

      // Update queue status
      await query(`
        UPDATE book_parsing_queue 
        SET status = 'processing', started_at = CURRENT_TIMESTAMP
        WHERE book_id = $1
      `, [bookId]);

      // Parse the book
      const parsedContent = await this.bookParser.parseBook(bookId, filePath, fileFormat);

      // Update queue status to completed
      await query(`
        UPDATE book_parsing_queue 
        SET status = 'completed', completed_at = CURRENT_TIMESTAMP
        WHERE book_id = $1
      `, [bookId]);

      // Update book file as processed
      await query(`
        UPDATE book_files 
        SET processing_status = 'completed', processing_error = NULL
        WHERE book_id = $1 AND file_type = 'ebook'
      `, [bookId]);

      console.log(`✅ Background parsing completed for book ${bookId}`);

    } catch (error) {
      console.error(`❌ Background parsing failed for book ${bookId}:`, error);

      // Update queue status to failed
      await query(`
        UPDATE book_parsing_queue 
        SET status = 'failed', error_message = $2, completed_at = CURRENT_TIMESTAMP
        WHERE book_id = $1
      `, [bookId, error instanceof Error ? error.message : 'Unknown error']);

      // Update book parsing status to failed
      await query(`
        UPDATE books 
        SET parsing_status = 'failed', parsing_error = $2
        WHERE id = $1
      `, [bookId, error instanceof Error ? error.message : 'Unknown error']);
    }
  }

  /**
   * Get file information for a book
   */
  async getBookFiles(bookId: number): Promise<BookFileInfo[]> {
    try {
      const result = await query(`
        SELECT original_filename, stored_filename, file_path, file_size, file_hash, mime_type, file_type
        FROM book_files 
        WHERE book_id = $1
        ORDER BY file_type, created_at
      `, [bookId]);

      return result.rows.map(row => ({
        originalFilename: row.original_filename,
        storedFilename: row.stored_filename,
        filePath: row.file_path,
        fileSize: row.file_size,
        fileHash: row.file_hash,
        mimeType: row.mime_type,
        fileFormat: this.detectFileFormat(row.original_filename, row.mime_type)
      }));
    } catch (error) {
      console.error(`❌ Error getting book files for book ${bookId}:`, error);
      return [];
    }
  }

  /**
   * Delete book files
   */
  async deleteBookFiles(bookId: number): Promise<void> {
    try {
      const files = await this.getBookFiles(bookId);
      
      // Delete files from disk
      for (const file of files) {
        const absolutePath = this.getAbsolutePath(file.filePath);
        if (existsSync(absolutePath)) {
          const fs = require('fs');
          fs.unlinkSync(absolutePath);
          console.log(`🗑️ Deleted file: ${absolutePath}`);
        }
      }

      // Delete from database
      await query(`
        DELETE FROM book_files 
        WHERE book_id = $1
      `, [bookId]);

      console.log(`🗑️ Deleted all files for book ${bookId}`);
    } catch (error) {
      console.error(`❌ Error deleting files for book ${bookId}:`, error);
      throw error;
    }
  }

  /**
   * Generate secure access token for file access
   */
  async generateAccessToken(bookId: number, userId: number): Promise<string> {
    try {
      const token = createHash('sha256')
        .update(`${bookId}_${userId}_${Date.now()}_${Math.random()}`)
        .digest('hex');

      // Store token in database
      await query(`
        UPDATE books 
        SET security_token = $2
        WHERE id = $1
      `, [bookId, token]);

      return token;
    } catch (error) {
      console.error(`❌ Error generating access token for book ${bookId}:`, error);
      throw error;
    }
  }

  /**
   * Validate access token
   */
  async validateAccessToken(bookId: number, token: string): Promise<boolean> {
    try {
      const result = await query(`
        SELECT security_token 
        FROM books 
        WHERE id = $1
      `, [bookId]);

      if (result.rows.length === 0) {
        return false;
      }

      return result.rows[0].security_token === token;
    } catch (error) {
      console.error(`❌ Error validating access token for book ${bookId}:`, error);
      return false;
    }
  }
}
