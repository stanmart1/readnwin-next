import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/utils/database';

// GET - Retrieve enabled payment gateways for checkout
export async function GET(request: NextRequest) {
  try {
    // Get enabled payment gateways from database
    const gatewaysResult = await query(`
      SELECT 
        gateway_id,
        name,
        description,
        enabled,
        test_mode,
        status
      FROM payment_gateways 
      WHERE enabled = true
      ORDER BY gateway_id
    `);

    // Format gateways for frontend consumption
    const gateways = gatewaysResult.rows.map(gateway => ({
      id: gateway.gateway_id,
      gateway_id: gateway.gateway_id,
      name: gateway.name,
      description: gateway.description,
      enabled: gateway.enabled,
      testMode: gateway.test_mode,
      status: gateway.status,
      icon: getGatewayIcon(gateway.gateway_id),
      features: getGatewayFeatures(gateway.gateway_id),
      supportedCurrencies: ['NGN']
    }));

    return NextResponse.json({
      success: true,
      gateways
    });

  } catch (error) {
    console.error('Error retrieving payment gateways:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve payment gateways' },
      { status: 500 }
    );
  }
}

// Helper function to get gateway-specific icons
function getGatewayIcon(gatewayId: string): string {
  switch (gatewayId) {
    case 'flutterwave':
      return 'ri-bank-card-line';
    case 'bank_transfer':
      return 'ri-bank-line';
    case 'paystack':
      return 'ri-secure-payment-line';
    default:
      return 'ri-secure-payment-line';
  }
}

// Helper function to get gateway-specific features
function getGatewayFeatures(gatewayId: string): string[] {
  switch (gatewayId) {
    case 'flutterwave':
      return ['Mobile Money', 'Bank Transfers', 'Credit Cards', 'USSD', 'QR Payments'];
    case 'bank_transfer':
      return ['Bank Transfers', 'Proof of Payment', 'Manual Verification'];
    case 'paystack':
      return ['Credit Cards', 'Bank Transfers', 'Mobile Money', 'USSD'];
    default:
      return ['Secure Payment Processing'];
  }
} 