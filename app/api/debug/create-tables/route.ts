import { NextResponse } from 'next/server';
import { query } from '@/utils/database';

export async function POST() {
  try {
    // Create missing tables
    const createQueries = [
      `CREATE TABLE IF NOT EXISTS reading_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        book_id INTEGER NOT NULL,
        progress_percentage DECIMAL(5,2) DEFAULT 0,
        current_chapter_id VARCHAR(255),
        current_position INTEGER DEFAULT 0,
        pages_read INTEGER DEFAULT 0,
        total_reading_time_seconds INTEGER DEFAULT 0,
        last_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, book_id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS reading_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        book_id INTEGER NOT NULL,
        session_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        session_end TIMESTAMP NULL,
        duration_seconds INTEGER DEFAULT 0,
        pages_read INTEGER DEFAULT 0,
        progress_start DECIMAL(5,2) DEFAULT 0,
        progress_end DECIMAL(5,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS user_library (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        book_id INTEGER NOT NULL,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        access_type VARCHAR(50) DEFAULT 'purchased',
        status VARCHAR(50) DEFAULT 'active',
        UNIQUE(user_id, book_id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS book_reviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        book_id INTEGER NOT NULL,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        review_text TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, book_id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS user_goals (
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
      )`,
      
      `CREATE TABLE IF NOT EXISTS user_activities (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        activity_type VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS user_notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info',
        is_read BOOLEAN DEFAULT FALSE,
        action_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read_at TIMESTAMP NULL
      )`
    ];

    const results = [];
    for (const createQuery of createQueries) {
      try {
        await query(createQuery);
        results.push({ query: createQuery.split('(')[0], success: true });
      } catch (error) {
        results.push({ query: createQuery.split('(')[0], success: false, error: error.message });
      }
    }

    // Create indexes
    const indexQueries = [
      'CREATE INDEX IF NOT EXISTS idx_reading_progress_user_id ON reading_progress(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_reading_sessions_user_id ON reading_sessions(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_user_library_user_id ON user_library(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_book_reviews_user_id ON book_reviews(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON user_goals(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id)'
    ];

    for (const indexQuery of indexQueries) {
      try {
        await query(indexQuery);
      } catch (error) {
        console.log('Index creation error (may already exist):', error.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Tables created successfully',
      results
    });

  } catch (error) {
    console.error('Error creating tables:', error);
    return NextResponse.json({ 
      error: 'Failed to create tables',
      details: error.message 
    }, { status: 500 });
  }
}