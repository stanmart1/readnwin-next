import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

/**
 * Storage Service for handling file operations on persistent volume
 * Ensures all file operations account for the persistent volume mounted on /
 */
export class StorageService {
  // Base paths - use local storage in development, persistent volume in production
  private static readonly BASE_STORAGE_PATH = process.env.NODE_ENV === 'production' ? '/app/storage' : './storage';
  private static readonly BOOKS_PATH = process.env.NODE_ENV === 'production' ? '/app/storage/books' : './storage/books';
  private static readonly COVERS_PATH = process.env.NODE_ENV === 'production' ? '/app/storage/covers' : './storage/covers';
  private static readonly ASSETS_PATH = process.env.NODE_ENV === 'production' ? '/app/storage/assets' : './storage/assets';
  private static readonly TEMP_PATH = process.env.NODE_ENV === 'production' ? '/app/storage/temp' : './storage/temp';
  private static readonly PROCESSED_PATH = process.env.NODE_ENV === 'production' ? '/app/storage/processed' : './storage/processed';

  /**
   * Initialize storage directories on persistent volume
   */
  static async initializeStorage(): Promise<void> {
    const directories = [
      this.BASE_STORAGE_PATH,
      this.BOOKS_PATH,
      this.COVERS_PATH,
      this.ASSETS_PATH,
      this.TEMP_PATH,
      this.PROCESSED_PATH,
      `${this.BOOKS_PATH}/epub`,
      `${this.BOOKS_PATH}/html`,
      `${this.BOOKS_PATH}/pdf`,
      `${this.COVERS_PATH}/original`,
      `${this.COVERS_PATH}/thumbnails`,
      `${this.ASSETS_PATH}/images`,
      `${this.ASSETS_PATH}/fonts`,
      `${this.ASSETS_PATH}/stylesheets`,
    ];

    for (const dir of directories) {
      try {
        await fs.access(dir);
      } catch {
        await fs.mkdir(dir, { recursive: true });
        console.log(`Created storage directory: ${dir}`);
      }
    }
  }

  /**
   * Generate secure file path on persistent volume
   */
  static generateSecureFilePath(
    type: 'book' | 'cover' | 'asset' | 'temp' | 'processed',
    bookId: string,
    originalFilename: string,
    subType?: string
  ): string {
    const timestamp = Date.now();
    const randomSuffix = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(originalFilename);
    const baseName = path.basename(originalFilename, ext);
    
    // Sanitize filename
    const sanitizedBaseName = baseName
      .replace(/[^a-zA-Z0-9\-_]/g, '_')
      .substring(0, 50);
    
    const secureFilename = `${timestamp}_${randomSuffix}_${sanitizedBaseName}${ext}`;
    
    let basePath: string;
    switch (type) {
      case 'book':
        basePath = subType ? `${this.BOOKS_PATH}/${subType}` : this.BOOKS_PATH;
        break;
      case 'cover':
        basePath = subType ? `${this.COVERS_PATH}/${subType}` : this.COVERS_PATH;
        break;
      case 'asset':
        basePath = subType ? `${this.ASSETS_PATH}/${subType}` : this.ASSETS_PATH;
        break;
      case 'temp':
        basePath = this.TEMP_PATH;
        break;
      case 'processed':
        basePath = this.PROCESSED_PATH;
        break;
      default:
        throw new Error(`Invalid storage type: ${type}`);
    }
    
    // Create book-specific subdirectory
    const bookDir = path.join(basePath, bookId);
    return path.join(bookDir, secureFilename);
  }

