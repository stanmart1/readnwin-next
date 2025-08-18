import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Pool } from 'pg';

// Database configuration - No fallbacks, environment variables only
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: 'postgres', // Using postgres database directly
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: false, // SSL is disabled for the new database
});

// GET - Retrieve payment settings
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const client = await pool.connect();
    try {
      const userResult = await client.query(`
        SELECT r.name as role_name
        FROM users u
        LEFT JOIN user_roles ur ON u.id = ur.user_id AND ur.is_active = TRUE
        LEFT JOIN roles r ON ur.role_id = r.id
        WHERE u.id = $1
        ORDER BY r.priority DESC
        LIMIT 1
      `, [session.user.id]);

      if (userResult.rows.length === 0 || 
          (userResult.rows[0].role_name !== 'admin' && userResult.rows[0].role_name !== 'super_admin')) {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        );
      }

      // Get payment settings from database
      const settingsResult = await client.query(
        'SELECT setting_key, setting_value FROM payment_settings'
      );

      let settings = {
        defaultGateway: 'flutterwave',
        supportedGateways: ['flutterwave', 'bank_transfer'],
        currency: 'NGN',
        taxRate: 7.5,
        shippingCost: 500,
        freeShippingThreshold: 5000,
        webhookUrl: '',
        testMode: true,
      };

      if (settingsResult.rows.length > 0) {
        // Convert key-value pairs to settings object
        const settingsMap: Record<string, any> = {};
        settingsResult.rows.forEach(row => {
          try {
            // Try to parse as JSON first, fallback to string
            settingsMap[row.setting_key] = JSON.parse(row.setting_value);
          } catch {
            settingsMap[row.setting_key] = row.setting_value;
          }
        });
        
        // Map database keys to settings object
        settings = {
          defaultGateway: settingsMap.defaultGateway || settingsMap.default_gateway || 'flutterwave',
          supportedGateways: settingsMap.supportedGateways || ['flutterwave', 'bank_transfer'],
          currency: settingsMap.currency || settingsMap.default_currency || 'NGN',
          taxRate: parseFloat(settingsMap.taxRate) || 7.5,
          shippingCost: parseFloat(settingsMap.shippingCost) || 500,
          freeShippingThreshold: parseFloat(settingsMap.freeShippingThreshold) || 5000,
          webhookUrl: settingsMap.webhookUrl || '',
          testMode: settingsMap.testMode === 'true' || settingsMap.testMode === true,
        };
      }

      // Get payment gateways from database
      const gatewaysResult = await client.query(
        'SELECT * FROM payment_gateways ORDER BY id'
      );

      let gateways = [
        {
          id: 'flutterwave',
          gateway_id: 'flutterwave',
          name: 'Flutterwave',
          description: 'Leading payment technology company in Africa',
          icon: 'ri-global-line',
          enabled: false,
          testMode: true,
          apiKeys: {
            publicKey: '',
            secretKey: '',
            webhookSecret: '',
            hash: '',
          },
          supportedCurrencies: ['NGN'],
          features: ['Mobile Money', 'Bank Transfers', 'Credit Cards', 'USSD', 'QR Payments'],
          status: 'inactive',
        },
        {
          id: 'bank_transfer',
          gateway_id: 'bank_transfer',
          name: 'Bank Transfer',
          description: 'Direct bank transfer with proof of payment upload',
          icon: 'ri-bank-line',
          enabled: false,
          testMode: false,
          apiKeys: {
            publicKey: '',
            secretKey: '',
            webhookSecret: '',
          },
          supportedCurrencies: ['NGN'],
          features: ['Bank Transfers', 'Proof of Payment', 'Manual Verification'],
          status: 'inactive',
        },
      ];

      if (gatewaysResult.rows.length > 0) {
        gateways = gateways.map(gateway => {
          const dbGateway = gatewaysResult.rows.find(g => g.gateway_id === gateway.id);
          if (dbGateway) {
            // Parse bank account config for bank transfer gateway
            let bankAccount = undefined;
            if (gateway.id === 'bank_transfer' && dbGateway.config) {
              try {
                const config = typeof dbGateway.config === 'string' 
                  ? JSON.parse(dbGateway.config) 
                  : dbGateway.config;
                bankAccount = {
                  bankName: config.bankName || '',
                  accountNumber: config.accountNumber || '',
                  accountName: config.accountName || '',
                  accountType: config.accountType || '',
                  instructions: config.instructions || '',
                };
              } catch (error) {
                console.error('Error parsing bank account config:', error);
              }
            }

            return {
              ...gateway,
              enabled: dbGateway.enabled,
              testMode: dbGateway.test_mode,
              apiKeys: {
                publicKey: dbGateway.public_key || '',
                secretKey: dbGateway.secret_key || '',
                webhookSecret: dbGateway.webhook_secret || '',
                hash: dbGateway.hash || '',
              },
              bankAccount,
              status: dbGateway.status || 'inactive',
            };
          }
          return gateway;
        });
      }

      return NextResponse.json({
        success: true,
        settings,
        gateways,
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error retrieving payment settings:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve payment settings' },
      { status: 500 }
    );
  }
}

