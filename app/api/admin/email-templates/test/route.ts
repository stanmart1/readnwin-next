import { sanitizeInput, sanitizeQuery, validateId, sanitizeHtml } from '@/lib/security';
import { requireAdmin, requirePermission } from '@/middleware/auth';
import logger from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/utils/database';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
  } catch (error) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['admin', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { templateId, testEmail } = await request.json();

    if (!templateId || !testEmail) {
      return NextResponse.json({ 
        error: 'Template ID and test email are required' 
      }, { status: 400 });
    }

    // Get template details
    const templateResult = await query(`
      SELECT * FROM email_templates WHERE id = $1
    `, [templateId]);

    if (templateResult.rows.length === 0) {
      return NextResponse.json({ 
        error: 'Template not found' 
      }, { status: 404 });
    }

    const template = templateResult.rows[0];

    // Import email service
    const { sendEmail } = await import('@/utils/email');

    // Prepare test variables
    const testVariables = {
      userName: 'Test User',
      userEmail: testEmail,
      verificationToken: 'test-token-123',
      verificationUrl: 'https://readnwin.com/verify?token=test-token-123',
      resetToken: 'reset-token-456',
      resetUrl: 'https://readnwin.com/reset?token=reset-token-456',
      orderNumber: 'TEST-ORDER-001',
      orderTotal: '$29.99',
      trackingNumber: 'TEST-TRACK-123',
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    };

    // Replace variables in template content
    let htmlContent = template.html_content;
    let textContent = template.text_content || '';
    let subject = template.subject;

    Object.entries(testVariables).forEach(([key, value]) => {
      const variable = `{{${key}}}`;
      htmlContent = htmlContent.replace(new RegExp(variable, 'g'), value);
      textContent = textContent.replace(new RegExp(variable, 'g'), value);
      subject = subject.replace(new RegExp(variable, 'g'), value);
    });

    // Send test email
    await sendEmail({
      to: testEmail,
      subject: `[TEST] ${subject}`,
      html: htmlContent,
      text: textContent || undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully'
    });

  } catch (error) {
    logger.error('Error sending test email:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to send test email'
    }, { status: 500 });
  }
}