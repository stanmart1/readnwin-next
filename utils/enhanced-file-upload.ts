import { writeFile, mkdir, readFile, stat } from 'fs/promises';
import { join, dirname, extname } from 'path';
import { existsSync } from 'fs';

export interface UploadedFile {
  filename: string;
  path: string;
  size: number;
  mimetype: string;
  originalName: string;
}

export interface UploadResult {
  success: boolean;
  file?: UploadedFile;
  error?: string;
  details?: any;
}

export interface BookStorageConfig {
  baseDir: string;
  epubDir: string;
  processedDir: string;
  tempDir: string;
}

export class EnhancedFileUploadService {
  private config: BookStorageConfig;
  private uploadDir: string;

  constructor() {
    // Use environment-specific paths - maintain compatibility with existing system
    const baseDir = process.env.NODE_ENV === 'production' 
      ? '/app/book-files' 
      : join(process.cwd(), 'book-files');
    
    this.config = {
      baseDir,
      epubDir: join(baseDir, 'epub'),
      processedDir: join(baseDir, 'processed'),
      tempDir: join(baseDir, 'temp')
    };
    
    this.uploadDir = process.env.NODE_ENV === 'production' 
      ? '/uploads' 
      : join(process.cwd(), 'public', 'uploads');
    
    console.log('📁 EnhancedFileUploadService initialized with paths:', {
      baseDir: this.config.baseDir,
      uploadDir: this.uploadDir,
      environment: process.env.NODE_ENV
    });
  }

