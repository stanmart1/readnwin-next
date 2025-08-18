# Book Upload System

## Overview

The book upload system has been configured to store book data in the database and book files in a dedicated local directory.

## Directory Structure

```
readnwinnext2/
├── book-files/           # Dedicated directory for book files
│   ├── [timestamp]_[random]_[filename].epub
│   ├── [timestamp]_[random]_[filename].pdf
│   └── [timestamp]_[random]_[filename].mobi
├── public/uploads/       # Other uploads (covers, etc.)
└── app/api/
    └── book-files/       # API route to serve book files
```

## How It Works

### 1. Book Data Storage
- Book metadata (title, author, price, etc.) is stored in the database
- Cover images are stored in `public/uploads/covers/`
- Book files are stored in `book-files/` directory

### 2. File Upload Process
When a book is uploaded through the admin panel:

1. **Form Data Processing**: The system processes the form data including book metadata and files
2. **File Validation**: 
   - Cover images: JPG, PNG, WebP (max 5MB)
   - Book files: EPUB, PDF, MOBI (max 50MB)
3. **File Storage**:
   - Cover images → `public/uploads/covers/`
   - Book files → `book-files/`
4. **Database Storage**: Book metadata and file paths are saved to the database
5. **Content Parsing**: Book content is parsed for reading features

### 3. File Access
- **Cover images**: Accessible via `/uploads/covers/[filename]`
- **Book files**: Accessible via `/book-files/[filename]`

### 4. E-Reader Integration
When a user opens a book in the e-reader:

1. **Content Request**: E-reader calls `/api/books/[bookId]/content`
2. **Database Check**: API checks if content is already stored in database
3. **File Parsing**: If no content, API parses book file from `book-files/` directory
4. **Content Storage**: Parsed content is stored in database for future use
5. **Content Delivery**: Content is returned to e-reader for display

## API Routes

### Book Upload
- **POST** `/api/admin/books` - Upload new book with files

### Book File Serving
- **GET** `/api/book-files/[...path]` - Serve book files with proper content types

### Book Content API
- **GET** `/api/books/[bookId]/content` - Get book content for e-reader (parses files if needed)

## File Naming Convention

Book files are named using the following pattern:
```
[timestamp]_[random_string]_[original_filename]
```

Example: `1692187200000_abc123_my_book.epub`

## Security Features

1. **Directory Traversal Protection**: Prevents access to files outside the book-files directory
2. **File Type Validation**: Only allows specific file types
3. **File Size Limits**: Prevents oversized file uploads
4. **Authentication Required**: Only authenticated admin users can upload books

## Configuration

### Next.js Rewrites
The system uses Next.js rewrites to serve files:
```javascript
{
  source: '/book-files/:path*',
  destination: '/api/book-files/:path*',
}
```

### File Upload Service
The `FileUploadService` class handles:
- File validation
- Secure file storage
- Path generation
- File existence verification

## Testing

Run the test script to verify the setup:
```bash
node test-book-upload.js
```

## Usage

### For Admins (Book Upload)
1. **Admin Panel**: Go to the admin panel and create a new book
2. **File Upload**: Upload cover image and book file
3. **Database**: Book data is automatically saved to the database
4. **File Storage**: Book file is saved to the `book-files/` directory
5. **Access**: Book files are accessible via `/book-files/[filename]`

### For Users (Reading Books)
1. **Library**: User accesses their book library
2. **Book Selection**: User clicks on a book to read
3. **E-Reader**: E-reader opens and loads book content
4. **Content Loading**: System checks database for stored content
5. **File Parsing**: If needed, system parses book file from `book-files/`
6. **Reading**: User can read the book with full e-reader features

## Supported File Types

### Cover Images
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)

### Book Files
- EPUB (.epub)
- PDF (.pdf)
- MOBI (.mobi)

## File Size Limits

- **Cover Images**: 5MB maximum
- **Book Files**: 50MB maximum

## Error Handling

The system includes comprehensive error handling for:
- File upload failures
- Database connection issues
- Permission errors
- Invalid file types
- File size violations
- Directory creation failures

## Monitoring

The system logs all upload activities with detailed information:
- File details (name, size, type)
- Upload progress
- Success/failure status
- Error details when applicable 