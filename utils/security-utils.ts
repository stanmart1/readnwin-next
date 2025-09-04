import path from 'path';

export class SecurityUtils {
  // Sanitize filename to prevent path traversal
  static sanitizeFilename(filename: string): string {
    if (!filename) return '';
    return path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
  }

  // Sanitize path to prevent traversal
  static sanitizePath(inputPath: string): string {
    if (!inputPath) return '';
    return inputPath.replace(/\.\./g, '').replace(/[\/\\]/g, '_');
  }

  // Sanitize for logging to prevent log injection
  static sanitizeForLog(input: any): string {
    if (typeof input !== 'string') {
      input = String(input);
    }
    return input.replace(/[\r\n\t]/g, ' ').substring(0, 200);
  }

  // Sanitize HTML to prevent XSS
  static sanitizeHtml(input: string): string {
    if (!input) return '';
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // Validate file path is within allowed directory
  static isPathSafe(filePath: string, allowedDir: string): boolean {
    const resolvedPath = path.resolve(filePath);
    const resolvedAllowedDir = path.resolve(allowedDir);
    return resolvedPath.startsWith(resolvedAllowedDir);
  }
}