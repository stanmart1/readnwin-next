# Book Management System Rebuild Guide

## Phase 1: System Architecture Setup

### Task 1: Database Schema Design
- [ ] Create database tables for books with fields:
  - `id`, `title`, `author`, `isbn`, `type` (physical/ebook)
  - `file_path`, `cover_image`, `metadata`, `created_at`, `updated_at`
- [ ] Create metadata table for e-books:
  - `book_id`, `page_count`, `estimated_read_time`, `file_size`, `format`
- [ ] Create table of contents table:
  - `book_id`, `chapter_title`, `chapter_order`, `page_number`, `html_anchor`

### Task 2: File Storage Structure
- [ ] Create secure local storage directory structure within `/app/media_root/`:
  ```
  /app/media_root/
    /books/
      /physical/
      /ebooks/
        /epub/
        /html/
      /covers/
      /temp/ (for processing)
  ```
- [ ] Implement file naming convention using UUID or hash-based names
- [ ] Set up proper file permissions and access controls within existing media root

## Phase 2: File Upload System

### Task 3: Physical Book Entry
- [ ] Create form for manual physical book entry
- [ ] Include fields: title, author, ISBN, description, cover image upload
- [ ] Implement image processing for cover photos
- [ ] Add validation for required fields

### Task 4: E-book Upload Handler
- [ ] Create file upload endpoint with validation
- [ ] Restrict file types to `.epub` and `.html` only
- [ ] Implement file size limits (e.g., max 50MB)
- [ ] Add file type verification beyond extension checking
- [ ] Create temporary storage during processing

## Phase 3: E-book Processing Engine

### Task 5: EPUB Parser
- [ ] Install/implement EPUB parsing library
- [ ] Extract basic metadata (title, author, publisher, publication date)
- [ ] Parse `content.opf` file for book structure
- [ ] Extract table of contents from `toc.ncx` or navigation document
- [ ] Count total pages/sections
- [ ] Extract cover image if available

### Task 6: HTML Book Parser
- [ ] Create HTML parser for standalone HTML books
- [ ] Extract metadata from `<head>` section and meta tags
- [ ] Parse heading tags (h1, h2, h3) to generate table of contents
- [ ] Count estimated pages based on content length
- [ ] Handle embedded images and assets

### Task 7: Metadata Calculation
- [ ] Implement reading time estimation algorithm:
  - Average reading speed: 200-250 words per minute
  - Count total words in text content
  - Calculate estimated reading time
- [ ] Implement page count estimation for HTML books
- [ ] Extract and store chapter information with proper ordering

## Phase 4: Secure Storage System

### Task 8: File Processing and Storage
- [ ] Create file processor to handle uploaded e-books
- [ ] Extract and store content while maintaining structure
- [ ] Generate secure file names to prevent direct access
- [ ] Store original file and processed content separately
- [ ] Implement file integrity checks (checksums)

### Task 9: Security Implementation
- [ ] Implement access token system for file serving
- [ ] Create middleware to verify user permissions before file access
- [ ] Set up secure file serving with proper headers
- [ ] Implement session-based access control
- [ ] Add rate limiting for file downloads

## Phase 5: User Library Interface Integration

### Task 10: Extend Existing Library Display
- [ ] Add support for displaying e-book metadata (pages, reading time)
- [ ] Update book cards/items to show book type (physical/e-book)
- [ ] Modify existing filtering to include physical/e-book distinction
- [ ] Add table of contents preview in book details view

### Task 11: Enhance Existing Book Management
- [ ] Extend edit functionality to handle e-book metadata
- [ ] Update deletion process to handle e-book file cleanup
- [ ] Ensure existing organization features work with both book types

## Phase 6: E-book Reader Integration

### Task 12: Enhance Existing Read Button
- [ ] Modify existing read button to handle both physical and e-book types
- [ ] Add logic to generate temporary access tokens for e-books when clicked
- [ ] Implement secure file serving endpoint for e-book reader access
- [ ] Update button behavior to open e-book reader for digital books
- [ ] Keep existing functionality for physical book tracking

### Task 13: E-reader Assessment and Implementation
- [ ] **First: Check if e-reader already exists in the system**
- [ ] If e-reader exists:
  - [ ] Assess current e-reader capabilities (supported formats, features)
  - [ ] Enhance existing e-reader to support EPUB and HTML formats if not already supported
  - [ ] Integrate table of contents navigation with existing reader
  - [ ] Add metadata display (page count, reading time) to existing interface
- [ ] If e-reader doesn't exist:
  - [ ] Integrate or build new e-book reader component
  - [ ] Support EPUB rendering with proper styling
  - [ ] Handle HTML book display with navigation
  - [ ] Implement table of contents navigation
  - [ ] Add reading position saving/resuming

### Task 14: E-reader Feature Enhancement
- [ ] **Assessment first**: Check which features already exist in current e-reader
- [ ] Enhance or add missing features as needed:
  - [ ] Font size adjustment
  - [ ] Page/chapter navigation  
  - [ ] Bookmark functionality
  - [ ] Reading progress indicator
  - [ ] Night mode/themes support

## Phase 7: Testing and Optimization

### Task 15: Testing Suite
- [ ] Create unit tests for file upload and parsing
- [ ] Test metadata extraction accuracy
- [ ] Verify security measures work correctly
- [ ] Test reader functionality across different book formats
- [ ] Performance testing with large files

### Task 16: Error Handling and Validation
- [ ] Implement comprehensive error handling for file processing
- [ ] Add user feedback for upload progress and errors
- [ ] Create fallback mechanisms for corrupted files
- [ ] Add logging for debugging and monitoring

### Task 17: Performance Optimization
- [ ] Optimize file processing for large e-books
- [ ] Implement caching for frequently accessed books
- [ ] Optimize database queries for library display
- [ ] Add progressive loading for large libraries

## Phase 8: Deployment and Documentation

### Task 18: Production Setup
- [ ] Configure production file storage with backups
- [ ] Set up proper server security measures
- [ ] Implement monitoring and logging
- [ ] Create deployment scripts

### Task 19: Documentation
- [ ] Create user guide for uploading and managing books
- [ ] Document API endpoints for future development
- [ ] Create troubleshooting guide
- [ ] Document system requirements and setup

## Key Technical Considerations

- **File Security**: Never serve files directly; always validate access through application logic
- **Metadata Extraction**: Use reliable libraries like `epub.js` for EPUB or custom HTML parsers
- **Storage Efficiency**: Consider compression for text content while maintaining readability
- **User Experience**: Provide clear feedback during upload and processing steps
- **Scalability**: Design database and file structure to handle growing libraries efficiently