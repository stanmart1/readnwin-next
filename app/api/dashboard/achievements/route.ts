import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/utils/database';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('❌ No session or user ID found in achievements API');
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to access this resource' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);

    // Get user's earned achievements
    const userAchievementsResult = await query(`
      SELECT 
        ua.id,
        ua.achievement_type,
        a.title,
        a.description,
        a.icon,
        ua.earned_at
      FROM user_achievements ua
      JOIN achievements a ON ua.achievement_type = a.achievement_type
      WHERE ua.user_id = $1
      ORDER BY ua.earned_at DESC
    `, [userId]);

    // Get all available achievements to show unearned ones
    const allAchievementsResult = await query(`
      SELECT 
        achievement_type,
        title,
        description,
        icon,
        condition_type,
        condition_value
      FROM achievements
      ORDER BY priority DESC, title ASC
    `);

    const earnedAchievements = userAchievementsResult.rows;
    const allAchievements = allAchievementsResult.rows;

    // Create a map of earned achievements
    const earnedMap = new Map(earnedAchievements.map(achievement => [achievement.achievement_type, achievement]));

    // Combine earned and unearned achievements
    const achievements = allAchievements.map(achievement => ({
      id: earnedMap.get(achievement.achievement_type)?.id || null,
      achievement_type: achievement.achievement_type,
      title: achievement.title,
      description: achievement.description,
      icon: achievement.icon,
      earned_at: earnedMap.get(achievement.achievement_type)?.earned_at || null
    }));

    return NextResponse.json({
      success: true,
      achievements
    });

  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('❌ No session or user ID found in achievements POST API');
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to access this resource' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);
    const body = await request.json();
    const { achievement_type } = body;

    if (!achievement_type) {
      return NextResponse.json(
        { error: 'Missing required field: achievement_type' },
        { status: 400 }
      );
    }

    // Check if achievement already exists
    const existingResult = await query(`
      SELECT id FROM user_achievements 
      WHERE user_id = $1 AND achievement_type = $2
    `, [userId, achievement_type]);

    if (existingResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'Achievement already earned' },
        { status: 409 }
      );
    }

    // Get achievement details
    const achievementResult = await query(`
      SELECT title, description, icon FROM achievements 
      WHERE achievement_type = $1
    `, [achievement_type]);

    if (achievementResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Achievement not found' },
        { status: 404 }
      );
    }

    // Create user achievement
    const result = await query(`
      INSERT INTO user_achievements (user_id, achievement_type)
      VALUES ($1, $2)
      RETURNING *
    `, [userId, achievement_type]);

    // Add activity record
    await query(`
      INSERT INTO user_activity (user_id, activity_type, title, description)
      VALUES ($1, 'achievement', $2, $3)
    `, [userId, `Earned: ${achievementResult.rows[0].title}`, achievementResult.rows[0].description]);

    return NextResponse.json({
      success: true,
      achievement: result.rows[0]
    });

  } catch (error) {
    console.error('Error creating achievement:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 