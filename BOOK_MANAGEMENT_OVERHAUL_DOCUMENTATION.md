# Book Management System Overhaul Documentation

## 🎯 **Overview**

This document outlines the complete overhaul of the book management system to support both Physical and E-book uploads with proper EPUB/HTML parsing, metadata extraction, and secure content storage.

## 🚀 **New Features**

### **1. Enhanced Book Types Support**
- **Physical Books**: Traditional printed books with inventory tracking
- **E-Books**: Digital books in EPUB, HTML, and PDF formats
- **Both Formats**: Books available in both physical and digital formats

### **2. Advanced File Processing**
- **EPUB Parsing**: Full EPUB file parsing with metadata extraction
- **HTML Processing**: HTML file parsing with chapter detection
- **Metadata Extraction**: Automatic extraction of title, author, word count, reading time, etc.
- **Table of Contents**: Automatic generation from book structure

### **3. Secure Content Storage**
- **Local File Storage**: Secure file storage with hash verification
- **Content Parsing**: Parsed content stored in database for fast access
- **Access Control**: Token-based access control for book content
- **Progress Tracking**: User reading progress and analytics

### **4. Enhanced E-Reader**
- **Chapter Navigation**: Smooth chapter-by-chapter navigation
- **Reading Progress**: Real-time progress tracking
- **Multiple Themes**: Light, dark, and sepia reading themes
- **Keyboard Shortcuts**: Arrow keys for navigation, Ctrl+T for TOC

## 📊 **Database Schema Changes**

### **New Tables Created**

#### **book_content**
Stores parsed book content and metadata:
```sql
- id: Primary key
- book_id: Reference to books table
- content_type: 'epub', 'html', 'markdown'
- content_structure: JSON with TOC, spine, manifest
- content_files: JSON with file paths and metadata
- word_count: Total word count
- estimated_reading_time: Reading time in minutes
- page_count: Estimated page count
- chapter_count: Number of chapters
- language: Book language
```

#### **book_chapters**
Stores individual chapter information:
```sql
- id: Primary key
- book_id: Reference to books table
- chapter_number: Chapter order
- chapter_title: Chapter title
- chapter_content: Chapter HTML content
- word_count: Chapter word count
- reading_time: Chapter reading time
- chapter_metadata: Additional metadata
```

#### **book_files**
Tracks uploaded files:
```sql
- id: Primary key
- book_id: Reference to books table
- file_type: 'cover', 'ebook', 'sample', 'processed'
- original_filename: Original file name
- stored_filename: Secure stored filename
- file_path: File system path
- file_size: File size in bytes
- file_hash: SHA256 hash for verification
- is_processed: Processing status
```

#### **book_access_logs**
Tracks user access for security:
```sql
- id: Primary key
- book_id: Reference to books table
- user_id: Reference to users table
- access_type: 'read', 'download', 'preview'
- ip_address: User IP address
- user_agent: Browser information
- access_timestamp: Access time
- session_duration: Reading session duration
- pages_read: Pages read in session
```

#### **book_parsing_queue**
Manages background parsing:
```sql
- id: Primary key
- book_id: Reference to books table
- priority: Processing priority (1-10)
- status: 'queued', 'processing', 'completed', 'failed'
- error_message: Error details if failed
- retry_count: Number of retry attempts
- started_at: Processing start time
- completed_at: Processing completion time
```

### **Enhanced Books Table**
New columns added to existing books table:
```sql
- book_type: 'physical', 'ebook', 'both'
- file_format: 'epub', 'html', 'pdf'
- file_size: File size in bytes
- file_hash: SHA256 hash
- parsing_status: 'pending', 'processing', 'completed', 'failed'
- parsing_error: Error message if parsing failed
- metadata_extracted_at: When metadata was extracted
- security_token: Access token for content
- access_control: JSON with access settings
```

## 🔧 **New Components**

### **1. EnhancedBookParser**
Location: `utils/enhanced-book-parser.ts`

**Features:**
- EPUB file parsing with JSZip
- HTML file parsing with chapter detection
- Metadata extraction (title, author, word count, etc.)
- Table of contents generation
- Content cleaning and structure preservation

**Key Methods:**
```typescript
async parseBook(bookId: number, filePath: string, fileFormat: 'epub' | 'html'): Promise<ParsedBookContent>
private async parseEPUB(filePath: string): Promise<ParsedBookContent>
private async parseHTML(filePath: string): Promise<ParsedBookContent>
private async storeParsedContent(bookId: number, parsedContent: ParsedBookContent, contentType: string)
```

