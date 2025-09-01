import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rbacService } from '@/utils/rbac-service';
import { ecommerceService } from '@/utils/ecommerce-service';
import { query } from '@/utils/database';
import { sanitizeLogInput, validateInput } from '@/utils/security-safe';

// Helper function for processing individual bulk assignments
async function processBulkAssignment(userId: number, bookId: number, reason: string, adminId: string, books: any[]) {
  try {
    // Check if book already exists in user's library
    const existingBook = await query(`
      SELECT id FROM user_library 
      WHERE user_id = $1 AND book_id = $2
    `, [userId, bookId]);

    if (existingBook.rows.length > 0) {
      return {
        type: 'skipped',
        data: {
          userId,
          bookId,
          reason: 'Book already in library'
        }
      };
    }

    // Add book to user's library
    const success = await ecommerceService.addToLibrary(userId, bookId);

    if (success) {
      // Log the admin action with sanitized data
      const bookTitle = books.find(b => b.id === bookId)?.title || 'Unknown';
      await query(`
        INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, admin_user_id)
        VALUES ($1, 'library_bulk_add', 'user_library', $2, $3, $4)
      `, [userId, bookId, JSON.stringify({ 
        bookTitle: sanitizeLogInput(bookTitle),
        reason: reason,
        assignedBy: adminId,
        bulkOperation: true
      }), adminId]);

      return {
        type: 'success',
        data: {
          userId,
          bookId,
          message: 'Book added successfully'
        }
      };
    } else {
      return {
        type: 'failed',
        data: {
          userId,
          bookId,
          error: 'Failed to add book'
        }
      };
    }
  } catch (error) {
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = session.user.role === 'admin' || session.user.role === 'super_admin';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { userIds, bookIds, reason } = await request.json();

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: 'User IDs array is required' }, { status: 400 });
    }

    if (!bookIds || !Array.isArray(bookIds) || bookIds.length === 0) {
      return NextResponse.json({ error: 'Book IDs array is required' }, { status: 400 });
    }

    // Verify all books exist (both physical and ebook)
    const bookResult = await query(`
      SELECT id, title, format FROM books 
      WHERE id = ANY($1)
    `, [bookIds]);

    if (bookResult.rows.length !== bookIds.length) {
      return NextResponse.json({ 
        error: 'Some books not found' 
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

    // Sanitize reason input
    const sanitizedReason = sanitizeLogInput(reason || 'Bulk admin assignment');
    
    // Use batch processing for better performance
    const batchPromises = [];
    
    for (const userId of userIds) {
      for (const bookId of bookIds) {
        batchPromises.push(
          processBulkAssignment(userId, bookId, sanitizedReason, session.user.id, bookResult.rows)
            .then(result => {
              if (result.type === 'success') {
                results.success.push(result.data);
              } else if (result.type === 'skipped') {
                results.skipped.push(result.data);
              } else {
                results.failed.push(result.data);
              }
            })
            .catch(error => {
              results.failed.push({
                userId,
                bookId,
                error: error.message || 'Database error'
              });
            })
        );
      }
    }
    
    // Process all assignments concurrently
    await Promise.all(batchPromises);

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