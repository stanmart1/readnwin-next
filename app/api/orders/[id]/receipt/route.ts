import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/utils/database';
import { pdfService, ReceiptData } from '@/utils/pdf-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const orderId = parseInt(params.id);
    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: 'Invalid order ID' },
        { status: 400 }
      );
    }

    // Get order details
    const orderResult = await query(
      'SELECT * FROM orders WHERE id = $1',
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const order = orderResult.rows[0];

    // Check if user has access to this order
    const userId = parseInt(session.user.id);
    const isAdmin = session.user.role === 'admin' || session.user.role === 'super_admin';
    
    if (order.user_id !== userId && !isAdmin) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get order items
    const itemsResult = await query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [orderId]
    );

    const orderItems = itemsResult.rows;

    // Get user details
    const userResult = await query(
      'SELECT first_name, last_name, email FROM users WHERE id = $1',
      [order.user_id]
    );

    const user = userResult.rows[0];

    // Prepare receipt data
    const receiptData: ReceiptData = {
      orderNumber: order.order_number || `ORDER-${order.id}`,
      orderDate: new Date(order.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      customerName: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Customer' : 'Customer',
      customerEmail: user?.email || '',
      items: orderItems.map(item => ({
        title: item.title || 'Unknown Item',
        author: item.author_name || 'Unknown Author',
        format: item.format || 'Unknown',
        quantity: parseInt(item.quantity) || 1,
        unitPrice: parseFloat(item.price) || 0,
        totalPrice: parseFloat(item.total_price) || 0
      })),
      subtotal: parseFloat(order.subtotal) || 0,
      taxAmount: parseFloat(order.tax_amount) || 0,
      shippingAmount: parseFloat(order.shipping_amount) || 0,
      discountAmount: parseFloat(order.discount_amount) || 0,
      totalAmount: parseFloat(order.total_amount) || 0,
      paymentMethod: order.payment_method || 'N/A',
      transactionId: order.payment_transaction_id || 'N/A',
      status: order.status || 'pending'
    };

    console.log('Generating receipt PDF for order:', orderId);
    console.log('Receipt data:', JSON.stringify(receiptData, null, 2));

    // Generate PDF
    const pdfBuffer = await pdfService.generateReceiptPDF(receiptData);

    console.log('PDF generated successfully, size:', pdfBuffer.length);

    // Return PDF with appropriate headers
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="receipt-${order.order_number || order.id}.pdf"`,
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('Error generating receipt PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate receipt PDF' },
      { status: 500 }
    );
  }
} 