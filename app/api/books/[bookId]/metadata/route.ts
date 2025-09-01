import { NextRequest, NextResponse } from 'next/server';
import { secureQuery } from '@/utils/secure-database';

export async function GET(
  request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    const bookId = parseInt(params.bookId);

    if (isNaN(bookId)) {
      return NextResponse.json({ error: 'Invalid book ID' }, { status: 400 });
    }

    // Get book metadata
    const bookResult = await secureQuery(`
      SELECT b.id, b.title, b.file_format, bf.preserve_structure, bf.original_format, bf.asset_count
      FROM books b
      LEFT JOIN book_files bf ON b.id = bf.book_id AND bf.file_type = 'ebook'
      WHERE b.id = $1
    `, [bookId]);

    if (bookResult.rows.length === 0) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const book = bookResult.rows[0];

    // Get structure based on format
    let structure = null;
    if (book.preserve_structure) {
      if (book.file_format === 'epub') {
        const epubResult = await secureQuery(`
          SELECT spine_order, manifest, navigation, title, creator
          FROM epub_structure WHERE book_id = $1
        `, [bookId]);
        
        if (epubResult.rows.length > 0) {
          structure = {
            type: 'epub',
            ...epubResult.rows[0]
          };
        }
      } else if (book.file_format === 'html') {
        const htmlResult = await secureQuery(`
          SELECT chapter_structure, asset_files, title, author
          FROM html_structure WHERE book_id = $1
        `, [bookId]);
        
        if (htmlResult.rows.length > 0) {
          structure = {
            type: 'html',
            ...htmlResult.rows[0]
          };
        }
      }
    }

    return NextResponse.json({
      id: book.id,
      title: book.title,
      format: book.file_format,
      originalFormat: book.original_format,
      preservedStructure: book.preserve_structure,
      assetCount: book.asset_count,
      structure
    });

  } catch (error) {
    console.error('Metadata API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}