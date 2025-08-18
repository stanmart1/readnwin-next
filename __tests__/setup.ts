// Test setup file for Jest
import '@testing-library/jest-dom';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock file system operations
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn(),
  unlinkSync: jest.fn(),
  rmdirSync: jest.fn(),
}));

// Mock path operations
jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')),
  extname: jest.fn((filename) => {
    const match = filename.match(/\.[^.]*$/);
    return match ? match[0] : '';
  }),
  basename: jest.fn((filename, ext) => {
    const name = filename.split('/').pop() || filename;
    return ext ? name.replace(ext, '') : name;
  }),
}));

// Mock crypto operations
jest.mock('crypto', () => ({
  createHash: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn(() => 'mock-hash'),
  })),
}));

// Mock epubjs
jest.mock('epubjs', () => ({
  Book: jest.fn(() => ({
    open: jest.fn().mockResolvedValue(undefined),
    getMetadata: jest.fn().mockResolvedValue({
      title: 'Test Book',
      creator: 'Test Author',
      language: 'en',
      publisher: 'Test Publisher',
      date: '2023-01-01',
      identifier: '978-1234567890',
      description: 'Test description'
    }),
    getSpine: jest.fn().mockResolvedValue({
      items: [
        { id: 'chapter1', href: 'chapter1.xhtml', title: 'Chapter 1' },
        { id: 'chapter2', href: 'chapter2.xhtml', title: 'Chapter 2' }
      ]
    }),
    getToc: jest.fn().mockResolvedValue([
      { id: 'chapter1', title: 'Chapter 1', level: 1 },
      { id: 'chapter2', title: 'Chapter 2', level: 1 }
    ]),
    getChapter: jest.fn().mockResolvedValue('<h1>Chapter Content</h1><p>This is chapter content.</p>')
  })),
  Zip: jest.fn(() => ({
    loadAsync: jest.fn(),
    file: jest.fn(),
  })),
}));

// Global test utilities
global.createMockFile = (name: string, content: string, type: string) => {
  return new File([content], name, { type });
};

global.createMockEpubFile = (title = 'Test Book') => {
  const content = `<?xml version="1.0"?>
    <package xmlns="http://www.idpf.org/2007/opf" version="3.0">
      <metadata>
        <dc:title>${title}</dc:title>
        <dc:creator>Test Author</dc:creator>
      </metadata>
    </package>`;
  return global.createMockFile('test.epub', content, 'application/epub+zip');
};

global.createMockHtmlFile = () => {
  const content = `
    <!DOCTYPE html>
    <html>
    <head><title>Test HTML Book</title></head>
    <body><h1>Chapter 1</h1><p>Content</p></body>
    </html>`;
  return global.createMockFile('test.html', content, 'text/html');
};
