const path = require('path');

// Input sanitization
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim()
    .replace(/[<>"'&]/g, (match) => {
      const entities = { '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '&': '&amp;' };
      return entities[match];
    });
};

const sanitizeHtml = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
};

// Path traversal protection
const sanitizePath = (filePath) => {
  if (!filePath) return null;
  
  const normalized = path.normalize(filePath);
  if (normalized.includes('..') || normalized.startsWith('/')) {
    throw new Error('Invalid file path');
  }
  
  return normalized;
};

const validateFilePath = (filePath, allowedDir = 'uploads') => {
  const sanitized = sanitizePath(filePath);
  const resolved = path.resolve(allowedDir, sanitized);
  const allowedPath = path.resolve(allowedDir);
  
  if (!resolved.startsWith(allowedPath)) {
    throw new Error('Path traversal detected');
  }
  
  return resolved;
};

// MongoDB query sanitization
const sanitizeQuery = (query) => {
  if (typeof query !== 'object' || query === null) return query;
  
  const sanitized = {};
  for (const [key, value] of Object.entries(query)) {
    if (key.startsWith('$')) continue; // Remove MongoDB operators
    if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeQuery(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

// Safe PostgreSQL integer ID validation
const validateId = (id) => {
  if (!id) return false;
  const numId = parseInt(id);
  return !isNaN(numId) && numId > 0;
};

// Log sanitization
const sanitizeLog = (message, data = {}) => {
  const cleanMessage = typeof message === 'string' 
    ? message.replace(/[\r\n\t]/g, ' ').substring(0, 500)
    : String(message);
    
  const cleanData = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      cleanData[key] = value.replace(/[\r\n\t]/g, ' ').substring(0, 100);
    } else {
      cleanData[key] = value;
    }
  }
  
  return { message: cleanMessage, data: cleanData };
};

// Input validation schemas
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validateUrl = (url) => /^https?:\/\/.+/.test(url);
const validateAlphanumeric = (str) => /^[a-zA-Z0-9]+$/.test(str);

module.exports = {
  sanitizeInput,
  sanitizeHtml,
  sanitizePath,
  validateFilePath,
  sanitizeQuery,
  validateId,
  sanitizeLog,
  validateEmail,
  validateUrl,
  validateAlphanumeric
};