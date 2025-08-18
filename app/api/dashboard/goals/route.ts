import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ecommerceService } from '@/utils/ecommerce-service';
import { query } from '@/utils/database';

export async function GET(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    console.log('🔍 Dashboard goals API - Session:', session ? 'Present' : 'Not present');
    console.log('🔍 Dashboard goals API - Session user:', session?.user);
    
    if (!session?.user?.id) {
      console.log('❌ No session or user ID found in goals API');
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to access this resource' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);

    // Fetch user's reading goals
    const goals = await ecommerceService.getReadingGoals(userId);

    // Get current progress for each goal type
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    // Calculate current values for different goal types
    const goalProgress = await Promise.all(
      goals.map(async (goal) => {
        let currentValue = 0;
        
        switch (goal.goal_type) {
          case 'annual_books':
            // Count books completed this year
            const annualBooksResult = await query(`
              SELECT COUNT(DISTINCT book_id) as count
              FROM reading_progress
              WHERE user_id = $1 
                AND progress_percentage >= 100
                AND EXTRACT(YEAR FROM last_read_at) = $2
            `, [userId, currentYear]);
            currentValue = parseInt(annualBooksResult.rows[0]?.count || '0');
            break;
            
          case 'monthly_pages':
            // Count pages read this month
            const monthlyPagesResult = await query(`
              SELECT COALESCE(SUM(current_page), 0) as pages
              FROM reading_progress
              WHERE user_id = $1 
                AND EXTRACT(YEAR FROM last_read_at) = $2
                AND EXTRACT(MONTH FROM last_read_at) = $3
                AND current_page > 0
            `, [userId, currentYear, currentMonth]);
            currentValue = parseInt(monthlyPagesResult.rows[0]?.pages || '0');
            break;
            
          case 'reading_streak':
            // Calculate current reading streak
            const streakResult = await query(`
              WITH reading_days AS (
                SELECT DISTINCT DATE(last_read_at) as read_date
                FROM reading_progress
                WHERE user_id = $1 AND last_read_at >= CURRENT_DATE - INTERVAL '365 days'
                ORDER BY read_date DESC
              ),
              streak_calc AS (
                SELECT 
                  read_date,
                  ROW_NUMBER() OVER (ORDER BY read_date DESC) as rn,
                  read_date + (ROW_NUMBER() OVER (ORDER BY read_date DESC) - 1) * INTERVAL '1 day' as expected_date
                FROM reading_days
              )
              SELECT COUNT(*) as streak
              FROM streak_calc
              WHERE read_date = expected_date
              AND read_date >= CURRENT_DATE - INTERVAL '365 days'
            `, [userId]);
            currentValue = parseInt(streakResult.rows[0]?.streak || '0');
            break;
            
          case 'daily_hours':
            // Calculate average daily reading hours this month
            const dailyHoursResult = await query(`
              SELECT COALESCE(AVG(daily_hours), 0) as avg_hours
              FROM (
                SELECT DATE(last_read_at) as read_date,
                       SUM(current_page * 0.016) as daily_hours
                FROM reading_progress
                WHERE user_id = $1 
                  AND EXTRACT(YEAR FROM last_read_at) = $2
                  AND EXTRACT(MONTH FROM last_read_at) = $3
                GROUP BY DATE(last_read_at)
              ) daily_stats
            `, [userId, currentYear, currentMonth]);
            currentValue = Math.round(parseFloat(dailyHoursResult.rows[0]?.avg_hours || '0') * 100) / 100;
            break;
        }
        
        return {
          ...goal,
          current_value: currentValue,
          progress_percentage: Math.min((currentValue / goal.target_value) * 100, 100)
        };
      })
    );

    return NextResponse.json({
      success: true,
      goals: goalProgress
    });

  } catch (error) {
    console.error('Error fetching reading goals:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log('❌ No session or user ID found in goals POST API');
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to access this resource' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);
    const body = await request.json();
    const { goal_type, target_value, start_date, end_date } = body;

    if (!goal_type || !target_value || !start_date || !end_date) {
      return NextResponse.json(
        { error: 'Missing required fields: goal_type, target_value, start_date, end_date' },
        { status: 400 }
      );
    }

    // Create new reading goal
    const goal = await ecommerceService.createReadingGoal(userId, {
      goal_type,
      target_value,
      start_date,
      end_date
    });

    return NextResponse.json({
      success: true,
      goal
    });

  } catch (error) {
    console.error('Error creating reading goal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 

 