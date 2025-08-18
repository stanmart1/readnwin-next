import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/utils/email';

export async function POST(request: NextRequest) {
  try {
    const { email, subject, message } = await request.json();

    if (!email || !subject || !message) {
      return NextResponse.json(
        { error: 'Email, subject, and message are required' },
        { status: 400 }
      );
    }

    // Create a simple HTML template for custom emails
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .message { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3B82F6; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ReadnWin Custom Message</h1>
            <p>Admin Test Email</p>
          </div>
          <div class="content">
            <h2>Custom Message from Admin</h2>
            <div class="message">
              ${message.replace(/\n/g, '<br>')}
            </div>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Sent from:</strong> ReadnWin Admin Panel</p>
          </div>
          <div class="footer">
            <p>© 2025 ReadnWin. All rights reserved.</p>
            <p>This is a test email sent from the admin panel.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await sendEmail(email, subject, htmlContent, message);

    if (result.success) {
      return NextResponse.json(
        { message: 'Custom email sent successfully', data: result.data },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to send custom email', details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in custom email API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 