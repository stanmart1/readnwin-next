import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/utils/database';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Create goals table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS user_goals (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        goal_type VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        target_value INTEGER NOT NULL,
        current_value INTEGER DEFAULT 0,
        target_date DATE,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default goals if none exist
    const existingGoals = await query('SELECT COUNT(*) FROM user_goals WHERE user_id = $1', [userId]);
    
    if (parseInt(existingGoals.rows[0].count) === 0) {
      await query(`
        INSERT INTO user_goals (user_id, goal_type, title, description, target_value, target_date)
        VALUES 
          ($1, 'books_per_month', 'Read 2 Books This Month', 'Complete reading 2 books by the end of this month', 2, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day'),
          ($1, 'reading_time', 'Read 10 Hours This Month', 'Spend 10 hours reading this month', 36000, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day'),
          ($1, 'yearly_books', 'Read 24 Books This Year', 'Complete reading 24 books by the end of this year', 24, DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year' - INTERVAL '1 day')
      `, [userId]);
    }

    // Get user goals
    const result = await query(`
      SELECT 
        id,
        goal_type,
        title,
        description,
        target_value,
        current_value,
        target_date,
        status,
        created_at,
        updated_at
      FROM user_goals
      WHERE user_id = $1 AND status = 'active'
      ORDER BY created_at DESC
    `, [userId]);

    const goals = result.rows.map(row => ({
      id: row.id,
      goalType: row.goal_type,
      title: row.title,
      description: row.description,
      targetValue: row.target_value,
      currentValue: row.current_value,
      targetDate: row.target_date,
      status: row.status,
      progress: row.target_value > 0 ? Math.min(100, (row.current_value / row.target_value) * 100) : 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    return NextResponse.json({
      success: true,
      goals
    });

  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json({ 
      success: true,
      error: 'Failed to fetch goals',
      goals: []
    }, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { goalType, title, description, targetValue, targetDate } = await request.json();

    const result = await query(`
      INSERT INTO user_goals (user_id, goal_type, title, description, target_value, target_date)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [userId, goalType, title, description, targetValue, targetDate]);

    const goal = result.rows[0];

    return NextResponse.json({
      success: true,
      goal: {
        id: goal.id,
        goalType: goal.goal_type,
        title: goal.title,
        description: goal.description,
        targetValue: goal.target_value,
        currentValue: goal.current_value,
        targetDate: goal.target_date,
        status: goal.status,
        progress: 0
      }
    });

  } catch (error) {
    console.error('Error creating goal:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to create goal'
    }, { status: 500 });
  }
}