### **2. EnhancedFileUploadService**
Location: `utils/enhanced-file-upload-service.ts`

**Features:**
- Secure file upload with validation
- Duplicate file detection
- File hash verification
- Background parsing queue management
- Access token generation

**Key Methods:**
```typescript
async uploadBookFile(file: File, bookId: number, fileType: 'cover' | 'ebook' | 'sample'): Promise<FileUploadResult>
async generateAccessToken(bookId: number, userId: number): Promise<string>
async validateAccessToken(bookId: number, token: string): Promise<boolean>
```

### **3. EnhancedEbookReader**
Location: `app/reading/components/EnhancedEbookReader.tsx`

**Features:**
- Chapter-by-chapter navigation
- Reading progress tracking
- Multiple theme support
- Keyboard shortcuts
- Table of contents sidebar
- Reading statistics display

**Keyboard Shortcuts:**
- `Arrow Left/Right`: Navigate chapters
- `Ctrl+T`: Toggle table of contents
- `Escape`: Close TOC

### **4. EnhancedBookUploadForm**
Location: `components/admin/EnhancedBookUploadForm.tsx`

**Features:**
- Drag-and-drop file upload
- Real-time file validation
- Progress tracking
- Comprehensive form validation
- Support for multiple book types

## 📡 **API Endpoints**

### **1. Book Upload API**
**Endpoint:** `POST /api/admin/books`

**Features:**
- Multi-stage upload process
- File validation and processing
- Background content parsing
- Comprehensive error handling

**Request Format:**
```typescript
FormData {
  title: string;
  author_id: string;
  category_id: string;
  price: string;
  book_type: 'physical' | 'ebook' | 'both';
  cover_image: File;
  ebook_file?: File;
  // ... other fields
}
```

**Response Format:**
```typescript
{
  success: boolean;
  book: {
    id: number;
    title: string;
    bookType: string;
    parsing_status: string;
    word_count: number;
    estimated_reading_time: number;
    // ... other fields
  };
  parsingInfo: {
    status: string;
    wordCount: number;
    estimatedReadingTime: number;
    pageCount: number;
    chapterCount: number;
  };
}
```

### **2. Book Content API**
**Endpoint:** `GET /api/books/[bookId]/content`

**Features:**
- Secure content access
- Chapter-based content delivery
- Reading progress tracking
- Access logging

**Response Format:**
```typescript
{
  success: boolean;
  book: {
    id: string;
    title: string;
    bookType: string;
    contentType: string;
    wordCount: number;
    estimatedReadingTime: number;
    pageCount: number;
    chapterCount: number;
    contentStructure: any;
  };
  chapters: Array<{
    id: string;
    number: number;
    title: string;
    content: string;
    wordCount: number;
    estimatedReadingTime: number;
    metadata: Record<string, any>;
  }>;
  metadata: {
    totalChapters: number;
    totalWordCount: number;
    totalReadingTime: number;
  };
}
```

## 🔒 **Security Features**

### **1. File Security**
- **Secure Filenames**: Generated with timestamp and random suffix
- **Hash Verification**: SHA256 hash verification for file integrity
- **Access Tokens**: Token-based access control for book content
- **Duplicate Detection**: Prevents duplicate file uploads

### **2. Content Security**
- **Access Logging**: All book access is logged with IP and user agent
- **User Verification**: Content access requires valid user session
- **Library Verification**: Users can only access books in their library
- **Rate Limiting**: Built-in protection against abuse

### **3. Data Protection**
- **Encrypted Storage**: Sensitive data encrypted at rest
- **Secure Transmission**: HTTPS for all API communications
- **Input Validation**: Comprehensive validation of all inputs
- **SQL Injection Protection**: Parameterized queries throughout

## 📈 **Performance Optimizations**

### **1. Content Caching**
- **Parsed Content**: Book content parsed once and stored in database
- **Chapter Caching**: Individual chapters cached for fast access
- **Metadata Caching**: Book metadata cached for quick retrieval

### **2. Background Processing**
- **Async Parsing**: Book parsing happens in background
- **Queue Management**: Parsing queue with priority and retry logic
- **Progress Tracking**: Real-time parsing progress updates

### **3. Database Optimization**
- **Indexed Queries**: Optimized database indexes for fast queries
- **Connection Pooling**: Efficient database connection management
- **Query Optimization**: Optimized SQL queries for performance

## 🚀 **Usage Instructions**

### **1. Uploading a Book**

