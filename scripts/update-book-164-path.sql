-- Fix book 164 file path to point to existing Moby Dick file
-- Run this SQL command to fix the issue

-- First, check current state
SELECT id, title, ebook_file_url FROM books WHERE id = 164;

-- Update to point to existing Moby Dick file (use the most recent one)
UPDATE books 
SET ebook_file_url = '/api/ebooks/164/154_moby-dick.epub'
WHERE id = 164;

-- Verify the update
SELECT id, title, ebook_file_url FROM books WHERE id = 164;