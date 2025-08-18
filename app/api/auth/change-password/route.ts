import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/utils/database';
import bcrypt from 'bcryptjs';
import { sendPasswordChangedEmail } from '@/utils/email';
import { getNigeriaTime, formatForDisplay } from '@/utils/timezone';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Get current user with password hash
    const userResult = await query(
      'SELECT id, email, first_name, last_name, password_hash FROM users WHERE id = $1',
      [session.user.id]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Update password in database
    await query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newPasswordHash, user.id]
    );

    // Log audit event
    await query(`
      INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      user.id,
      'user.password_changed',
      'users',
      user.id,
      JSON.stringify({ password_changed: true }),
      request.headers.get('x-forwarded-for') || request.ip,
      request.headers.get('user-agent')
    ]);

    // Send password changed email notification
    try {
      const userName = `${user.first_name} ${user.last_name}`;
      const changedAt = formatForDisplay(getNigeriaTime());
      const ipAddress = request.headers.get('x-forwarded-for') || request.ip || 'Unknown';
      
      await sendPasswordChangedEmail(user.email, userName, changedAt, ipAddress);
    } catch (emailError) {
      console.error('Failed to send password changed email:', emailError);
      // Don't fail the password change if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 