import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/utils/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('❌ No session or user ID found in goals [id] GET API');
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to access this resource' },
        { status: 401 }
      );
    }

    const goalId = parseInt(params.id);
    if (isNaN(goalId)) {
      return NextResponse.json({ error: 'Invalid goal ID' }, { status: 400 });
    }

    const userId = parseInt(session.user.id);
    const result = await query(`
      SELECT * FROM reading_goals
      WHERE id = $1 AND user_id = $2
    `, [goalId, userId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      goal: result.rows[0]
    });

  } catch (error) {
    console.error('Error fetching goal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('❌ No session or user ID found in goals [id] PUT API');
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to access this resource' },
        { status: 401 }
      );
    }

    const goalId = parseInt(params.id);
    if (isNaN(goalId)) {
      return NextResponse.json({ error: 'Invalid goal ID' }, { status: 400 });
    }

    const userId = parseInt(session.user.id);
    const body = await request.json();
    const { goal_type, target_value, start_date, end_date } = body;

    // Validate required fields
    if (!goal_type || !target_value || !start_date || !end_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update the goal
    const result = await query(`
      UPDATE reading_goals
      SET 
        goal_type = $1,
        target_value = $2,
        start_date = $3,
        end_date = $4,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5 AND user_id = $6
      RETURNING *
    `, [goal_type, target_value, start_date, end_date, goalId, userId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      goal: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating goal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('❌ No session or user ID found in goals [id] DELETE API');
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to access this resource' },
        { status: 401 }
      );
    }

    const goalId = parseInt(params.id);
    if (isNaN(goalId)) {
      return NextResponse.json({ error: 'Invalid goal ID' }, { status: 400 });
    }

    const userId = parseInt(session.user.id);
    const result = await query(`
      DELETE FROM reading_goals
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `, [goalId, userId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Goal deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting goal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 