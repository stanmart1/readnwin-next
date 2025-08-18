import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rbacService } from '@/utils/rbac-service';
import { ecommerceService } from '@/utils/ecommerce-service';
import { query } from '@/utils/database';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permission for managing user libraries
    const hasPermission = await rbacService.hasPermission(
      parseInt(session.user.id),
      'users.manage_roles'
    );
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { userIds, bookIds, reason } = await request.json();

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: 'User IDs array is required' }, { status: 400 });
    }

    if (!bookIds || !Array.isArray(bookIds) || bookIds.length === 0) {
      return NextResponse.json({ error: 'Book IDs array is required' }, { status: 400 });
    }

    // Verify all books exist and are ebooks
    const bookResult = await query(`
      SELECT id, title, format FROM books 
      WHERE id = ANY($1) AND format = 'ebook'
    `, [bookIds]);

    if (bookResult.rows.length !== bookIds.length) {
      return NextResponse.json({ 
        error: 'Some books not found or are not ebooks' 
      }, { status: 400 });
    }

    // Verify all users exist
    const userResult = await query(`
      SELECT id, email, username FROM users 
      WHERE id = ANY($1)
    `, [userIds]);

    if (userResult.rows.length !== userIds.length) {
      return NextResponse.json({ 
        error: 'Some users not found' 
      }, { status: 400 });
    }

    const results = {
      success: [] as Array<{ userId: number; bookId: number; message: string }>,
      failed: [] as Array<{ userId: number; bookId: number; error: string }>,
      skipped: [] as Array<{ userId: number; bookId: number; reason: string }>
    };

    // Process each user-book combination
    for (const userId of userIds) {
      for (const bookId of bookIds) {
        try {
          // Check if book already exists in user's library
          const existingBook = await query(`
            SELECT id FROM user_library 
            WHERE user_id = $1 AND book_id = $2
          `, [userId, bookId]);

          if (existingBook.rows.length > 0) {
            results.skipped.push({
              userId,
              bookId,
              reason: 'Book already in library'
            });
            continue;
          }

          // Add book to user's library
          const success = await ecommerceService.addToLibrary(userId, bookId);

          if (success) {
            // Log the admin action
            await query(`
              INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, admin_user_id)
              VALUES ($1, 'library_bulk_add', 'user_library', $2, $3, $4)
            `, [userId, bookId, JSON.stringify({ 
              bookTitle: bookResult.rows.find(b => b.id === bookId)?.title,
              reason: reason || 'Bulk admin assignment',
              assignedBy: session.user.id,
              bulkOperation: true
            }), session.user.id]);

            results.success.push({
              userId,
              bookId,
              message: 'Book added successfully'
            });
          } else {
            results.failed.push({
              userId,
              bookId,
              error: 'Failed to add book'
            });
          }
        } catch (error) {
          results.failed.push({
            userId,
            bookId,
            error: 'Database error'
          });
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      results,
      summary: {
        total: userIds.length * bookIds.length,
        successful: results.success.length,
        failed: results.failed.length,
        skipped: results.skipped.length
      }
    });

  } catch (error) {
    console.error('Error in bulk library assignment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 