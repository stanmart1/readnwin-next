import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { secureQuery } from '@/utils/secure-database';

export async function GET(
  request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    const debug = {
      bookId: params.bookId,
      hasSession: !!session,
      userId: session?.user?.id || null,
      timestamp: new Date().toISOString()
    };

    // Check if book exists
    try {
      const bookResult = await secureQuery(`
        SELECT id, title, created_by, price, visibility
        FROM books WHERE id = $1
      `, [parseInt(params.bookId)]);
      
      debug.bookExists = bookResult.rows.length > 0;
      debug.bookData = bookResult.rows[0] || null;
    } catch (error) {
      debug.bookQueryError = error.message;
    }

    // Check user library access if user is logged in
    if (session?.user?.id) {
      try {
        const libraryResult = await secureQuery(`
          SELECT * FROM user_library 
          WHERE user_id = $1 AND book_id = $2
        `, [session.user.id, parseInt(params.bookId)]);
        
        debug.hasLibraryAccess = libraryResult.rows.length > 0;
        debug.libraryData = libraryResult.rows[0] || null;
      } catch (error) {
        debug.libraryQueryError = error.message;
      }
    }

    return NextResponse.json(debug);

  } catch (error) {
    return NextResponse.json({ 
      error: error.message,
      bookId: params.bookId,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}