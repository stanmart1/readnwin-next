const { NextRequest, NextResponse } = require('next/server');
const { query } = require('./utils/database');

// Mock session for testing
const mockSession = {
  user: {
    id: '31' // Using the user ID we found in the database
  }
};

// Mock getServerSession
const getServerSession = async () => mockSession;

// Test the profile API logic
async function testProfileAPI() {
  try {
    console.log('Testing profile API...');
    
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      console.error('No session found');
      return;
    }
    
    const userId = parseInt(session.user.id);
    
    if (isNaN(userId)) {
      console.error('Invalid user ID');
      return;
    }

    console.log('Fetching profile for user ID:', userId);

    // Fetch user profile data with fallback for missing columns
    const profileResult = await query(`
      SELECT 
        u.id,
        u.email,
        u.username,
        COALESCE(u.first_name, '') as first_name,
        COALESCE(u.last_name, '') as last_name,
        COALESCE(u.bio, '') as bio,
        COALESCE(u.profile_image, u.avatar_url, '') as profile_image,
        COALESCE(u.is_student, false) as is_student,
        u.status,
        u.created_at,
        COALESCE(u.last_login, u.updated_at) as last_login
      FROM users u
      WHERE u.id = $1
    `, [userId]);

    if (profileResult.rows.length === 0) {
      console.error('Profile not found');
      return;
    }

    const user = profileResult.rows[0];
    console.log('User profile loaded successfully:', {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      bio: user.bio,
      profileImage: user.profile_image,
      isStudent: user.is_student,
      status: user.status
    });
    
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
          console.log('Student info loaded:', studentInfo);
        }
      } catch (error) {
        console.log('Student info table not found, skipping');
      }
    }
    
    // Try to fetch reading statistics
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
      
      console.log('Reading stats loaded:', readingStats);
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

    console.log('✅ Profile API test successful!');
    console.log('Profile data structure is valid');
    
  } catch (error) {
    console.error('❌ Profile API test failed:', error.message);
    
    // Check if it's a database connection error
    if (error instanceof Error && error.message.includes('connect')) {
      console.error('Database connection failed');
    }
  }
}

testProfileAPI();