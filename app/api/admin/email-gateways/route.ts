import { sanitizeInput, sanitizeQuery, validateId, sanitizeHtml } from '@/lib/security';
import { requireAdmin, requirePermission } from '@/middleware/auth';
import logger from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/utils/database';

// GET - Retrieve email gateway settings
export async function GET() {
  try {
    await requireAdmin(request);
  } catch (error) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin role
    if (session.user.role !== 'admin' && session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get email gateway settings from database
    const result = await query(`
      SELECT 
        setting_key,
        setting_value,
        created_at,
        updated_at
      FROM system_settings 
      WHERE setting_key LIKE 'email_gateway_%'
      ORDER BY setting_key
    `);

    // Parse settings into structured format with all supported gateways
    const gateways = [
      {
        id: 'resend',
        name: 'Resend',
        type: 'resend',
        isActive: false,
        fromEmail: 'noreply@readnwin.com',
        fromName: 'ReadnWin',
        resendApiKey: '',
        resendDomain: 'readnwin.com',
        useEnvVars: false,
        envVarPrefix: 'RESEND'
      },
      {
        id: 'smtp',
        name: 'SMTP Server',
        type: 'smtp',
        isActive: false,
        fromEmail: 'noreply@readnwin.com',
        fromName: 'ReadnWin',
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        smtpUsername: '',
        smtpPassword: '',
        smtpSecure: false,
        useEnvVars: false,
        envVarPrefix: 'SMTP'
      },
      {
        id: 'sendgrid',
        name: 'SendGrid',
        type: 'sendgrid',
        isActive: false,
        fromEmail: 'noreply@readnwin.com',
        fromName: 'ReadnWin',
        sendgridApiKey: '',
        sendgridDomain: 'readnwin.com',
        useEnvVars: false,
        envVarPrefix: 'SENDGRID'
      },
      {
        id: 'mailgun',
        name: 'Mailgun',
        type: 'mailgun',
        isActive: false,
        fromEmail: 'noreply@readnwin.com',
        fromName: 'ReadnWin',
        mailgunApiKey: '',
        mailgunDomain: 'readnwin.com',
        mailgunRegion: 'us',
        useEnvVars: false,
        envVarPrefix: 'MAILGUN'
      },
      {
        id: 'aws-ses',
        name: 'AWS SES',
        type: 'aws-ses',
        isActive: false,
        fromEmail: 'noreply@readnwin.com',
        fromName: 'ReadnWin',
        awsAccessKeyId: '',
        awsSecretAccessKey: '',
        awsRegion: 'us-east-1',
        awsSesFromEmail: 'noreply@readnwin.com',
        useEnvVars: false,
        envVarPrefix: 'AWS_SES'
      },
      {
        id: 'postmark',
        name: 'Postmark',
        type: 'postmark',
        isActive: false,
        fromEmail: 'noreply@readnwin.com',
        fromName: 'ReadnWin',
        postmarkApiKey: '',
        postmarkFromEmail: 'noreply@readnwin.com',
        postmarkFromName: 'ReadnWin',
        useEnvVars: false,
        envVarPrefix: 'POSTMARK'
      }
    ];

    let activeGateway = 'resend';

    // Map database settings to gateway config
    result.rows.forEach((row: any) => {
      const key = row.setting_key;
      const value = row.setting_value;

      if (key === 'email_gateway_active') {
        activeGateway = value;
      } else if (key.startsWith('email_gateway_resend_')) {
        const field = key.replace('email_gateway_resend_', '');
        const resendGateway = gateways.find(g => g.id === 'resend');
        if (resendGateway) {
          if (field === 'api_key') {
            resendGateway.resendApiKey = value;
          } else if (field === 'domain') {
            resendGateway.resendDomain = value;
          } else if (field === 'from_email') {
            resendGateway.fromEmail = value;
          } else if (field === 'from_name') {
            resendGateway.fromName = value;
          } else if (field === 'is_active') {
            resendGateway.isActive = value === 'true';
          } else if (field === 'use_env_vars') {
            resendGateway.useEnvVars = value === 'true';
          } else if (field === 'env_var_prefix') {
            resendGateway.envVarPrefix = value;
          }
        }
      } else if (key.startsWith('email_gateway_smtp_')) {
        const field = key.replace('email_gateway_smtp_', '');
        const smtpGateway = gateways.find(g => g.id === 'smtp');
        if (smtpGateway) {
          if (field === 'host') {
            smtpGateway.smtpHost = value;
          } else if (field === 'port') {
            smtpGateway.smtpPort = parseInt(value);
          } else if (field === 'username') {
            smtpGateway.smtpUsername = value;
          } else if (field === 'password') {
            smtpGateway.smtpPassword = value;
          } else if (field === 'secure') {
            smtpGateway.smtpSecure = value === 'true';
          } else if (field === 'from_email') {
            smtpGateway.fromEmail = value;
          } else if (field === 'from_name') {
            smtpGateway.fromName = value;
          } else if (field === 'is_active') {
            smtpGateway.isActive = value === 'true';
          } else if (field === 'use_env_vars') {
            smtpGateway.useEnvVars = value === 'true';
          } else if (field === 'env_var_prefix') {
            smtpGateway.envVarPrefix = value;
          }
        }
      } else if (key.startsWith('email_gateway_sendgrid_')) {
        const field = key.replace('email_gateway_sendgrid_', '');
        const sendgridGateway = gateways.find(g => g.id === 'sendgrid');
        if (sendgridGateway) {
          if (field === 'api_key') {
            sendgridGateway.sendgridApiKey = value;
          } else if (field === 'domain') {
            sendgridGateway.sendgridDomain = value;
          } else if (field === 'from_email') {
            sendgridGateway.fromEmail = value;
          } else if (field === 'from_name') {
            sendgridGateway.fromName = value;
          } else if (field === 'is_active') {
            sendgridGateway.isActive = value === 'true';
          } else if (field === 'use_env_vars') {
            sendgridGateway.useEnvVars = value === 'true';
          } else if (field === 'env_var_prefix') {
            sendgridGateway.envVarPrefix = value;
          }
        }
      } else if (key.startsWith('email_gateway_mailgun_')) {
        const field = key.replace('email_gateway_mailgun_', '');
        const mailgunGateway = gateways.find(g => g.id === 'mailgun');
        if (mailgunGateway) {
          if (field === 'api_key') {
            mailgunGateway.mailgunApiKey = value;
          } else if (field === 'domain') {
            mailgunGateway.mailgunDomain = value;
          } else if (field === 'region') {
            mailgunGateway.mailgunRegion = value;
          } else if (field === 'from_email') {
            mailgunGateway.fromEmail = value;
          } else if (field === 'from_name') {
            mailgunGateway.fromName = value;
          } else if (field === 'is_active') {
            mailgunGateway.isActive = value === 'true';
          } else if (field === 'use_env_vars') {
            mailgunGateway.useEnvVars = value === 'true';
          } else if (field === 'env_var_prefix') {
            mailgunGateway.envVarPrefix = value;
          }
        }
      } else if (key.startsWith('email_gateway_aws_ses_')) {
        const field = key.replace('email_gateway_aws_ses_', '');
        const awsSesGateway = gateways.find(g => g.id === 'aws-ses');
        if (awsSesGateway) {
          if (field === 'access_key_id') {
            awsSesGateway.awsAccessKeyId = value;
          } else if (field === 'secret_access_key') {
            awsSesGateway.awsSecretAccessKey = value;
          } else if (field === 'region') {
            awsSesGateway.awsRegion = value;
          } else if (field === 'from_email') {
            awsSesGateway.awsSesFromEmail = value;
          } else if (field === 'from_name') {
            awsSesGateway.fromName = value;
          } else if (field === 'is_active') {
            awsSesGateway.isActive = value === 'true';
          } else if (field === 'use_env_vars') {
            awsSesGateway.useEnvVars = value === 'true';
          } else if (field === 'env_var_prefix') {
            awsSesGateway.envVarPrefix = value;
          }
        }
      } else if (key.startsWith('email_gateway_postmark_')) {
        const field = key.replace('email_gateway_postmark_', '');
        const postmarkGateway = gateways.find(g => g.id === 'postmark');
        if (postmarkGateway) {
          if (field === 'api_key') {
            postmarkGateway.postmarkApiKey = value;
          } else if (field === 'from_email') {
            postmarkGateway.postmarkFromEmail = value;
          } else if (field === 'from_name') {
            postmarkGateway.postmarkFromName = value;
          } else if (field === 'is_active') {
            postmarkGateway.isActive = value === 'true';
          } else if (field === 'use_env_vars') {
            postmarkGateway.useEnvVars = value === 'true';
          } else if (field === 'env_var_prefix') {
            postmarkGateway.envVarPrefix = value;
          }
        }
      }
    });

    return NextResponse.json({
      gateways,
      activeGateway
    });

  } catch (error) {
    logger.error('Error fetching email gateway settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Update email gateway settings
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    logger.info('Session data:', { 
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

    const { gateways, activeGateway } = await request.json();

    // Validate input
    if (!gateways || !Array.isArray(gateways)) {
      return NextResponse.json({ error: 'Invalid gateways data' }, { status: 400 });
    }

    // Update active gateway
    try {
      await query(`
        INSERT INTO system_settings (setting_key, setting_value, updated_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (setting_key) 
        DO UPDATE SET setting_value = $2, updated_at = NOW()
      `, ['email_gateway_active', activeGateway]);
    } catch (error) {
      logger.error('Error updating active gateway:', error);
      return NextResponse.json({ error: 'Failed to update active gateway' }, { status: 500 });
    }

    // Update gateway configurations
    try {
      for (const gateway of gateways) {
        if (gateway.type === 'resend') {
          // Update Resend settings
          const resendSettings = [
            ['email_gateway_resend_is_active', gateway.isActive.toString()],
            ['email_gateway_resend_from_email', gateway.fromEmail || ''],
            ['email_gateway_resend_from_name', gateway.fromName || ''],
            ['email_gateway_resend_domain', gateway.resendDomain || ''],
            ['email_gateway_resend_api_key', gateway.resendApiKey || ''],
            ['email_gateway_resend_use_env_vars', (gateway.useEnvVars || false).toString()],
            ['email_gateway_resend_env_var_prefix', gateway.envVarPrefix || 'RESEND']
          ];

          for (const [key, value] of resendSettings) {
            await query(`
              INSERT INTO system_settings (setting_key, setting_value, updated_at)
              VALUES ($1, $2, NOW())
              ON CONFLICT (setting_key) 
              DO UPDATE SET setting_value = $2, updated_at = NOW()
            `, [key, value]);
          }
        } else if (gateway.type === 'smtp') {
          // Update SMTP settings
          const smtpSettings = [
            ['email_gateway_smtp_is_active', gateway.isActive.toString()],
            ['email_gateway_smtp_from_email', gateway.fromEmail || ''],
            ['email_gateway_smtp_from_name', gateway.fromName || ''],
            ['email_gateway_smtp_host', gateway.smtpHost || ''],
            ['email_gateway_smtp_port', (gateway.smtpPort || 587).toString()],
            ['email_gateway_smtp_username', gateway.smtpUsername || ''],
            ['email_gateway_smtp_password', gateway.smtpPassword || ''],
            ['email_gateway_smtp_secure', (gateway.smtpSecure || false).toString()],
            ['email_gateway_smtp_use_env_vars', (gateway.useEnvVars || false).toString()],
            ['email_gateway_smtp_env_var_prefix', gateway.envVarPrefix || 'SMTP']
          ];

          for (const [key, value] of smtpSettings) {
            await query(`
              INSERT INTO system_settings (setting_key, setting_value, updated_at)
              VALUES ($1, $2, NOW())
              ON CONFLICT (setting_key) 
              DO UPDATE SET setting_value = $2, updated_at = NOW()
            `, [key, value]);
          }
        } else if (gateway.type === 'sendgrid') {
          // Update SendGrid settings
          const sendgridSettings = [
            ['email_gateway_sendgrid_is_active', gateway.isActive.toString()],
            ['email_gateway_sendgrid_from_email', gateway.fromEmail || ''],
            ['email_gateway_sendgrid_from_name', gateway.fromName || ''],
            ['email_gateway_sendgrid_domain', gateway.sendgridDomain || ''],
            ['email_gateway_sendgrid_api_key', gateway.sendgridApiKey || ''],
            ['email_gateway_sendgrid_use_env_vars', (gateway.useEnvVars || false).toString()],
            ['email_gateway_sendgrid_env_var_prefix', gateway.envVarPrefix || 'SENDGRID']
          ];

          for (const [key, value] of sendgridSettings) {
            await query(`
              INSERT INTO system_settings (setting_key, setting_value, updated_at)
              VALUES ($1, $2, NOW())
              ON CONFLICT (setting_key) 
              DO UPDATE SET setting_value = $2, updated_at = NOW()
            `, [key, value]);
          }
        } else if (gateway.type === 'mailgun') {
          // Update Mailgun settings
          const mailgunSettings = [
            ['email_gateway_mailgun_is_active', gateway.isActive.toString()],
            ['email_gateway_mailgun_from_email', gateway.fromEmail || ''],
            ['email_gateway_mailgun_from_name', gateway.fromName || ''],
            ['email_gateway_mailgun_domain', gateway.mailgunDomain || ''],
            ['email_gateway_mailgun_region', gateway.mailgunRegion || 'us'],
            ['email_gateway_mailgun_api_key', gateway.mailgunApiKey || ''],
            ['email_gateway_mailgun_use_env_vars', (gateway.useEnvVars || false).toString()],
            ['email_gateway_mailgun_env_var_prefix', gateway.envVarPrefix || 'MAILGUN']
          ];

          for (const [key, value] of mailgunSettings) {
            await query(`
              INSERT INTO system_settings (setting_key, setting_value, updated_at)
              VALUES ($1, $2, NOW())
              ON CONFLICT (setting_key) 
              DO UPDATE SET setting_value = $2, updated_at = NOW()
            `, [key, value]);
          }
        } else if (gateway.type === 'aws-ses') {
          // Update AWS SES settings
          const awsSesSettings = [
            ['email_gateway_aws_ses_is_active', gateway.isActive.toString()],
            ['email_gateway_aws_ses_from_name', gateway.fromName || ''],
            ['email_gateway_aws_ses_from_email', gateway.awsSesFromEmail || ''],
            ['email_gateway_aws_ses_access_key_id', gateway.awsAccessKeyId || ''],
            ['email_gateway_aws_ses_secret_access_key', gateway.awsSecretAccessKey || ''],
            ['email_gateway_aws_ses_region', gateway.awsRegion || 'us-east-1'],
            ['email_gateway_aws_ses_use_env_vars', (gateway.useEnvVars || false).toString()],
            ['email_gateway_aws_ses_env_var_prefix', gateway.envVarPrefix || 'AWS_SES']
          ];

          for (const [key, value] of awsSesSettings) {
            await query(`
              INSERT INTO system_settings (setting_key, setting_value, updated_at)
              VALUES ($1, $2, NOW())
              ON CONFLICT (setting_key) 
              DO UPDATE SET setting_value = $2, updated_at = NOW()
            `, [key, value]);
          }
        } else if (gateway.type === 'postmark') {
          // Update Postmark settings
          const postmarkSettings = [
            ['email_gateway_postmark_is_active', gateway.isActive.toString()],
            ['email_gateway_postmark_from_email', gateway.postmarkFromEmail || ''],
            ['email_gateway_postmark_from_name', gateway.postmarkFromName || ''],
            ['email_gateway_postmark_api_key', gateway.postmarkApiKey || ''],
            ['email_gateway_postmark_use_env_vars', (gateway.useEnvVars || false).toString()],
            ['email_gateway_postmark_env_var_prefix', gateway.envVarPrefix || 'POSTMARK']
          ];

          for (const [key, value] of postmarkSettings) {
            await query(`
              INSERT INTO system_settings (setting_key, setting_value, updated_at)
              VALUES ($1, $2, NOW())
              ON CONFLICT (setting_key) 
              DO UPDATE SET setting_value = $2, updated_at = NOW()
            `, [key, value]);
          }
        }
      }
    } catch (error) {
      logger.error('Error updating gateway configurations:', error);
      return NextResponse.json({ error: 'Failed to update gateway configurations' }, { status: 500 });
    }

    // Log the action
    try {
      await query(`
        INSERT INTO audit_logs (user_id, action, details, ip_address, user_agent)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        session.user.id,
        'UPDATE_EMAIL_GATEWAY_SETTINGS',
        JSON.stringify({ activeGateway, gateways: gateways.map(g => ({ id: g.id, type: g.type, isActive: g.isActive })) }),
        request.headers.get('x-forwarded-for') || request.ip || 'unknown',
        request.headers.get('user-agent') || 'unknown'
      ]);
    } catch (auditError) {
      logger.error('Warning: Failed to log audit entry:', auditError);
      // Don't fail the entire request if audit logging fails
    }

    return NextResponse.json({
      message: 'Email gateway settings updated successfully',
      activeGateway,
      gateways
    });

  } catch (error) {
    logger.error('Error updating email gateway settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 