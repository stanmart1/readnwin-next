/**
 * Centralized image path resolver for consistent image handling
 * across development and production environments
 */

class ImagePathResolver {
  private static readonly DEV_STORAGE_PATH = 'storage';
  private static readonly PROD_STORAGE_PATH = '/app/storage';
  private static readonly PUBLIC_UPLOADS_PATH = 'public/uploads';

  /**
   * Get the appropriate storage path for the current environment
   */
  static getStoragePath(): string {
    return process.env.NODE_ENV === 'production' 
      ? this.PROD_STORAGE_PATH 
      : this.DEV_STORAGE_PATH;
  }

  /**
   * Get the appropriate public uploads path for the current environment
   */
  static getPublicUploadsPath(): string {
    return this.PUBLIC_UPLOADS_PATH;
  }

  /**
   * Resolve cover image URL for frontend consumption
   * This ensures consistent image serving across environments
   */
  static resolveCoverImageUrl(coverPath: string | null | undefined): string {
    if (!coverPath) {
      return '/api/images/covers/placeholder';
    }

    // If it's already a full URL, return as-is
    if (coverPath.startsWith('http://') || coverPath.startsWith('https://')) {
      return coverPath;
    }

    // If it's already an API path, return as-is
    if (coverPath.startsWith('/api/')) {
      return coverPath;
    }

    // Extract filename from various possible path formats
    let filename = coverPath;
    
    // Remove common path prefixes
    const prefixesToRemove = [
      '/uploads/covers/',
      '/storage/covers/',
      'uploads/covers/',
      'storage/covers/',
      'public/uploads/covers/',
      '/app/storage/covers/',
    ];

    for (const prefix of prefixesToRemove) {
      if (filename.startsWith(prefix)) {
        filename = filename.substring(prefix.length);
        break;
      }
    }

    // Return standardized API path
    return `/api/images/covers/${filename}`;
  }

  /**
   * Get all possible file paths for an image (for serving endpoints)
   */
  static getPossibleImagePaths(filename: string): string[] {
    const paths: string[] = [];
    
    if (process.env.NODE_ENV === 'production') {
      // Production paths
      paths.push(`/app/storage/covers/${filename}`);
      paths.push(`/app/storage/covers/original/${filename}`);
      paths.push(`/app/storage/uploads/covers/${filename}`);
      paths.push(`/app/public/uploads/covers/${filename}`);
    } else {
      // Development paths
      const cwd = process.cwd();
      paths.push(`${cwd}/storage/covers/${filename}`);
      paths.push(`${cwd}/storage/covers/original/${filename}`);
      paths.push(`${cwd}/storage/uploads/covers/${filename}`);
      paths.push(`${cwd}/public/uploads/covers/${filename}`);
      paths.push(`${cwd}/uploads/covers/${filename}`);
    }

    return paths;
  }

  /**
   * Get the target upload path for new images
   */
  static getUploadTargetPath(filename: string): string {
    const basePath = process.env.NODE_ENV === 'production' 
      ? '/app/storage/covers' 
      : `${process.cwd()}/storage/covers`;
    
    return `${basePath}/${filename}`;
  }

  /**
   * Convert database path to standardized format
   */
  static standardizeDatabasePath(originalPath: string): string {
    if (!originalPath) return '';
    
    // Extract filename
    const filename = this.extractFilename(originalPath);
    
    // Return environment-appropriate path
    if (process.env.NODE_ENV === 'production') {
      return `/storage/covers/${filename}`;
    } else {
      return `/storage/covers/${filename}`;
    }
  }

  /**
   * Extract filename from any path format
   */
  private static extractFilename(path: string): string {
    // Remove query parameters
    const cleanPath = path.split('?')[0];
    
    // Get the last part of the path (filename)
    const parts = cleanPath.split('/');
    return parts[parts.length - 1];
  }

  /**
   * Migrate image from one location to another
   */
  static async migrateImage(sourcePath: string, targetPath: string): Promise<boolean> {
    try {
      const fs = require('fs/promises');
      const path = require('path');
      
      // Ensure target directory exists
      const targetDir = path.dirname(targetPath);
      await fs.mkdir(targetDir, { recursive: true });
      
      // Copy file
      await fs.copyFile(sourcePath, targetPath);
      
      console.log(`✅ Migrated image: ${sourcePath} -> ${targetPath}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to migrate image: ${sourcePath} -> ${targetPath}`, error);
      return false;
    }
  }
}

export { ImagePathResolver };
export default ImagePathResolver;