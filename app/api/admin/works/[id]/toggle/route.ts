import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rbacService } from '@/utils/rbac-service';
import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: false // Disable SSL for this database connection
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTH_UNAUTHORIZED',
        message: 'Please log in to toggle work status'
      }, { status: 401 });
    }

    // Check permission
    const hasPermission = await rbacService.hasPermission(
      parseInt(session.user.id),
      'content.update'
    );
    
    if (!hasPermission) {
      return NextResponse.json({ 
        error: 'Insufficient permissions',
        code: 'PERMISSION_DENIED',
        message: 'You do not have permission to update works'
      }, { status: 403 });
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid work ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { is_active } = body;

    if (typeof is_active !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'is_active must be a boolean' },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    // Check if work exists
    const existingWork = await client.query('SELECT id FROM works WHERE id = $1', [id]);
    if (existingWork.rows.length === 0) {
      client.release();
      return NextResponse.json(
        { success: false, error: 'Work not found' },
        { status: 404 }
      );
    }

    // Update active status
    const result = await client.query(`
      UPDATE works 
      SET is_active = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, title, is_active, updated_at
    `, [is_active, id]);
    
    client.release();

    return NextResponse.json({
      success: true,
      work: result.rows[0],
      message: `Work ${is_active ? 'activated' : 'deactivated'} successfully`
    });

  } catch (error) {
    console.error('Error toggling work status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update work status' },
      { status: 500 }
    );
  }
} 