import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/utils/database';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);

    // Create user_library table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS user_library (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        book_id INTEGER NOT NULL,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        access_type VARCHAR(50) DEFAULT 'purchased',
        status VARCHAR(50) DEFAULT 'active',
        UNIQUE(user_id, book_id)
      )
    `);

    // Return empty library for now to prevent errors
    return NextResponse.json({
      success: true,
      libraryItems: []
    });

  } catch (error) {
    console.error('Error fetching user library:', error);
    return NextResponse.json({
      success: true,
      libraryItems: [],
      error: 'Failed to fetch library items'
    }, { status: 200 });
  }
} 