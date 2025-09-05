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
    
    const userId = parseInt(session.user.id);
    
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Fetch user profile data
    const profileResult = await query(`
      SELECT 
        u.id,
        u.email,
        COALESCE(u.username, u.email) as username,
        COALESCE(u.first_name, '') as first_name,
        COALESCE(u.last_name, '') as last_name,
        COALESCE(u.bio, '') as bio,
        COALESCE(u.profile_image, '') as profile_image,
        COALESCE(u.is_student, false) as is_student,
        COALESCE(u.status, 'active') as status,
        u.created_at,
        COALESCE(u.last_login, u.updated_at) as last_login
      FROM users u
      WHERE u.id = $1
    `, [userId]);

    if (profileResult.rows.length === 0) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const user = profileResult.rows[0];
    
    // Try to get student info if user is a student
    let studentInfo = null;
    if (user.is_student) {
      try {
        const studentResult = await query(`
          SELECT school_name, matriculation_number, department, course
          FROM student_info 
          WHERE user_id = $1
        `, [userId]);
        
        if (studentResult.rows.length > 0) {
          const student = studentResult.rows[0];
          studentInfo = {
            schoolName: student.school_name,
            matriculationNumber: student.matriculation_number,
            department: student.department,
            course: student.course
          };
        }
      } catch (error) {
        console.log('Student info table not found, skipping');
      }
    }
    
    // Default reading statistics
    let readingStats = {
      totalBooksRead: 0,
      totalPagesRead: 0,
      totalHoursRead: 0,
      currentStreak: 0,
      averageRating: 0,
      favoriteGenres: []
    };
    
    try {
      // Check if reading_progress table exists and get stats
      const statsResult = await query(`
        SELECT 
          COUNT(DISTINCT rp.book_id) as total_books_read,
          COALESCE(SUM(rp.pages_read), 0) as total_pages_read,
          COALESCE(SUM(rp.reading_time), 0) as total_hours_read,
          COALESCE(AVG(rp.rating), 0) as average_rating
        FROM reading_progress rp
        WHERE rp.user_id = $1 AND rp.completed = true
      `, [userId]);

      if (statsResult.rows.length > 0) {
        const stats = statsResult.rows[0];
        readingStats.totalBooksRead = parseInt(stats.total_books_read) || 0;
        readingStats.totalPagesRead = parseInt(stats.total_pages_read) || 0;
        readingStats.totalHoursRead = parseFloat(stats.total_hours_read) || 0;
        readingStats.averageRating = parseFloat(stats.average_rating) || 0;
      }
    } catch (error) {
      console.log('Reading statistics tables not found, using defaults');
    }

    const profile = {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      bio: user.bio,
      profileImage: user.profile_image,
      isStudent: user.is_student,
      studentInfo: studentInfo,
      status: user.status,
      readingStats: readingStats,
      createdAt: user.created_at,
      lastLogin: user.last_login
    };

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
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
    await pool.query(`
      UPDATE users 
      SET 
        first_name = $1,
        last_name = $2,
        bio = $3,
        profile_image = $4,
        is_student = $5,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
    `, [firstName, lastName, bio, profileImage, isStudent, session.user.id]);

    // Handle student information if table exists
    if (isStudent && studentInfo) {
      try {
        // Check if student info already exists
        const existingStudentInfo = await pool.query(`
          SELECT id FROM student_info WHERE user_id = $1
        `, [session.user.id]);

        if (existingStudentInfo.rows.length > 0) {
          // Update existing student info
          await pool.query(`
            UPDATE student_info 
            SET 
              school_name = $1,
              matriculation_number = $2,
              department = $3,
              course = $4,
              updated_at = CURRENT_TIMESTAMP
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
          await pool.query(`
            INSERT INTO student_info (
              user_id, school_name, matriculation_number, department, course
            ) VALUES ($1, $2, $3, $4, $5)
          `, [
            session.user.id,
            studentInfo.schoolName,
            studentInfo.matriculationNumber,
            studentInfo.department,
            studentInfo.course
          ]);
        }
      } catch (error) {
        console.log('Student info table not available, skipping student data update');
      }
    }

    return NextResponse.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}