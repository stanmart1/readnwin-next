import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/utils/database';

export async function GET() {
  try {
    console.log('🔍 Debugging email gateway configuration...');

    // Get all email gateway settings
    const result = await query(`
      SELECT 
        setting_key,
        setting_value
      FROM system_settings 
      WHERE setting_key LIKE 'email_gateway_%'
      ORDER BY setting_key
    `);

    // Get active gateway
    const activeGatewayResult = await query(`
      SELECT setting_value FROM system_settings 
      WHERE setting_key = 'email_gateway_active'
    `);
    
    const activeGateway = activeGatewayResult.rows[0]?.setting_value || 'resend';

    // Build gateway config manually
    const gatewayConfig = {
      id: activeGateway,
      name: activeGateway === 'resend' ? 'Resend' : 'SMTP Server',
      type: activeGateway as 'resend' | 'smtp',
      isActive: false,
      fromEmail: 'noreply@readnwin.com',
      fromName: 'ReadnWin'
    };

    // Map settings to config
    result.rows.forEach((row: any) => {
      const key = row.setting_key;
      const value = row.setting_value;

      if (key.startsWith(`email_gateway_${activeGateway}_`)) {
        const field = key.replace(`email_gateway_${activeGateway}_`, '');
        
        if (field === 'is_active') {
          gatewayConfig.isActive = value === 'true';
        } else if (field === 'from_email') {
          gatewayConfig.fromEmail = value;
        } else if (field === 'from_name') {
          gatewayConfig.fromName = value;
        } else if (activeGateway === 'resend') {
          if (field === 'api_key') {
            (gatewayConfig as any).resendApiKey = value;
          } else if (field === 'domain') {
            (gatewayConfig as any).resendDomain = value;
          }
        } else if (activeGateway === 'smtp') {
          if (field === 'host') {
            (gatewayConfig as any).smtpHost = value;
          } else if (field === 'port') {
            (gatewayConfig as any).smtpPort = parseInt(value);
          } else if (field === 'username') {
            (gatewayConfig as any).smtpUsername = value;
          } else if (field === 'password') {
            (gatewayConfig as any).smtpPassword = value;
          } else if (field === 'secure') {
            (gatewayConfig as any).smtpSecure = value === 'true';
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      debug: {
        allSettings: result.rows,
        activeGateway,
        gatewayConfig,
        isActive: gatewayConfig.isActive
      }
    });

  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to debug email configuration',
        details: error
      },
      { status: 500 }
    );
  }
} 