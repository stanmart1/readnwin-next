import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/utils/database';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has admin permissions
    const userRole = session.user.role;
    const isAdmin = userRole === 'admin' || userRole === 'super_admin';
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      );
    }

    const proofId = parseInt(params.id);
    if (isNaN(proofId)) {
      return NextResponse.json(
        { error: 'Invalid proof ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, notes } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Get current proof
    const currentProof = await query(
      'SELECT * FROM payment_proofs WHERE id = $1',
      [proofId]
    );

    if (currentProof.rows.length === 0) {
      return NextResponse.json(
        { error: 'Payment proof not found' },
        { status: 404 }
      );
    }

    const proof = currentProof.rows[0];

    // Update proof status
    const result = await query(
      `UPDATE payment_proofs 
       SET status = $2, is_verified = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [proofId, status, status === 'verified']
    );

    const updatedProof = result.rows[0];

    // Add note if provided (don't fail if this errors)
    if (notes) {
      try {
        await query(
          `INSERT INTO order_notes (order_id, user_id, note, is_internal, note_type)
           VALUES ($1, $2, $3, true, 'proof_status_update')`,
          [proof.bank_transfer_id, parseInt(session.user.id), notes]
        );
      } catch (noteError) {
        console.error('Error adding note (non-critical):', noteError);
        // Continue execution - this is not critical
      }
    }

    // Log admin action (don't fail if this errors)
    try {
      await query(`
        INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        parseInt(session.user.id),
        'PROOF_STATUS_UPDATE',
        'payment_proofs',
        proofId,
        JSON.stringify({ 
          old_is_verified: proof.is_verified,
          new_status: status, 
          notes 
        }),
        'admin_dashboard'
      ]);
    } catch (auditError) {
      console.error('Error logging audit (non-critical):', auditError);
      // Continue execution - this is not critical
    }

    console.log('✅ Proof status update successful:', {
      proofId,
      newStatus: status,
      updatedProof: updatedProof ? updatedProof.id : null
    });

    return NextResponse.json({
      success: true,
      proof: updatedProof,
      message: 'Proof status updated successfully'
    });

  } catch (error) {
    console.error('❌ Error in PATCH /api/payment/bank-transfer/proofs/[id]/status:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
} 