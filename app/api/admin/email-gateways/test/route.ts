import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface EmailGatewayConfig {
  type: string;
  useEnvVars?: boolean;
  fromName: string;
  fromEmail: string;
  resendApiKey?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUsername?: string;
  smtpPassword?: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'admin' && session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let gatewayId, config, testEmail;
    try {
      ({ gatewayId, config, testEmail } = await request.json());
    } catch (parseError) {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    if (!gatewayId || !config || !testEmail) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Sanitize inputs to prevent XSS
    const sanitize = (str: string) => str.replace(/[<>"'&]/g, '');
    const safeFromName = sanitize(config.fromName || '');
    const safeFromEmail = sanitize(config.fromEmail || '');

    let testResult;
    
    try {
      const sanitizedConfig = { ...config, fromName: safeFromName, fromEmail: safeFromEmail };
      
      switch (config.type) {
        case 'resend':
          testResult = await testResendGateway(sanitizedConfig, testEmail);
          break;
        case 'smtp':
          testResult = await testSmtpGateway(sanitizedConfig, testEmail);
          break;
        default:
          return NextResponse.json({ error: 'Gateway type not yet implemented for testing' }, { status: 400 });
      }

      if (testResult.success) {
        return NextResponse.json({
          success: true,
          message: `Test email sent successfully to ${testEmail}`,
          details: testResult.details
        });
      } else {
        return NextResponse.json({
          success: false,
          message: testResult.error || 'Failed to send test email'
        }, { status: 400 });
      }

    } catch (testError: unknown) {
      const errorMessage = testError instanceof Error ? testError.message : 'Gateway test failed';
      console.error('Gateway test error:', testError);
      return NextResponse.json({
        success: false,
        message: errorMessage
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error testing email gateway:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function testResendGateway(config: EmailGatewayConfig, testEmail: string) {
  const apiKey = config.useEnvVars ? process.env.RESEND_API_KEY : config.resendApiKey;
  
  if (!apiKey) {
    return { success: false, error: 'Resend API key not configured' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${config.fromName} <${config.fromEmail}>`,
        to: [testEmail],
        subject: 'Email Gateway Test - Resend',
        html: `
          <h2>Email Gateway Test Successful!</h2>
          <p>This is a test email from your Resend email gateway configuration.</p>
          <p><strong>Gateway:</strong> Resend</p>
          <p><strong>From:</strong> ${config.fromName} &lt;${config.fromEmail}&gt;</p>
          <p><strong>Test Time:</strong> ${new Date().toISOString()}</p>
          <p>If you received this email, your Resend gateway is working correctly.</p>
        `,
      }),
    });

    let result;
    try {
      result = await response.json();
    } catch (parseError) {
      return { success: false, error: 'Invalid response from Resend API' };
    }

    if (response.ok) {
      return { 
        success: true, 
        details: { messageId: result.id, service: 'Resend' }
      };
    } else {
      return { 
        success: false, 
        error: result.message || 'Resend API error' 
      };
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { 
      success: false, 
      error: `Resend connection failed: ${errorMessage}` 
    };
  }
}

async function testSmtpGateway(config: EmailGatewayConfig, testEmail: string) {
  try {
    const nodemailer = require('nodemailer');
    
    const smtpConfig = {
      host: config.useEnvVars ? process.env.SMTP_HOST : config.smtpHost,
      port: config.useEnvVars ? parseInt(process.env.SMTP_PORT || '587') : config.smtpPort,
      secure: config.useEnvVars ? process.env.SMTP_SECURE === 'true' : config.smtpSecure,
      auth: {
        user: config.useEnvVars ? process.env.SMTP_USERNAME : config.smtpUsername,
        pass: config.useEnvVars ? process.env.SMTP_PASSWORD : config.smtpPassword,
      },
    };

    if (!smtpConfig.host || !smtpConfig.auth.user || !smtpConfig.auth.pass) {
      return { success: false, error: 'SMTP configuration incomplete' };
    }

    const transporter = nodemailer.createTransport(smtpConfig);
    
    await transporter.verify();
    
    const info = await transporter.sendMail({
      from: `${config.fromName} <${config.fromEmail}>`,
      to: testEmail,
      subject: 'Email Gateway Test - SMTP',
      html: `
        <h2>Email Gateway Test Successful!</h2>
        <p>This is a test email from your SMTP email gateway configuration.</p>
        <p><strong>Gateway:</strong> SMTP</p>
        <p><strong>Host:</strong> ${smtpConfig.host}:${smtpConfig.port}</p>
        <p><strong>From:</strong> ${config.fromName} &lt;${config.fromEmail}&gt;</p>
        <p><strong>Test Time:</strong> ${new Date().toISOString()}</p>
        <p>If you received this email, your SMTP gateway is working correctly.</p>
      `,
    });

    return { 
      success: true, 
      details: { messageId: info.messageId, service: 'SMTP' }
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { 
      success: false, 
      error: `SMTP connection failed: ${errorMessage}` 
    };
  }
}