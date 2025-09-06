import { sanitizeInput, sanitizeQuery, validateId, sanitizeHtml } from '@/lib/security';
import { requireAdmin, requirePermission } from '@/middleware/auth';
import logger from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/utils/database';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin(request);
  } catch (error) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!validateId(params.id)) {
    return Response.json({ error: 'Invalid ID format' }, { status: 400 });
  }
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['admin', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const libraryId = parseInt(params.id);
    if (isNaN(libraryId)) {
      return NextResponse.json({ error: 'Invalid library ID' }, { status: 400 });
    }

    const deleteQuery = `
      DELETE FROM user_library 
      WHERE id = $1
      RETURNING id
    `;
    const result = await query(deleteQuery, [libraryId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Library assignment not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Assignment removed successfully' });

  } catch (error) {
    logger.error('Error removing assignment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}