  /**
   * Store uploaded file securely on persistent volume
   */
  static async storeFile(
    file: File | Buffer,
    targetPath: string
  ): Promise<{
    success: boolean;
    filePath: string;
    fileSize: number;
    fileHash: string;
    error?: string;
  }> {
    try {
      // Ensure target directory exists
      const targetDir = path.dirname(targetPath);
      await fs.mkdir(targetDir, { recursive: true });

      let buffer: Buffer;
      if (file instanceof File) {
        buffer = Buffer.from(await file.arrayBuffer());
      } else {
        buffer = file;
      }

      // Calculate file hash
      const fileHash = crypto.createHash('sha256').update(buffer).digest('hex');

      // Write file to persistent volume
      await fs.writeFile(targetPath, buffer);

      // Verify file was written correctly
      const stats = await fs.stat(targetPath);
      
      return {
        success: true,
        filePath: targetPath,
        fileSize: stats.size,
        fileHash,
      };
    } catch (error) {
      console.error('Error storing file:', error);
      return {
        success: false,
        filePath: targetPath,
        fileSize: 0,
        fileHash: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Stream file from persistent volume
   */
  static async streamFile(filePath: string): Promise<NodeJS.ReadableStream | null> {
    try {
      // Verify file exists on persistent volume
      await fs.access(filePath);
      return createReadStream(filePath);
    } catch (error) {
      console.error('Error streaming file:', error);
      return null;
    }
  }

  /**
   * Copy file within persistent volume
   */
  static async copyFile(sourcePath: string, targetPath: string): Promise<boolean> {
    try {
      // Ensure target directory exists
      const targetDir = path.dirname(targetPath);
      await fs.mkdir(targetDir, { recursive: true });

      // Copy file
      await fs.copyFile(sourcePath, targetPath);
      return true;
    } catch (error) {
      console.error('Error copying file:', error);
      return false;
    }
  }

  /**
   * Move file within persistent volume
   */
  static async moveFile(sourcePath: string, targetPath: string): Promise<boolean> {
    try {
      // Ensure target directory exists
      const targetDir = path.dirname(targetPath);
      await fs.mkdir(targetDir, { recursive: true });

      // Move file
      await fs.rename(sourcePath, targetPath);
      return true;
    } catch (error) {
      console.error('Error moving file:', error);
      return false;
    }
  }

  /**
   * Delete file from persistent volume
   */
  static async deleteFile(filePath: string): Promise<boolean> {
    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  /**
   * Get file info from persistent volume
   */
  static async getFileInfo(filePath: string): Promise<{
    exists: boolean;
    size?: number;
    mtime?: Date;
    isFile?: boolean;
    isDirectory?: boolean;
  }> {
    try {
      const stats = await fs.stat(filePath);
      return {
        exists: true,
        size: stats.size,
        mtime: stats.mtime,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
      };
    } catch (error) {
      return { exists: false };
    }
  }

  /**
   * List files in directory on persistent volume
   */
  static async listFiles(directoryPath: string): Promise<string[]> {
    try {
      const files = await fs.readdir(directoryPath);
      return files;
    } catch (error) {
      console.error('Error listing files:', error);
      return [];
    }
  }

  /**
   * Clean up temporary files older than specified age
   */
  static async cleanupTempFiles(maxAgeHours: number = 24): Promise<number> {
    try {
      const files = await fs.readdir(this.TEMP_PATH);
      const cutoffTime = Date.now() - (maxAgeHours * 60 * 60 * 1000);
      let deletedCount = 0;

      for (const file of files) {
        const filePath = path.join(this.TEMP_PATH, file);
        const stats = await fs.stat(filePath);
        
        if (stats.mtime.getTime() < cutoffTime) {
          await fs.unlink(filePath);
          deletedCount++;
        }
      }

      return deletedCount;
    } catch (error) {
      console.error('Error cleaning up temp files:', error);
      return 0;
    }
  }

  /**
   * Get storage usage statistics
   */
  static async getStorageStats(): Promise<{
    totalSize: number;
    bookCount: number;
    coverCount: number;
    assetCount: number;
    tempCount: number;
  }> {
    try {
      const stats = {
        totalSize: 0,
        bookCount: 0,
        coverCount: 0,
        assetCount: 0,
        tempCount: 0,
      };

      // Count books
      const bookFiles = await this.listFiles(this.BOOKS_PATH);
      stats.bookCount = bookFiles.length;

      // Count covers
      const coverFiles = await this.listFiles(this.COVERS_PATH);
      stats.coverCount = coverFiles.length;

      // Count assets
      const assetFiles = await this.listFiles(this.ASSETS_PATH);
      stats.assetCount = assetFiles.length;

      // Count temp files
      const tempFiles = await this.listFiles(this.TEMP_PATH);
      stats.tempCount = tempFiles.length;

      // Calculate total size (recursive)
      stats.totalSize = await this.calculateDirectorySize(this.BASE_STORAGE_PATH);

      return stats;
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return {
        totalSize: 0,
        bookCount: 0,
        coverCount: 0,
        assetCount: 0,
        tempCount: 0,
      };
    }
  }

  /**
   * Calculate directory size recursively
   */
  private static async calculateDirectorySize(dirPath: string): Promise<number> {
    try {
      let totalSize = 0;
      const items = await fs.readdir(dirPath, { withFileTypes: true });

      for (const item of items) {
        const itemPath = path.join(dirPath, item.name);
        
        if (item.isFile()) {
          const stats = await fs.stat(itemPath);
          totalSize += stats.size;
        } else if (item.isDirectory()) {
          totalSize += await this.calculateDirectorySize(itemPath);
        }
      }

      return totalSize;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Validate file path is within allowed storage areas
   */
  static validateFilePath(filePath: string): boolean {
    const normalizedPath = path.normalize(filePath);
    const allowedPaths = [
      this.BASE_STORAGE_PATH,
      this.BOOKS_PATH,
      this.COVERS_PATH,
      this.ASSETS_PATH,
      this.TEMP_PATH,
      this.PROCESSED_PATH,
    ];

    return allowedPaths.some(allowedPath => 
      normalizedPath.startsWith(path.normalize(allowedPath))
    );
  }

  /**
   * Create secure download URL for files
   */
  static createSecureUrl(filePath: string, expiresIn: number = 3600): string {
    const timestamp = Math.floor(Date.now() / 1000) + expiresIn;
    const token = crypto
      .createHmac('sha256', process.env.FILE_ACCESS_SECRET || 'default-secret')
      .update(`${filePath}:${timestamp}`)
      .digest('hex');
    
    return `/api/files/secure/${encodeURIComponent(filePath)}?expires=${timestamp}&token=${token}`;
  }

  /**
   * Verify secure download URL
   */
  static verifySecureUrl(filePath: string, expires: string, token: string): boolean {
    const timestamp = parseInt(expires);
    const now = Math.floor(Date.now() / 1000);
    
    // Check if URL has expired
    if (now > timestamp) {
      return false;
    }
    
    // Verify token
    const expectedToken = crypto
      .createHmac('sha256', process.env.FILE_ACCESS_SECRET || 'default-secret')
      .update(`${filePath}:${timestamp}`)
      .digest('hex');
    
    return token === expectedToken;
  }
}

// Initialize storage on module load
StorageService.initializeStorage().catch(console.error);

export default StorageService;