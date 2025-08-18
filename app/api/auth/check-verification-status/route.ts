import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/utils/database';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user with this email
    const result = await query(`
      SELECT email_verified, status
      FROM users 
      WHERE email = $1
    `, [email]);

    if (result.rows.length === 0) {
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        { needsVerification: false },
        { status: 200 }
      );
    }

    const user = result.rows[0];

    // Return whether the user needs verification
    const needsVerification = !user.email_verified && user.status === 'pending';

    return NextResponse.json({
      needsVerification
    });

  } catch (error) {
    console.error('Check verification status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 