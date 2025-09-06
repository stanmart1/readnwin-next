import { sanitizeInput, sanitizeQuery, validateId, sanitizeHtml } from '@/lib/security';
import { requireAdmin, requirePermission } from '@/middleware/auth';
import logger from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/utils/database';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
  } catch (error) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    logger.info('🔍 Database health check requested');

    // Test basic connection
    const connectionTest = await query('SELECT NOW() as current_time, version() as db_version');
    
    // Check if required tables exist
    const tableCheck = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'books', 'orders', 'reviews')
      ORDER BY table_name
    `);

    const existingTables = tableCheck.rows.map(row => row.table_name);
    const requiredTables = ['users', 'books', 'orders', 'reviews'];
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));

    // Get table counts for existing tables
    const tableCounts = {};
    for (const table of existingTables) {
      try {
        const countResult = await query(`SELECT COUNT(*) as count FROM ${table}`);
        (tableCounts as any)[table] = parseInt(countResult.rows[0].count) || 0;
      } catch (e) {
        (tableCounts as any)[table] = `Error: ${e instanceof Error ? e.message : 'Unknown error'}`;
      }
    }

    return NextResponse.json({
      success: true,
      connection: {
        status: 'connected',
        current_time: connectionTest.rows[0]?.current_time,
        db_version: connectionTest.rows[0]?.db_version?.split(' ')[0]
      },
      tables: {
        existing: existingTables,
        missing: missingTables,
        counts: tableCounts
      },
      diagnosis: {
        canConnect: true,
        hasRequiredTables: missingTables.length === 0,
        issues: missingTables.length > 0 ? [`Missing tables: ${missingTables.join(', ')}`] : []
      }
    });

  } catch (error) {
    logger.error('❌ Database health check failed:', error);
    
    return NextResponse.json({
      success: false,
      connection: {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      diagnosis: {
        canConnect: false,
        hasRequiredTables: false,
        issues: ['Cannot connect to database']
      }
    }, { status: 500 });
  }
}