// POST - Save payment settings
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const client = await pool.connect();
    try {
      const userResult = await client.query(`
        SELECT r.name as role_name
        FROM users u
        LEFT JOIN user_roles ur ON u.id = ur.user_id AND ur.is_active = TRUE
        LEFT JOIN roles r ON ur.role_id = r.id
        WHERE u.id = $1
        ORDER BY r.priority DESC
        LIMIT 1
      `, [session.user.id]);

      if (userResult.rows.length === 0 || 
          (userResult.rows[0].role_name !== 'admin' && userResult.rows[0].role_name !== 'super_admin')) {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        );
      }

      // Parse request body
      const { settings, gateways } = await request.json();

      // Validate required fields
      if (!settings || !gateways) {
        return NextResponse.json(
          { error: 'Settings and gateways are required' },
          { status: 400 }
        );
      }

      // Save payment settings
      const settingsEntries = Object.entries(settings);
      for (const [key, value] of settingsEntries) {
        await client.query(
          `INSERT INTO payment_settings (setting_key, setting_value, updated_at) 
           VALUES ($1, $2, NOW()) 
           ON CONFLICT (setting_key) 
           DO UPDATE SET setting_value = $2, updated_at = NOW()`,
          [key, JSON.stringify(value)]
        );
      }

      // Save payment gateways
      for (const gateway of gateways) {
        await client.query(
          `INSERT INTO payment_gateways (gateway_id, name, enabled, test_mode, public_key, secret_key, webhook_secret, hash, status, updated_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) 
           ON CONFLICT (gateway_id) 
           DO UPDATE SET 
             name = $2, 
             enabled = $3, 
             test_mode = $4, 
             public_key = $5, 
             secret_key = $6, 
             webhook_secret = $7, 
             hash = $8, 
             status = $9, 
             updated_at = NOW()`,
          [
            gateway.id,
            gateway.name,
            gateway.enabled,
            gateway.testMode,
            gateway.apiKeys.publicKey,
            gateway.apiKeys.secretKey,
            gateway.apiKeys.webhookSecret || null,
            gateway.apiKeys.hash || null,
            gateway.status,
          ]
        );
      }

      // Update environment variables for enabled gateways
      const enabledGateways = gateways.filter((g: any) => g.enabled);
      for (const gateway of enabledGateways) {
        if (gateway.testMode) {
          // Set test environment variables
          process.env[`${gateway.id.toUpperCase()}_PUBLIC_KEY_TEST`] = gateway.apiKeys.publicKey;
          process.env[`${gateway.id.toUpperCase()}_SECRET_KEY_TEST`] = gateway.apiKeys.secretKey;
          if (gateway.apiKeys.webhookSecret) {
            process.env[`${gateway.id.toUpperCase()}_WEBHOOK_SECRET_TEST`] = gateway.apiKeys.webhookSecret;
          }
        } else {
          // Set production environment variables
          process.env[`${gateway.id.toUpperCase()}_PUBLIC_KEY`] = gateway.apiKeys.publicKey;
          process.env[`${gateway.id.toUpperCase()}_SECRET_KEY`] = gateway.apiKeys.secretKey;
          if (gateway.apiKeys.webhookSecret) {
            process.env[`${gateway.id.toUpperCase()}_WEBHOOK_SECRET`] = gateway.apiKeys.webhookSecret;
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Payment settings saved successfully',
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error saving payment settings:', error);
    return NextResponse.json(
      { error: 'Failed to save payment settings' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
} 