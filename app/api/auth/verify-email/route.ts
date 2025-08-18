import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/utils/database';
import { rbacService } from '@/utils/rbac-service';
import { sendEmailConfirmation } from '@/utils/email';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Find user with this verification token
    const result = await query(`
      SELECT id, email, first_name, last_name, email_verification_expires, email_verified
      FROM users 
      WHERE email_verification_token = $1
    `, [token]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid verification token' },
        { status: 400 }
      );
    }

    const user = result.rows[0];

    // Check if email is already verified
    if (user.email_verified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (user.email_verification_expires && new Date() > new Date(user.email_verification_expires)) {
      return NextResponse.json(
        { error: 'Verification token has expired' },
        { status: 400 }
      );
    }

    // Verify the email
    await query(`
      UPDATE users 
      SET email_verified = true, 
          email_verification_token = NULL, 
          email_verification_expires = NULL,
          status = 'active',
          updated_at = NOW()
      WHERE id = $1
    `, [user.id]);

    // Log audit event
    try {
      await rbacService.logAuditEvent(
        undefined, // System event
        'user.email_verified',
        'users',
        user.id,
        { email: user.email },
        request.headers.get('x-forwarded-for') || request.ip || undefined,
        request.headers.get('user-agent') || undefined
      );
    } catch (auditError) {
      console.error('Failed to log audit event:', auditError);
      // Don't fail verification if audit logging fails
    }

    // Send confirmation email (non-blocking)
    try {
      const userName = `${user.first_name} ${user.last_name}`;
      await sendEmailConfirmation(user.email, userName);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail verification if confirmation email fails
      // This could be due to email gateway configuration issues
    }

    // Redirect to login page with success message
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('message', 'Email verified successfully! You can now sign in.');
    
    return NextResponse.redirect(loginUrl);

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 