import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { rbacService } from '@/utils/rbac-service';
import { sendEmailVerification, sendWelcomeEmail } from '@/utils/email';
import { query } from '@/utils/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { first_name, last_name, email, username, password } = body;

    // Validate required fields
    if (!first_name || !last_name || !email || !username || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Validate username
    if (username.length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await rbacService.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Check if double opt-in is enabled
    const doubleOptInResult = await query(`
      SELECT setting_value FROM system_settings 
      WHERE setting_key = 'registration_double_opt_in'
    `);
    
    const doubleOptInEnabled = doubleOptInResult.rows[0]?.setting_value === 'true';

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate verification token if double opt-in is enabled
    let verificationToken: string | undefined = undefined;
    let verificationExpires: Date | undefined = undefined;
    let initialStatus = 'active';
    
    if (doubleOptInEnabled) {
      verificationToken = crypto.randomBytes(32).toString('hex');
      verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      initialStatus = 'pending';
    }

    // Create user
    const user = await rbacService.createUser({
      first_name,
      last_name,
      email,
      username,
      password_hash: passwordHash,
      status: initialStatus,
      email_verified: !doubleOptInEnabled,
      email_verification_token: verificationToken,
      email_verification_expires: verificationExpires
    });

    // Assign default reader role
    const readerRole = await rbacService.getRoleByName('reader');
    if (readerRole) {
      await rbacService.assignRoleToUser(user.id, readerRole.id)
    }

    // Log audit event
    await rbacService.logAuditEvent(
      undefined, // System event
      'user.register',
      'users',
      user.id,
      { email, username, first_name, last_name, double_opt_in: doubleOptInEnabled },
      request.headers.get('x-forwarded-for') || request.ip || undefined,
      request.headers.get('user-agent') || undefined
    );

    // Send appropriate email based on double opt-in setting
    try {
      const userName = `${first_name} ${last_name}`;
      
      if (doubleOptInEnabled && verificationToken) {
        // Send verification email
        await sendEmailVerification(email, verificationToken, userName);
      } else {
        // Send welcome email directly with user ID for token generation
        await sendWelcomeEmail(email, userName, user.id);
      }
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // Don't fail registration if email fails
    }

    // Return user data for auto-login if double opt-in is disabled
    if (!doubleOptInEnabled) {
      return NextResponse.json({
        success: true,
        message: 'Registration successful! Welcome to ReadnWin!',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
          email_verified: user.email_verified,
          status: user.status
        },
        requiresVerification: false,
        autoLogin: true // Flag to indicate auto-login should be performed
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        email_verified: user.email_verified,
        status: user.status
      },
      requiresVerification: true,
      autoLogin: false
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 