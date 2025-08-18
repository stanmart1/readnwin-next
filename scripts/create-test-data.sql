-- Test Data Setup for Book Storage System Testing
-- Run this script to create test data for comprehensive testing

-- 1. Create test book record
INSERT INTO books (
    id, title, author_id, category_id, price, book_type, status, 
    description, language, created_by, created_at
) VALUES (
    999, 'Test EPUB Book', 1, 1, 9.99, 'ebook', 'published',
    'A test book for storage system validation', 'en', 1, NOW()
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    updated_at = NOW();

-- 2. Create test user library entry (if user exists)
INSERT INTO user_library (user_id, book_id, added_at, purchase_date)
VALUES (1, 999, NOW(), NOW())
ON CONFLICT (user_id, book_id) DO NOTHING;

-- 3. Create test book file record (if book_files table exists)
INSERT INTO book_files (
    book_id, file_type, original_filename, stored_filename, 
    file_path, file_size, mime_type, file_hash
) VALUES (
    999, 'ebook', 'test-book.epub', 'test-book.epub',
    '/media_root/books/999/test-book.epub', 1024, 'application/epub+zip',
    'test-hash-123'
) ON CONFLICT (book_id, file_type) DO UPDATE SET
    updated_at = NOW();

-- 4. Verify test data
SELECT 'Test data created successfully' as status;

-- 5. Show test book details
SELECT 
    b.id,
    b.title,
    b.book_type,
    b.ebook_file_url,
    b.cover_image_url,
    ul.user_id as in_user_library
FROM books b
LEFT JOIN user_library ul ON b.id = ul.book_id AND ul.user_id = 1
WHERE b.id = 999;
