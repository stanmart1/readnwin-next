import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ecommerceService } from '@/utils/ecommerce-service-new';
import { query } from '@/utils/database';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Test checkout API called');
    
    const session = await getServerSession(authOptions);
    console.log('🔍 Session:', JSON.stringify(session, null, 2));
    
    if (!session?.user?.id) {
      console.log('❌ No session or user ID');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);
    console.log('🔍 User ID:', userId);

    // Test database connection
    console.log('🔍 Testing database connection...');
    const dbTest = await query('SELECT NOW() as current_time');
    console.log('✅ Database connection successful:', dbTest.rows[0]);

    // Test cart items retrieval
    console.log('🔍 Testing cart items retrieval...');
    const cartItems = await ecommerceService.getCartItems(userId);
    console.log('✅ Cart items retrieved:', cartItems.length);

    // Test cart analytics
    console.log('🔍 Testing cart analytics...');
    const analytics = await ecommerceService.getCartAnalytics(userId);
    console.log('✅ Cart analytics retrieved:', analytics);

    // Test payment gateways
    console.log('🔍 Testing payment gateways...');
    const gateways = await query('SELECT * FROM payment_gateways WHERE enabled = true');
    console.log('✅ Payment gateways retrieved:', gateways.rows.length);

    // Test email template service
    console.log('🔍 Testing email template service...');
    try {
      const { emailTemplateService } = await import('@/utils/email-template-service');
      const templates = await emailTemplateService.getTemplates({ is_active: true });
      console.log('✅ Email templates retrieved:', templates.length);
    } catch (emailError) {
      console.warn('⚠️ Email template service test failed:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Checkout API components are working correctly',
      data: {
        userId,
        cartItemsCount: cartItems.length,
        analytics,
        paymentGatewaysCount: gateways.rows.length,
        databaseConnected: true
      }
    });

  } catch (error) {
    console.error('❌ Test checkout API error:', error);
    return NextResponse.json(
      { 
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 