  /**
   * Initialize the directory structure for book storage
   */
  async initializeDirectories(): Promise<void> {
    console.log('📁 Initializing book storage directories...');
    
    const directories = [
      this.config.baseDir,
      this.config.epubDir,
      this.config.processedDir,
      this.config.tempDir
    ];

    for (const dir of directories) {
      try {
        if (!existsSync(dir)) {
          console.log(`📁 Creating directory: ${dir}`);
          await mkdir(dir, { recursive: true });
          
          // Verify directory was created
          if (!existsSync(dir)) {
            throw new Error(`Failed to create directory: ${dir}`);
          }
          console.log(`✅ Directory created: ${dir}`);
        } else {
          console.log(`✅ Directory exists: ${dir}`);
        }
      } catch (error) {
        console.error(`❌ Failed to create directory ${dir}:`, error);
        throw new Error(`Permission denied: Cannot create directory. Please check file permissions. Directory: ${dir}, Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  /**
   * Upload and store an ebook file with proper organization
   */
  async uploadEbookFile(file: File, bookId: string): Promise<UploadResult> {
    try {
      console.log(`📤 Starting ebook upload: ${file.name} for book ${bookId}`);
      
      // Validate file first
      const validation = this.validateEbookFile(file);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error || 'File validation failed'
        };
      }

      // Initialize directories
      await this.initializeDirectories();

      // Store file directly in book-files directory (no complex subdirectories)
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const originalName = file.name;
      const extension = extname(originalName).toLowerCase();
      const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${timestamp}_${randomString}_${sanitizedName}`;
      
      // Store original file directly in book-files
      const originalFilePath = join(this.config.baseDir, filename);
      
      // DISABLED: No processed content directories needed
      // const processedContentDir = join(bookProcessedDir, 'content');
      // const metadataPath = join(bookProcessedDir, 'metadata.json');
      // await mkdir(processedContentDir, { recursive: true });

      // Convert File to Buffer and save
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      console.log(`📄 Writing original file: ${originalFilePath}`);
      await writeFile(originalFilePath, buffer);
      
      // Verify file was written
      const fileStats = await stat(originalFilePath);
      if (fileStats.size !== buffer.length) {
        throw new Error(`File size mismatch: expected ${buffer.length}, got ${fileStats.size}`);
      }

      // DISABLED: Content processing to preserve original format
      // Process content based on file type
      let processedContent = null;
      let metadata = {
        title: originalName.replace(extension, ''),
        author: 'Unknown',
        format: extension.substring(1),
        fileSize: buffer.length,
        uploadDate: new Date().toISOString(),
        originalFilename: originalName
      };

      // DISABLED: No content processing to preserve original structure
      // if (extension === '.epub') {
      //   processedContent = await this.processEPUB(originalFilePath);
      //   metadata = { ...metadata, ...processedContent.metadata };
      // } else if (extension === '.pdf') {
      //   processedContent = await this.convertPDFToHTML(originalFilePath);
      //   metadata = { ...metadata, ...processedContent.metadata };
      // }

      // DISABLED: No metadata file storage to keep it simple
      // Save basic metadata only
      // await writeFile(metadataPath, JSON.stringify(metadata, null, 2));

      // DISABLED: No processed content storage
      // Save processed content if available
      // if (processedContent) {
      //   const contentPath = join(processedContentDir, 'content.json');
      //   await writeFile(contentPath, JSON.stringify(processedContent, null, 2));
      // }

      const uploadedFile: UploadedFile = {
        filename,
        path: `/book-files/${filename}`,
        size: buffer.length,
        mimetype: file.type,
        originalName
      };

      console.log(`✅ Ebook uploaded successfully: ${uploadedFile.path}`);
      
      return {
        success: true,
        file: uploadedFile,
        details: {
          bookId,
          originalPath: originalFilePath,
          // DISABLED: No processed path needed
          // processedPath: bookProcessedDir,
          metadata: metadata
        }
      };

    } catch (error) {
      console.error('❌ Ebook upload failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown upload error',
        details: {
          bookId,
          fileName: file.name,
          fileSize: file.size,
          error: error
        }
      };
    }
  }

  /**
   * Upload cover image
   */
  async uploadCoverImage(file: File): Promise<UploadResult> {
    try {
      console.log(`📤 Starting cover image upload: ${file.name}`);
      
      // Validate image
      const validation = this.validateImageFile(file);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error || 'Image validation failed'
        };
      }

      // Generate filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const originalName = file.name;
      const extension = extname(originalName).toLowerCase();
      const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${timestamp}_${randomString}_${sanitizedName}`;
      
      // Save to covers directory
      const coversDir = join(this.uploadDir, 'covers');
      await mkdir(coversDir, { recursive: true });
      
      const filePath = join(coversDir, filename);
      
      // Convert File to Buffer and save
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      await writeFile(filePath, buffer);
      
      // Verify file was written
      const fileStats = await stat(filePath);
      if (fileStats.size !== buffer.length) {
        throw new Error(`File size mismatch: expected ${buffer.length}, got ${fileStats.size}`);
      }

      const uploadedFile: UploadedFile = {
        filename,
        path: process.env.NODE_ENV === 'production' 
          ? `/uploads/covers/${filename}`
          : `/uploads/covers/${filename}`,
        size: buffer.length,
        mimetype: file.type,
        originalName
      };

      console.log(`✅ Cover image uploaded successfully: ${uploadedFile.path}`);
      
      return {
        success: true,
        file: uploadedFile
      };

    } catch (error) {
      console.error('❌ Cover image upload failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown upload error'
      };
    }
  }

  /**
   * Get book content from storage
   */
  async getBookContent(bookId: string): Promise<any> {
    try {
      const processedDir = join(this.config.processedDir, bookId);
      const contentPath = join(processedDir, 'content', 'content.json');
      const metadataPath = join(processedDir, 'metadata.json');

      if (!existsSync(contentPath)) {
        throw new Error('Book content not found');
      }

      const contentData = await readFile(contentPath, 'utf-8');
      const metadataData = await readFile(metadataPath, 'utf-8');

      return {
        content: JSON.parse(contentData),
        metadata: JSON.parse(metadataData)
      };

    } catch (error) {
      console.error('❌ Failed to get book content:', error);
      throw error;
    }
  }

  /**
   * Process EPUB file and extract content
   */
  private async processEPUB(filePath: string): Promise<any> {
    try {
      // For now, just return basic file info without parsing
      // Content parsing can be done later when needed
      const stats = await stat(filePath);
      
      return {
        type: 'epub',
        content: '', // Content will be parsed when needed
        chapters: [],
        metadata: {
          title: 'Unknown Title',
          author: 'Unknown Author',
          wordCount: 0,
          estimatedReadingTime: 0,
          fileSize: stats.size
        }
      };

    } catch (error) {
      console.error('❌ EPUB processing failed:', error);
      throw error;
    }
  }

  /**
   * Convert PDF to HTML
   */
  private async convertPDFToHTML(filePath: string): Promise<any> {
    try {
      // For now, just return basic file info without parsing
      // Content parsing can be done later when needed
      const stats = await stat(filePath);
      
      return {
        type: 'html',
        content: '', // Content will be parsed when needed
        chapters: [],
        metadata: {
          title: 'Unknown Title',
          author: 'Unknown Author',
          wordCount: 0,
          estimatedReadingTime: 0,
          fileSize: stats.size
        }
      };

    } catch (error) {
      console.error('❌ PDF conversion failed:', error);
      throw error;
    }
  }

  /**
   * Convert markdown to HTML
   */
  private markdownToHTML(markdown: string): string {
    // Simple markdown to HTML conversion
    return markdown
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/\n\n/gim, '</p><p>')
      .replace(/^(?!<[h|p])/gim, '<p>')
      .replace(/$/gim, '</p>');
  }

  /**
   * Validate image file
   */
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

  /**
   * Validate ebook file
   */
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
      const fileName = file.name.toLowerCase();
      const validExtensions = ['.epub', '.pdf', '.mobi'];
      const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
      
      if (!hasValidExtension) {
        return { valid: false, error: 'Invalid file type. Only EPUB, PDF, and MOBI are allowed.' };
      }
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'File size too large. Maximum size is 50MB.' };
    }

    return { valid: true };
  }

  /**
   * Check if a file exists
   */
  async checkFileExists(filePath: string): Promise<boolean> {
    try {
      // Convert URL paths to file system paths
      let fsPath = filePath;
      
      if (filePath.startsWith('/uploads/')) {
        // Local development path
        fsPath = join(process.cwd(), 'public', filePath);
      } else if (filePath.startsWith('/uploads/')) {
        // Production path
        fsPath = join('/app', filePath);
      } else if (filePath.startsWith('/book-files/')) {
        // Book files path
        fsPath = join(process.env.NODE_ENV === 'production' ? '/app' : process.cwd(), filePath);
      }
      
      console.log('🔍 Checking file existence:', { originalPath: filePath, fsPath, exists: existsSync(fsPath) });
      return existsSync(fsPath);
    } catch (error) {
      console.error('❌ Error checking file existence:', error);
      return false;
    }
  }
}

export const enhancedFileUploadService = new EnhancedFileUploadService(); 