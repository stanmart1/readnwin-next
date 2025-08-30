import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { secureQuery } from '@/utils/secure-database';
import { BookStorage } from '@/utils/book-storage';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['admin', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all books without file records
    const booksResult = await secureQuery(`
      SELECT b.id, b.title
      FROM books b
      LEFT JOIN book_files bf ON b.id = bf.book_id AND bf.file_type = 'ebook'
      WHERE bf.id IS NULL
      ORDER BY b.id
    `);

    let initialized = 0;
    
    for (const book of booksResult.rows) {
      try {
        await BookStorage.createDefaultContent(book.id, book.title);
        initialized++;
      } catch (error) {
        console.error(`Failed to initialize storage for book ${book.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Initialized storage for ${initialized} books`,
      total: booksResult.rows.length
    });

  } catch (error) {
    console.error('Error initializing book storage:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}