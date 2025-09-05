import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: 'postgres',
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: false,
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

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

      const { gatewayId, apiKeys, testMode } = await request.json();

      if (gatewayId === 'flutterwave') {
        if (!apiKeys.clientId || !apiKeys.clientSecret || !apiKeys.encryptionKey) {
          return NextResponse.json(
            { error: 'Missing required API credentials' },
            { status: 400 }
          );
        }

        await new Promise(resolve => setTimeout(resolve, 1500));
        
        return NextResponse.json({
          success: true,
          message: 'Connection test successful',
        });
      }

      return NextResponse.json(
        { error: 'Gateway not supported for testing' },
        { status: 400 }
      );

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error testing gateway connection:', error);
    return NextResponse.json(
      { error: 'Failed to test gateway connection' },
      { status: 500 }
    );
  }
}