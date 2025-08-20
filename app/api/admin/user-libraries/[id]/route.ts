import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { query } from '@/utils/database';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      DELETE FROM user_libraries 
      WHERE id = $1
      RETURNING id
    `;
    const result = await query(deleteQuery, [libraryId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Library assignment not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Assignment removed successfully' });

  } catch (error) {
    console.error('Error removing assignment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}