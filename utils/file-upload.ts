import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export interface UploadedFile {
  filename: string;
  path: string;
  size: number;
  mimetype: string;
}

export class FileUploadService {
  private uploadDir: string;

  constructor(uploadDir?: string) {
    // Use environment-specific upload directory
    if (uploadDir) {
      this.uploadDir = uploadDir;
    } else if (process.env.NODE_ENV === 'production') {
      this.uploadDir = '/app/storage';
    } else {
      // Development: use public/uploads
      this.uploadDir = join(process.cwd(), 'public', 'uploads');
    }
  }

  async uploadFile(file: File, subdirectory: string): Promise<UploadedFile> {
    try {
      console.log(`📤 Starting file upload: ${file.name} to ${subdirectory}`);
      console.log(`📤 File details: ${file.size} bytes, ${file.type}`);
      console.log(`📤 Upload directory: ${this.uploadDir}`);
      console.log(`📤 Environment: ${process.env.NODE_ENV}`);
      
      // Create directory if it doesn't exist with proper error handling
      const fullPath = join(this.uploadDir, subdirectory);
      console.log(`📁 Ensuring upload directory exists: ${fullPath}`);
      
      if (!existsSync(fullPath)) {
        console.log(`📁 Creating directory: ${fullPath}`);
        try {
          await mkdir(fullPath, { recursive: true });
          
          // Verify directory was created
          if (!existsSync(fullPath)) {
            throw new Error(`Failed to create upload directory: ${fullPath}`);
          }
          console.log(`✅ Directory created successfully: ${fullPath}`);
        } catch (mkdirError) {
          console.error(`❌ Failed to create directory ${fullPath}:`, mkdirError);
          throw new Error(`Permission denied: Cannot create upload directory. Please check file permissions. Directory: ${fullPath}, Error: ${mkdirError instanceof Error ? mkdirError.message : 'Unknown error'}`);
        }
      } else {
        console.log(`✅ Directory already exists: ${fullPath}`);
      }

      // Generate unique filename with better naming
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const originalName = file.name;
      const extension = originalName.split('.').pop()?.toLowerCase();
      const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${timestamp}_${randomString}_${sanitizedName}`;
      const filePath = join(fullPath, filename);

      console.log(`📄 Uploading file: ${originalName} -> ${filename}`);
      console.log(`📄 Full file path: ${filePath}`);

      // Convert File to Buffer and save
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      try {
        await writeFile(filePath, buffer);
        console.log(`✅ File written successfully: ${filePath}`);
      } catch (writeError) {
        console.error(`❌ Failed to write file ${filePath}:`, writeError);
        throw new Error(`Permission denied: Cannot write file to upload directory. Please check file permissions. File: ${filePath}, Error: ${writeError instanceof Error ? writeError.message : 'Unknown error'}`);
      }

      // Verify file was written successfully
      if (!existsSync(filePath)) {
        throw new Error(`File was not written successfully: ${filePath}`);
      }

      console.log(`✅ File uploaded successfully: ${filePath}`);

      // Generate environment-specific path
      let returnPath: string;
      
      // Special handling for book-files directory
      if (this.uploadDir.includes('book-files')) {
        // For book files, use a relative path from the project root
        returnPath = `/storage/books/${filename}`;
      } else {
        // For other uploads, use the standard path
        const pathPrefix = process.env.NODE_ENV === 'production' ? '/uploads' : '/uploads';
        returnPath = `${pathPrefix}/${subdirectory}/${filename}`;
      }
      
      console.log(`✅ Generated return path: ${returnPath}`);
      
      return {
        filename,
        path: returnPath,
        size: file.size,
        mimetype: file.type
      };
    } catch (error) {
      console.error('❌ Error uploading file:', error);
      console.error('❌ Error details:', {
        subdirectory,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadDir: this.uploadDir,
        environment: process.env.NODE_ENV,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('Permission denied')) {
          throw new Error(`File upload failed: Permission denied. Please check server file permissions. Details: ${error.message}`);
        } else if (error.message.includes('ENOSPC')) {
          throw new Error(`File upload failed: No space left on device. Please check server disk space. Details: ${error.message}`);
        } else if (error.message.includes('ENOENT')) {
          throw new Error(`File upload failed: Directory not found. Please check upload directory configuration. Details: ${error.message}`);
        } else {
          throw new Error(`File upload failed: ${error.message}`);
        }
      } else {
        throw new Error(`File upload failed: Unknown error occurred`);
      }
    }
  }

  async uploadCoverImage(file: File): Promise<UploadedFile> {
    return this.uploadFile(file, 'covers');
  }

  async uploadEbookFile(file: File): Promise<UploadedFile> {
    // Use the dedicated book-files directory in the current project directory
    // In production, this will be /app/book-files, in development it will be ./book-files
    const bookFilesDir = process.env.NODE_ENV === 'production' 
      ? '/app/storage/books' 
      : join(process.cwd(), 'book-files');
    const customUploadService = new FileUploadService(bookFilesDir);
    return customUploadService.uploadFile(file, '');
  }

  validateImageFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Invalid file type. Only JPG, PNG, and WebP are allowed.' };
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'File size too large. Maximum size is 5MB.' };
    }

    return { valid: true };
  }

  validateEbookFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = [
      'application/epub+zip',
      'application/epub',
      'application/x-epub',
      'application/octet-stream',
      'application/zip',
      'application/x-zip-compressed',
      'application/pdf',
      'application/x-mobipocket-ebook'
    ];
    const maxSize = 50 * 1024 * 1024; // 50MB

    // Check file type with fallback to extension check
    if (!allowedTypes.includes(file.type)) {
      // Check file extension as fallback for ebooks
      const fileName = file.name.toLowerCase();
      const validExtensions = ['.epub', '.pdf', '.mobi'];
      const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
      
      if (hasValidExtension) {
        console.log(`✅ Ebook file validation passed via extension check: ${file.name} (${file.type})`);
        // Continue to size check
      } else {
        return { valid: false, error: 'Invalid file type. Only EPUB, PDF, and MOBI are allowed.' };
      }
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'File size too large. Maximum size is 50MB.' };
    }

    return { valid: true };
  }

  // Check if a file exists at the given path
  async checkFileExists(filePath: string): Promise<boolean> {
    try {
      console.log(`🔍 Checking file existence for path: ${filePath}`);
      console.log(`🔍 Upload directory: ${this.uploadDir}`);
      console.log(`🔍 Environment: ${process.env.NODE_ENV}`);
      
      let fullPath: string;
      
      // Special handling for book-files directory
      if (filePath.startsWith('/book-files/')) {
        const relativePath = filePath.replace('/book-files/', '');
        const bookFilesDir = process.env.NODE_ENV === 'production' 
          ? '/app/book-files' 
          : join(process.cwd(), 'book-files');
        fullPath = join(bookFilesDir, relativePath);
      } else if (process.env.NODE_ENV === 'production') {
        // In production, filePath is like "/uploads/covers/filename"
        // We need to extract the relative path after "/uploads/"
        if (filePath.startsWith('/uploads/')) {
          const relativePath = filePath.replace('/uploads/', '');
          fullPath = join(this.uploadDir, relativePath);
        } else if (filePath.startsWith('/uploads/')) {
          // Fallback for old paths
          const relativePath = filePath.replace('/uploads/', '');
          fullPath = join(this.uploadDir, relativePath);
        } else {
          // Assume it's already a relative path
          fullPath = join(this.uploadDir, filePath);
        }
      } else {
        // In development, filePath is like "/uploads/covers/filename"
        if (filePath.startsWith('/uploads/')) {
          const relativePath = filePath.replace('/uploads/', '');
          fullPath = join(this.uploadDir, relativePath);
        } else if (filePath.startsWith('/uploads/')) {
          // Handle production-style paths in development
          const relativePath = filePath.replace('/uploads/', '');
          fullPath = join(this.uploadDir, relativePath);
        } else {
          // Assume it's already a relative path
          fullPath = join(this.uploadDir, filePath);
        }
      }
      
      console.log(`🔍 Full path to check: ${fullPath}`);
      const exists = existsSync(fullPath);
      console.log(`🔍 File exists: ${exists}`);
      
      if (!exists) {
        console.error(`❌ File not found at: ${fullPath}`);
        console.error(`❌ Original path: ${filePath}`);
        console.error(`❌ Upload directory: ${this.uploadDir}`);
        console.error(`❌ Environment: ${process.env.NODE_ENV}`);
      }
      
      return exists;
    } catch (error) {
      console.error('❌ Error checking file existence:', error);
      console.error('❌ Error details:', {
        filePath,
        uploadDir: this.uploadDir,
        environment: process.env.NODE_ENV,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  // Get the full server path for a file
  getFullPath(relativePath: string): string {
    console.log(`🔍 Getting full path for: ${relativePath}`);
    
    let pathWithoutPrefix: string;
    let baseDir: string;
    
    // Special handling for book-files directory
    if (relativePath.startsWith('/book-files/')) {
      pathWithoutPrefix = relativePath.replace('/book-files/', '');
      baseDir = process.env.NODE_ENV === 'production' 
        ? '/app/book-files' 
        : join(process.cwd(), 'book-files');
    } else if (process.env.NODE_ENV === 'production') {
      if (relativePath.startsWith('/uploads/')) {
        pathWithoutPrefix = relativePath.replace('/uploads/', '');
      } else if (relativePath.startsWith('/uploads/')) {
        pathWithoutPrefix = relativePath.replace('/uploads/', '');
      } else {
        pathWithoutPrefix = relativePath;
      }
      baseDir = this.uploadDir;
    } else {
      if (relativePath.startsWith('/uploads/')) {
        pathWithoutPrefix = relativePath.replace('/uploads/', '');
      } else {
        pathWithoutPrefix = relativePath;
      }
      baseDir = this.uploadDir;
    }
    
    const fullPath = join(baseDir, pathWithoutPrefix);
    console.log(`🔍 Full path: ${fullPath}`);
    return fullPath;
  }
}

export const fileUploadService = new FileUploadService(); 