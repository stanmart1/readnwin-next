import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/utils/database';
import { sendWelcomeEmail } from '@/utils/email';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.log('❌ No session or user email found in send welcome email API');
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to access this resource' },
        { status: 401 }
      );
    }

    // Get user details
    const result = await query(`
      SELECT id, email, first_name, last_name, last_login, welcome_email_sent
      FROM users 
      WHERE email = $1
    `, [session.user.email]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = result.rows[0];

    // Check if welcome email has already been sent
    if (user.welcome_email_sent) {
      return NextResponse.json(
        { message: 'Welcome email already sent' },
        { status: 200 }
      );
    }

    // Send welcome email
    try {
      const userName = `${user.first_name} ${user.last_name}`;
      const emailResult = await sendWelcomeEmail(user.email, userName, user.id);
      
      if (emailResult.success) {
        // Mark welcome email as sent
        await query(`
          UPDATE users 
          SET welcome_email_sent = true,
              updated_at = NOW()
          WHERE id = $1
        `, [user.id]);

        return NextResponse.json({
          message: 'Welcome email sent successfully'
        });
      } else {
        console.error('Failed to send welcome email:', emailResult.error);
        return NextResponse.json(
          { error: 'Failed to send welcome email' },
          { status: 500 }
        );
      }
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      return NextResponse.json(
        { error: 'Failed to send welcome email' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Send welcome email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 