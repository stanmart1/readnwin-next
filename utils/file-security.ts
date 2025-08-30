import path from 'path';
import fs from 'fs/promises';

const ALLOWED_UPLOAD_DIRS = [
  '/uploads/covers',
  '/uploads/books',
  '/uploads/profiles'
];

const BLOCKED_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
  '.php', '.asp', '.aspx', '.jsp', '.py', '.rb', '.pl', '.sh', '.bash'
];

export const validateFilePath = (filePath: string): boolean => {
  const normalizedPath = path.normalize(filePath);
  
  // Prevent directory traversal
  if (normalizedPath.includes('..') || normalizedPath.includes('~')) {
    return false;
  }
  
  // Check if path is within allowed directories
  const isAllowed = ALLOWED_UPLOAD_DIRS.some(dir => 
    normalizedPath.startsWith(path.normalize(dir))
  );
  
  if (!isAllowed) {
    return false;
  }
  
  // Check file extension
  const ext = path.extname(normalizedPath).toLowerCase();
  if (BLOCKED_EXTENSIONS.includes(ext)) {
    return false;
  }
  
  return true;
};

export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
};

export const ensureDirectoryExists = async (dirPath: string): Promise<void> => {
  if (!validateFilePath(dirPath)) {
    throw new Error('Invalid directory path');
  }
  
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true, mode: 0o755 });
  }
};

export const secureFileDelete = async (filePath: string): Promise<void> => {
  if (!validateFilePath(filePath)) {
    throw new Error('Invalid file path');
  }
  
  try {
    await fs.unlink(filePath);
  } catch (error) {
    // File might not exist, which is fine
    if ((error as any).code !== 'ENOENT') {
      throw error;
    }
  }
};