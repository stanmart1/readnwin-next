import { NextResponse } from 'next/server';
import { query } from '@/utils/database';

export async function POST() {
  try {
    await query(`
      INSERT INTO book_files (book_id, file_type, original_filename, stored_filename, file_path, file_size, mime_type, file_format, processing_status, file_hash)
      VALUES (143, 'ebook', 'moby-dick.epub', '143_moby-dick_1756592996329_w36kntaoruc.epub', '/storage/books/143/143_moby-dick_1756592996329_w36kntaoruc.epub', 628090, 'application/epub+zip', 'epub', 'completed', 'hash143')
      ON CONFLICT (book_id, file_type) DO UPDATE SET
        stored_filename = EXCLUDED.stored_filename,
        file_format = EXCLUDED.file_format,
        processing_status = EXCLUDED.processing_status
    `);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}