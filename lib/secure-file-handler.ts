import JSZip from 'jszip';
import { validateFileUpload } from './security-headers';

export class SecureFileHandler {
  private static readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  private static readonly ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.epub', '.txt'];

  static async processZipFile(buffer: Buffer): Promise<any> {
    try {
      // Validate buffer size
      if (buffer.length > this.MAX_FILE_SIZE) {
        throw new Error('File too large');
      }

      const zip = await JSZip.loadAsync(buffer);
      const processedFiles: any = {};

      // Validate all entries before processing
      for (const [path, entry] of Object.entries(zip.files)) {
        // Prevent path traversal
        const normalizedPath = path.replace(/\\/g, '/');
        if (normalizedPath.includes('../') || normalizedPath.startsWith('/') || normalizedPath.includes('..\\')) {
          throw new Error(`Dangerous path detected: ${path}`);
        }

        // Limit individual file size
        if (entry._data && entry._data.uncompressedSize > this.MAX_FILE_SIZE) {
          throw new Error(`File too large: ${path}`);
        }

        // Validate file extension
        const extension = this.getFileExtension(path);
        if (extension && !this.ALLOWED_EXTENSIONS.includes(extension)) {
          console.warn(`Skipping file with disallowed extension: ${path}`);
          continue;
        }

        if (!entry.dir) {
          try {
            const content = await entry.async('text');
            processedFiles[this.sanitizePath(path)] = this.sanitizeContent(content);
          } catch (error) {
            console.warn(`Failed to process file ${path}:`, error);
          }
        }
      }

      return processedFiles;
    } catch (error) {
      throw new Error(`Zip processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static validateUpload(file: File): { valid: boolean; error?: string } {
    return validateFileUpload(file);
  }

  private static getFileExtension(filename: string): string | null {
    const match = filename.match(/\.[^.]+$/);
    return match ? match[0].toLowerCase() : null;
  }

  private static sanitizePath(path: string): string {
    return path
      .replace(/[^a-zA-Z0-9._/-]/g, '_')
      .replace(/\.+/g, '.')
      .replace(/\/+/g, '/')
      .substring(0, 255);
  }

  private static sanitizeContent(content: string): string {
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/data:/gi, '')
      .substring(0, 1024 * 1024); // Limit content to 1MB
  }
}