import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Pool } from 'pg';

// Database configuration - No fallbacks, environment variables only
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: false, // SSL is disabled for the new database
});

// POST - Save individual gateway settings
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Gateway API: Starting request processing...');

    // Check authentication
    const session = await getServerSession(authOptions);
    console.log('🔍 Gateway API: Session check result:', {
      hasSession: !!session,
      hasUserId: !!session?.user?.id,
      userId: session?.user?.id,
      userRole: session?.user?.role
    });

    if (!session?.user?.id) {
      console.log('❌ Gateway API: Authentication failed - no session or user ID');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const client = await pool.connect();
    try {
      console.log('🔍 Gateway API: Checking user role...');
      const userResult = await client.query(
        'SELECT role FROM users WHERE id = $1',
        [session.user.id]
      );

      console.log('🔍 Gateway API: User query result:', {
        rowsFound: userResult.rows.length,
        userRole: userResult.rows[0]?.role
      });

      if (userResult.rows.length === 0 || userResult.rows[0].role !== 'admin') {
        console.log('❌ Gateway API: Admin access denied');
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        );
      }

      // Parse request body
      console.log('🔍 Gateway API: Parsing request body...');
      const body = await request.json();
      const { gateway } = body;
      
      console.log('🔍 Gateway API: Request body parsed:', {
        hasGateway: !!gateway,
        gatewayId: gateway?.id,
        gatewayName: gateway?.name
      });

      // Validate required fields
      if (!gateway || !gateway.id) {
        console.log('❌ Gateway API: Missing gateway data');
        return NextResponse.json(
          { error: 'Gateway data is required' },
          { status: 400 }
        );
      }

      // Prepare gateway data for database
      const gatewayData = {
        gateway_id: gateway.id,
        name: gateway.name,
        enabled: gateway.enabled,
        test_mode: gateway.testMode,
        public_key: gateway.apiKeys?.publicKey || null,
        secret_key: gateway.apiKeys?.secretKey || null,
        webhook_secret: gateway.apiKeys?.webhookSecret || null,
        hash: gateway.apiKeys?.hash || null,
        status: gateway.status || 'inactive',
        updated_at: new Date(),
      };

      console.log('🔍 Gateway API: Prepared gateway data:', {
        gatewayId: gatewayData.gateway_id,
        name: gatewayData.name,
        enabled: gatewayData.enabled,
        hasBankAccount: !!gateway.bankAccount
      });

      // For bank transfer gateway, also save bank account information
      if (gateway.id === 'bank_transfer' && gateway.bankAccount) {
        console.log('🔍 Gateway API: Processing bank transfer gateway...');
        
        // Save bank account information to a separate table or as JSON in config field
        const bankAccountConfig = {
          bankName: gateway.bankAccount.bankName || '',
          accountNumber: gateway.bankAccount.accountNumber || '',
          accountName: gateway.bankAccount.accountName || '',
          accountType: gateway.bankAccount.accountType || '',
          instructions: gateway.bankAccount.instructions || '',
        };

        console.log('🔍 Gateway API: Bank account config:', bankAccountConfig);

        // Update the gateway with bank account config
        await client.query(
          `INSERT INTO payment_gateways 
           (gateway_id, name, enabled, test_mode, public_key, secret_key, webhook_secret, hash, status, config, updated_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
             config = $10,
             updated_at = $11`,
          [
            gatewayData.gateway_id,
            gatewayData.name,
            gatewayData.enabled,
            gatewayData.test_mode,
            gatewayData.public_key,
            gatewayData.secret_key,
            gatewayData.webhook_secret,
            gatewayData.hash,
            gatewayData.status,
            JSON.stringify(bankAccountConfig),
            gatewayData.updated_at,
          ]
        );
        
        console.log('✅ Gateway API: Bank transfer gateway updated successfully');
      } else {
        console.log('🔍 Gateway API: Processing regular gateway...');
        
        // For other gateways, save without bank account config
        await client.query(
          `INSERT INTO payment_gateways 
           (gateway_id, name, enabled, test_mode, public_key, secret_key, webhook_secret, hash, status, updated_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
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
             updated_at = $10`,
          [
            gatewayData.gateway_id,
            gatewayData.name,
            gatewayData.enabled,
            gatewayData.test_mode,
            gatewayData.public_key,
            gatewayData.secret_key,
            gatewayData.webhook_secret,
            gatewayData.hash,
            gatewayData.status,
            gatewayData.updated_at,
          ]
        );
        
        console.log('✅ Gateway API: Regular gateway updated successfully');
      }

      console.log('✅ Gateway API: Request completed successfully');
      return NextResponse.json({
        success: true,
        message: `${gateway.name} settings saved successfully`,
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ Gateway API: Error occurred:', error);
    console.error('❌ Gateway API: Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('❌ Gateway API: Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      code: (error as any)?.code || 'Unknown'
    });
    
    return NextResponse.json(
      { error: 'Failed to save gateway settings', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

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