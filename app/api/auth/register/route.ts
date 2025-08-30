import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { rbacService } from '@/utils/rbac-service';
import { sendEmailVerification, sendWelcomeEmail } from '@/utils/email';
import { secureQuery } from '@/utils/secure-database';
import { validateInput, sanitizeInput } from '@/utils/security-middleware';
import { authRateLimiter } from '@/utils/rate-limiter';
import { handleApiError } from '@/utils/error-handler';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = authRateLimiter.isAllowed(ip);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': '900' } }
      );
    }

    const body = await request.json();
    const { first_name, last_name, email, username, password } = body;

    // Input validation
    const validation = validateInput(body, {
      first_name: { required: true, type: 'string', maxLength: 50, pattern: /^[a-zA-Z\s]+$/ },
      last_name: { required: true, type: 'string', maxLength: 50, pattern: /^[a-zA-Z\s]+$/ },
      email: { required: true, type: 'string', maxLength: 255, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
      username: { required: true, type: 'string', maxLength: 30, pattern: /^[a-zA-Z0-9_]+$/ },
      password: { required: true, type: 'string', maxLength: 128 }
    });

    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    // Additional password strength validation
    if (password.length < 8 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters with uppercase, lowercase, and number' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedData = {
      first_name: sanitizeInput(first_name),
      last_name: sanitizeInput(last_name),
      email: sanitizeInput(email.toLowerCase()),
      username: sanitizeInput(username.toLowerCase())
    };

    // Check if user already exists
    const existingUser = await rbacService.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Check if double opt-in is enabled
    const doubleOptInResult = await secureQuery(`
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

    // Create user with sanitized data
    const user = await rbacService.createUser({
      first_name: sanitizedData.first_name,
      last_name: sanitizedData.last_name,
      email: sanitizedData.email,
      username: sanitizedData.username,
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
    return handleApiError(error);
  }
} 