#### **For E-Books:**
1. Navigate to Admin Panel → Book Management
2. Click "Add New Book"
3. Fill in basic information (title, author, category, price)
4. Select "E-Book" as book type
5. Upload cover image (JPEG, PNG, WebP up to 10MB)
6. Upload e-book file (EPUB, HTML, PDF up to 100MB)
7. Fill in additional information (ISBN, description, etc.)
8. Click "Upload Book"

#### **For Physical Books:**
1. Follow same steps as e-books
2. Select "Physical Book" as book type
3. Skip e-book file upload
4. Enable inventory tracking if needed
5. Set stock quantity and low stock threshold

### **2. Reading a Book**

#### **Accessing the E-Reader:**
1. Navigate to User Library
2. Click "Read" on any e-book
3. The enhanced e-reader will open with parsed content
4. Use navigation controls or keyboard shortcuts
5. Reading progress is automatically saved

#### **E-Reader Features:**
- **Chapter Navigation**: Use arrow buttons or arrow keys
- **Table of Contents**: Click TOC button or press Ctrl+T
- **Reading Progress**: Progress bar shows completion percentage
- **Reading Stats**: View word count and estimated reading time
- **Theme Switching**: Choose light, dark, or sepia theme

### **3. Managing Books**

#### **Admin Features:**
- **Book Upload**: Enhanced upload form with validation
- **Content Processing**: Automatic parsing and metadata extraction
- **File Management**: Secure file storage and access control
- **User Access**: Monitor user reading activity and progress

#### **User Features:**
- **Library Access**: View and manage purchased books
- **Reading Progress**: Track reading progress across books
- **Content Access**: Secure access to book content
- **Reading Analytics**: View reading statistics and history

## 🔧 **Configuration**

### **1. File Storage**
Configure file storage paths in environment variables:
```env
BOOK_FILES_DIR=/app/book-files  # Production
BOOK_FILES_DIR=./book-files     # Development
```

### **2. File Size Limits**
Configure maximum file sizes:
```typescript
const maxSizes = {
  cover: 10 * 1024 * 1024,    // 10MB
  ebook: 100 * 1024 * 1024,   // 100MB
  sample: 50 * 1024 * 1024    // 50MB
};
```

### **3. Supported Formats**
Configure supported file formats:
```typescript
const allowedTypes = {
  cover: ['image/jpeg', 'image/png', 'image/webp'],
  ebook: ['application/epub+zip', 'text/html', 'application/pdf']
};
```

## 🐛 **Troubleshooting**

### **1. Upload Issues**
- **File Size**: Ensure file is within size limits
- **File Format**: Check file format is supported
- **Network**: Verify stable internet connection
- **Permissions**: Ensure proper file permissions

### **2. Parsing Issues**
- **EPUB Format**: Ensure EPUB file is valid and not corrupted
- **HTML Structure**: Check HTML has proper structure for chapter detection
- **File Encoding**: Ensure files use UTF-8 encoding
- **Server Resources**: Check server has sufficient memory for parsing

### **3. Reading Issues**
- **Content Loading**: Check if book parsing completed successfully
- **Access Rights**: Verify user has access to the book
- **Browser Compatibility**: Ensure modern browser is used
- **JavaScript**: Enable JavaScript for e-reader functionality

## 📝 **Migration Notes**

### **1. Database Migration**
Run the new migration to update database schema:
```sql
-- Run migration: 003_overhaul_book_system.sql
```

### **2. File Migration**
Existing book files will need to be re-uploaded or migrated to new system.

### **3. Content Migration**
Existing book content will need to be re-parsed using new parser.

## 🔮 **Future Enhancements**

### **1. Planned Features**
- **PDF Support**: Enhanced PDF parsing and display
- **Audio Books**: Support for audio book formats
- **Annotations**: User highlights and notes
- **Social Features**: Reading groups and discussions
- **Advanced Analytics**: Detailed reading analytics

### **2. Performance Improvements**
- **CDN Integration**: Content delivery network for faster access
- **Caching Layer**: Redis caching for improved performance
- **Compression**: File compression for reduced storage
- **Progressive Loading**: Lazy loading for large books

### **3. Security Enhancements**
- **DRM Support**: Digital rights management
- **Watermarking**: Content watermarking for protection
- **Access Control**: More granular access permissions
- **Audit Logging**: Enhanced security logging

## 📞 **Support**

For technical support or questions about the new book management system:

1. **Documentation**: Check this documentation first
2. **Logs**: Review server logs for error details
3. **Database**: Check database for parsing status and errors
4. **Files**: Verify file uploads and storage paths

The new system provides a robust foundation for managing both physical and digital books with advanced features for content processing, secure storage, and enhanced reading experience.
