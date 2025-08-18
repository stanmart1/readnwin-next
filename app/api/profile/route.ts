import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/utils/database';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user profile data
    const profileResult = await query(`
      SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.bio,
        u.profile_image,
        u.is_student,
        u.created_at,
        u.last_login,
        si.school_name,
        si.matriculation_number,
        si.department,
        si.course
      FROM users u
      LEFT JOIN student_info si ON u.id = si.user_id
      WHERE u.id = $1
    `, [session.user.id]);

    if (profileResult.rows.length === 0) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const user = profileResult.rows[0];
    
    // Fetch reading statistics
    const statsResult = await query(`
      SELECT 
        COUNT(DISTINCT rb.book_id) as total_books_read,
        SUM(rb.pages_read) as total_pages_read,
        SUM(rb.reading_time) as total_hours_read,
        AVG(rb.rating) as average_rating
      FROM reading_progress rb
      WHERE rb.user_id = $1 AND rb.completed = true
    `, [session.user.id]);

    const stats = statsResult.rows[0] || {
      total_books_read: 0,
      total_pages_read: 0,
      total_hours_read: 0,
      average_rating: 0
    };

    // Fetch current reading streak
    const streakResult = await query(`
      SELECT COUNT(*) as current_streak
      FROM (
        SELECT DISTINCT DATE(rp.read_date) as read_date
        FROM reading_progress rp
        WHERE rp.user_id = $1
        ORDER BY rp.read_date DESC
        LIMIT 30
      ) recent_reads
      WHERE read_date >= CURRENT_DATE - INTERVAL '30 days'
    `, [session.user.id]);

    const currentStreak = streakResult.rows[0]?.current_streak || 0;

    // Fetch favorite genres
    const genresResult = await query(`
      SELECT g.name as genre, COUNT(*) as count
      FROM reading_progress rp
      JOIN books b ON rp.book_id = b.id
      JOIN book_genres bg ON b.id = bg.book_id
      JOIN genres g ON bg.genre_id = g.id
      WHERE rp.user_id = $1 AND rp.completed = true
      GROUP BY g.name
      ORDER BY count DESC
      LIMIT 5
    `, [session.user.id]);

    const favoriteGenres = genresResult.rows.map(row => row.genre);

    const profile = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      bio: user.bio,
      profileImage: user.profile_image,
      isStudent: user.is_student,
      studentInfo: user.is_student ? {
        schoolName: user.school_name,
        matriculationNumber: user.matriculation_number,
        department: user.department,
        course: user.course
      } : null,
      readingStats: {
        totalBooksRead: parseInt(stats.total_books_read) || 0,
        totalPagesRead: parseInt(stats.total_pages_read) || 0,
        totalHoursRead: parseFloat(stats.total_hours_read) || 0,
        currentStreak: parseInt(currentStreak),
        averageRating: parseFloat(stats.average_rating) || 0,
        favoriteGenres
      },
      createdAt: user.created_at,
      lastLogin: user.last_login
    };

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      bio,
      profileImage,
      isStudent,
      studentInfo
    } = body;

    // Update basic user information
    await query(`
      UPDATE users 
      SET 
        first_name = $1,
        last_name = $2,
        bio = $3,
        profile_image = $4,
        is_student = $5,
        updated_at = NOW()
      WHERE id = $6
    `, [firstName, lastName, bio, profileImage, isStudent, session.user.id]);

    // Handle student information
    if (isStudent && studentInfo) {
      // Check if student info already exists
      const existingStudentInfo = await query(`
        SELECT id FROM student_info WHERE user_id = $1
      `, [session.user.id]);

      if (existingStudentInfo.rows.length > 0) {
        // Update existing student info
        await query(`
          UPDATE student_info 
          SET 
            school_name = $1,
            matriculation_number = $2,
            department = $3,
            course = $4,
            updated_at = NOW()
          WHERE user_id = $5
        `, [
          studentInfo.schoolName,
          studentInfo.matriculationNumber,
          studentInfo.department,
          studentInfo.course,
          session.user.id
        ]);
      } else {
        // Insert new student info
        await query(`
          INSERT INTO student_info (
            user_id, school_name, matriculation_number, department, course, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        `, [
          session.user.id,
          studentInfo.schoolName,
          studentInfo.matriculationNumber,
          studentInfo.department,
          studentInfo.course
        ]);
      }
    } else if (!isStudent) {
      // Remove student info if user is no longer a student
      await query(`
        DELETE FROM student_info WHERE user_id = $1
      `, [session.user.id]);
    }

    // Fetch updated profile
    const updatedProfileResult = await query(`
      SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.bio,
        u.profile_image,
        u.is_student,
        u.created_at,
        u.last_login,
        si.school_name,
        si.matriculation_number,
        si.department,
        si.course
      FROM users u
      LEFT JOIN student_info si ON u.id = si.user_id
      WHERE u.id = $1
    `, [session.user.id]);

    const user = updatedProfileResult.rows[0];

    const profile = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      bio: user.bio,
      profileImage: user.profile_image,
      isStudent: user.is_student,
      studentInfo: user.is_student ? {
        schoolName: user.school_name,
        matriculationNumber: user.matriculation_number,
        department: user.department,
        course: user.course
      } : null,
      createdAt: user.created_at,
      lastLogin: user.last_login
    };

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 