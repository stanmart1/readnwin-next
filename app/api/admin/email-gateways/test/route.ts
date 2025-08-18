import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { query } from '@/utils/database';

// POST - Test email gateway connection
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    console.log('Test endpoint - Session data:', { 
      hasSession: !!session, 
      hasUser: !!session?.user, 
      userRole: session?.user?.role,
      userId: session?.user?.id 
    });
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin role
    if (session.user.role !== 'admin' && session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { gatewayId, config, testEmail } = await request.json();

    console.log('Test endpoint - Request data:', { gatewayId, configKeys: Object.keys(config || {}), testEmail });

    if (!gatewayId || !config) {
      return NextResponse.json({ error: 'Missing gateway configuration' }, { status: 400 });
    }

    if (!testEmail || !testEmail.includes('@')) {
      return NextResponse.json({ error: 'Valid test email address is required' }, { status: 400 });
    }

    let testResult;

    try {
      switch (gatewayId) {
        case 'resend':
          console.log('Testing Resend gateway...');
          testResult = await testResendGateway(config, testEmail);
          break;
        case 'smtp':
          console.log('Testing SMTP gateway...');
          testResult = await testSMTPGateway(config, testEmail);
          break;
        case 'sendgrid':
          console.log('Testing SendGrid gateway...');
          testResult = await testSendGridGateway(config, testEmail);
          break;
        case 'mailgun':
          console.log('Testing Mailgun gateway...');
          testResult = await testMailgunGateway(config, testEmail);
          break;
        case 'aws-ses':
          console.log('Testing AWS SES gateway...');
          testResult = await testAWSSESGateway(config, testEmail);
          break;
        case 'postmark':
          console.log('Testing Postmark gateway...');
          testResult = await testPostmarkGateway(config, testEmail);
          break;
        default:
          return NextResponse.json({ error: 'Unsupported gateway type' }, { status: 400 });
      }
    } catch (testError) {
      console.error('Error during gateway test:', testError);
      return NextResponse.json({
        error: 'Gateway test failed',
        details: testError instanceof Error ? testError.message : 'Unknown error'
      }, { status: 500 });
    }

    if (testResult.success) {
      // Log successful test
      try {
        await query(`
          INSERT INTO audit_logs (user_id, action, details, ip_address, user_agent)
          VALUES ($1, $2, $3, $4, $5)
        `, [
          session.user.id,
          'TEST_EMAIL_GATEWAY',
          JSON.stringify({ gatewayId, success: true, recipient: testEmail }),
          request.headers.get('x-forwarded-for') || request.ip || 'unknown',
          request.headers.get('user-agent') || 'unknown'
        ]);
      } catch (auditError) {
        console.error('Warning: Failed to log audit entry:', auditError);
        // Don't fail the test if audit logging fails
      }

      return NextResponse.json({
        message: 'Test email sent successfully',
        gatewayId,
        recipient: testEmail
      });
    } else {
      return NextResponse.json({
        error: 'Failed to send test email',
        details: testResult.error
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error testing email gateway:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Test Resend gateway
async function testResendGateway(config: any, testEmailAddress: string) {
  try {
    if (!config.resendApiKey) {
      return { success: false, error: 'Resend API key is required' };
    }

    const resend = new Resend(config.resendApiKey);

    const testEmail = {
      from: `${config.fromName || 'ReadnWin'} <${config.fromEmail || 'noreply@readnwin.com'}>`,
      to: [testEmailAddress],
      subject: 'ReadnWin Email Gateway Test',
      html: generateTestEmailHTML('Resend', config),
      text: generateTestEmailText('Resend', config)
    };

    const result = await resend.emails.send(testEmail);
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Resend test error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Test SendGrid gateway
async function testSendGridGateway(config: any, testEmailAddress: string) {
  try {
    if (!config.sendgridApiKey) {
      return { success: false, error: 'SendGrid API key is required' };
    }

    // Note: This would require @sendgrid/mail package
    // For now, return a placeholder implementation
    return { 
      success: false, 
      error: 'SendGrid integration requires @sendgrid/mail package. Please install it first.' 
    };
  } catch (error) {
    console.error('SendGrid test error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Test Mailgun gateway
async function testMailgunGateway(config: any, testEmailAddress: string) {
  try {
    if (!config.mailgunApiKey) {
      return { success: false, error: 'Mailgun API key is required' };
    }
    if (!config.mailgunDomain) {
      return { success: false, error: 'Mailgun domain is required' };
    }

    // Note: This would require mailgun.js package
    // For now, return a placeholder implementation
    return { 
      success: false, 
      error: 'Mailgun integration requires mailgun.js package. Please install it first.' 
    };
  } catch (error) {
    console.error('Mailgun test error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Test AWS SES gateway
async function testAWSSESGateway(config: any, testEmailAddress: string) {
  try {
    if (!config.awsAccessKeyId) {
      return { success: false, error: 'AWS Access Key ID is required' };
    }
    if (!config.awsSecretAccessKey) {
      return { success: false, error: 'AWS Secret Access Key is required' };
    }

    // Note: This would require @aws-sdk/client-ses package
    // For now, return a placeholder implementation
    return { 
      success: false, 
      error: 'AWS SES integration requires @aws-sdk/client-ses package. Please install it first.' 
    };
  } catch (error) {
    console.error('AWS SES test error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Test Postmark gateway
async function testPostmarkGateway(config: any, testEmailAddress: string) {
  try {
    if (!config.postmarkApiKey) {
      return { success: false, error: 'Postmark API key is required' };
    }

    // Note: This would require @postmark/serverless-client package
    // For now, return a placeholder implementation
    return { 
      success: false, 
      error: 'Postmark integration requires @postmark/serverless-client package. Please install it first.' 
    };
  } catch (error) {
    console.error('Postmark test error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Test SMTP gateway
async function testSMTPGateway(config: any, testEmailAddress: string) {
  try {
    // Validate required fields
    if (!config.smtpHost) {
      return { success: false, error: 'SMTP host is required' };
    }
    if (!config.smtpUsername) {
      return { success: false, error: 'SMTP username is required' };
    }
    if (!config.smtpPassword) {
      return { success: false, error: 'SMTP password is required' };
    }

    // Validate port
    const port = config.smtpPort || 587;
    if (port < 1 || port > 65535) {
      return { success: false, error: 'SMTP port must be between 1 and 65535' };
    }

    // Create transporter with enhanced configuration
    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: port,
      secure: config.smtpSecure || false,
      auth: {
        user: config.smtpUsername,
        pass: config.smtpPassword,
      },
      // Additional options for better compatibility
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates
      },
      // Connection timeout
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    console.log('Testing SMTP connection...', {
      host: config.smtpHost,
      port: port,
      secure: config.smtpSecure,
      username: config.smtpUsername
    });

    // Verify connection
    await transporter.verify();
    console.log('SMTP connection verified successfully');

    // Send test email
    const testEmail = {
      from: `${config.fromName || 'ReadnWin'} <${config.fromEmail || config.smtpUsername}>`,
      to: testEmailAddress,
      subject: 'ReadnWin Email Gateway Test',
      html: generateTestEmailHTML('SMTP', config),
      text: generateTestEmailText('SMTP', config)
    };

    console.log('Sending test email...');
    const result = await transporter.sendMail(testEmail);
    console.log('Test email sent successfully:', result.messageId);
    
    return { success: true, data: result };
  } catch (error) {
    console.error('SMTP test error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Unknown SMTP error';
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid login')) {
        errorMessage = 'Invalid username or password. Please check your credentials.';
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Connection refused. Please check the SMTP host and port.';
      } else if (error.message.includes('ETIMEDOUT')) {
        errorMessage = 'Connection timeout. Please check your internet connection and SMTP settings.';
      } else if (error.message.includes('ENOTFOUND')) {
        errorMessage = 'SMTP host not found. Please check the hostname.';
      } else if (error.message.includes('self signed certificate')) {
        errorMessage = 'SSL certificate issue. Try disabling SSL/TLS or check certificate settings.';
      } else {
        errorMessage = error.message;
      }
    }
    
    return { success: false, error: errorMessage };
  }
}

// Helper function to generate test email HTML
function generateTestEmailHTML(gatewayType: string, config: any) {
  const gatewayDetails = getGatewayDetails(gatewayType, config);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Gateway Test</title>
      <style>
        body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .success { background: #D1FAE5; border: 1px solid #10B981; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .details { background: #F3F4F6; border: 1px solid #E5E7EB; padding: 15px; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Email Gateway Test Successful</h1>
          <p>ReadnWin ${gatewayType} Configuration</p>
        </div>
        <div class="content">
          <h2>Hello! 👋</h2>
          <p>This is a test email to verify that your ReadnWin ${gatewayType} email gateway is properly configured and working.</p>
          
          <div class="success">
            <strong>🎉 Success!</strong> Your ${gatewayType} email gateway is working correctly.
          </div>
          
          <div class="details">
            <h3>Gateway Details:</h3>
            <ul>
              ${gatewayDetails.map(detail => `<li><strong>${detail.label}:</strong> ${detail.value}</li>`).join('')}
              <li><strong>Test Time:</strong> ${new Date().toLocaleString()}</li>
            </ul>
          </div>
          
          <p>Your email system is now ready to send notifications, welcome emails, and other important communications to your users.</p>
          
          <p>Best regards,<br>The ReadnWin Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Helper function to generate test email text
function generateTestEmailText(gatewayType: string, config: any) {
  const gatewayDetails = getGatewayDetails(gatewayType, config);
  
  return `
    Email Gateway Test Successful
    
    Hello! 👋
    
    This is a test email to verify that your ReadnWin ${gatewayType} email gateway is properly configured and working.
    
    🎉 Success! Your ${gatewayType} email gateway is working correctly.
    
    Gateway Details:
    ${gatewayDetails.map(detail => `- ${detail.label}: ${detail.value}`).join('\n')}
    - Test Time: ${new Date().toLocaleString()}
    
    Your email system is now ready to send notifications, welcome emails, and other important communications to your users.
    
    Best regards,
    The ReadnWin Team
  `;
}

// Helper function to get gateway-specific details
function getGatewayDetails(gatewayType: string, config: any) {
  const details = [
    { label: 'Gateway', value: gatewayType }
  ];

  switch (gatewayType) {
    case 'Resend':
      details.push(
        { label: 'From Email', value: config.fromEmail || 'noreply@readnwin.com' },
        { label: 'From Name', value: config.fromName || 'ReadnWin' },
        { label: 'Domain', value: config.resendDomain || 'readnwin.com' }
      );
      break;
    case 'SMTP':
      details.push(
        { label: 'Host', value: config.smtpHost },
        { label: 'Port', value: config.smtpPort || 587 },
        { label: 'Username', value: config.smtpUsername },
        { label: 'Secure', value: config.smtpSecure ? 'Yes (SSL/TLS)' : 'No' },
        { label: 'From Email', value: config.fromEmail || config.smtpUsername },
        { label: 'From Name', value: config.fromName || 'ReadnWin' }
      );
      break;
    case 'SendGrid':
      details.push(
        { label: 'From Email', value: config.fromEmail || 'noreply@readnwin.com' },
        { label: 'From Name', value: config.fromName || 'ReadnWin' },
        { label: 'Domain', value: config.sendgridDomain || 'readnwin.com' }
      );
      break;
    case 'Mailgun':
      details.push(
        { label: 'From Email', value: config.fromEmail || 'noreply@readnwin.com' },
        { label: 'From Name', value: config.fromName || 'ReadnWin' },
        { label: 'Domain', value: config.mailgunDomain || 'readnwin.com' },
        { label: 'Region', value: config.mailgunRegion || 'us' }
      );
      break;
    case 'AWS SES':
      details.push(
        { label: 'From Email', value: config.awsSesFromEmail || 'noreply@readnwin.com' },
        { label: 'From Name', value: config.fromName || 'ReadnWin' },
        { label: 'Region', value: config.awsRegion || 'us-east-1' }
      );
      break;
    case 'Postmark':
      details.push(
        { label: 'From Email', value: config.postmarkFromEmail || 'noreply@readnwin.com' },
        { label: 'From Name', value: config.postmarkFromName || 'ReadnWin' }
      );
      break;
  }

  return details;
} 