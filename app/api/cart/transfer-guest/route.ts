import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/utils/database';
import { CartItem } from '@/types/ecommerce';

interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 /api/cart/transfer-guest called');
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log('❌ No session found');
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { guest_cart_items, shipping_address, shipping_method } = body;
    console.log('📦 Received guest cart items:', guest_cart_items?.length || 0);

    if (!guest_cart_items || !Array.isArray(guest_cart_items)) {
      console.log('❌ Invalid guest cart items format');
      return NextResponse.json(
        { success: false, error: 'Invalid guest cart items' },
        { status: 400 }
      );
    }

    if (guest_cart_items.length === 0) {
      console.log('📭 No guest cart items to transfer');
      return NextResponse.json({
        success: true,
        message: 'Successfully transferred 0 items from guest cart',
        details: {
          totalItems: 0,
          transferred: 0,
          failed: 0,
          shippingDataSaved: false,
          shippingMethod: shipping_method,
          results: []
        }
      });
    }

    const userId = parseInt(session.user.id);
    console.log('👤 User ID:', userId);
    const transferResults = [];
    let totalTransferred = 0;
    let totalFailed = 0;
    let shippingDataSaved = false;

    // Process each guest cart item
    for (const guestItem of guest_cart_items) {
      try {
        const { book_id, quantity } = guestItem;
        console.log(`🔄 Processing guest cart item: book_id=${book_id}, quantity=${quantity}`);

        // Validate the item
        if (!book_id || !quantity || quantity < 1) {
          console.error('❌ Invalid guest cart item:', guestItem);
          totalFailed++;
          continue;
        }

        // Check if book exists and is available
        const bookCheck = await query(
          'SELECT id, title, price, stock_quantity, format FROM books WHERE id = $1 AND status = $2',
          [book_id, 'published']
        );

        if (bookCheck.rows.length === 0) {
          console.error('❌ Book not found or not available:', book_id);
          totalFailed++;
          continue;
        }

        const book = bookCheck.rows[0];
        console.log(`✅ Book found: "${book.title}", format: ${book.format}, stock: ${book.stock_quantity}`);

        // For physical books, check stock but allow transfer for guest cart items
        // (users should be able to transfer their cart even if stock is currently 0)
        if (book.format !== 'ebook' && book.stock_quantity < quantity) {
          console.log('⚠️ Physical book has insufficient stock, but allowing transfer for guest cart:', book_id, 'requested:', quantity, 'available:', book.stock_quantity);
          // Don't fail the transfer, just log a warning
          // The user will see the out-of-stock status when they try to checkout
        }

        // Check if item already exists in user's cart
        const existingItem = await query(
          'SELECT id, quantity FROM cart_items WHERE user_id = $1 AND book_id = $2',
          [userId, book_id]
        );

        if (existingItem.rows.length > 0) {
          // Update existing item quantity
          const currentQuantity = existingItem.rows[0].quantity;
          const newQuantity = currentQuantity + quantity;
          console.log(`🔄 Updating existing cart item: old_quantity=${currentQuantity}, new_quantity=${newQuantity}`);

          await query(
            'UPDATE cart_items SET quantity = $1, created_at = CURRENT_TIMESTAMP WHERE id = $2',
            [newQuantity, existingItem.rows[0].id]
          );

          transferResults.push({
            book_id,
            action: 'updated',
            old_quantity: currentQuantity,
            new_quantity: newQuantity,
            title: book.title
          });
        } else {
          // Add new item to cart
          console.log(`🆕 Adding new item to cart: book_id=${book_id}, quantity=${quantity}`);
          await query(
            'INSERT INTO cart_items (user_id, book_id, quantity, created_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)',
            [userId, book_id, quantity]
          );

          transferResults.push({
            book_id,
            action: 'added',
            quantity,
            title: book.title
          });
        }

        totalTransferred++;
        console.log(`✅ Successfully processed item: book_id=${book_id}, totalTransferred=${totalTransferred}`);

      } catch (itemError) {
        console.error('❌ Error processing guest cart item:', guestItem, itemError);
        totalFailed++;
      }
    }

    // Save shipping data if provided
    if (shipping_address && shipping_method) {
      try {
        // Map shipping address to handle both interface formats
        const mappedShippingAddress = {
          first_name: shipping_address.firstName || shipping_address.first_name || '',
          last_name: shipping_address.lastName || shipping_address.last_name || '',
          email: shipping_address.email || '',
          phone: shipping_address.phone || '',
          address_line_1: shipping_address.addressLine1 || shipping_address.address || '',
          address_line_2: shipping_address.addressLine2 || shipping_address.addressLine2 || '',
          city: shipping_address.city || '',
          state: shipping_address.state || '',
          postal_code: shipping_address.postalCode || shipping_address.zip_code || '',
          country: shipping_address.country || ''
        };

        // Store shipping data in user_shipping_addresses table (create if doesn't exist)
        await query(`
          CREATE TABLE IF NOT EXISTS user_shipping_addresses (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            first_name VARCHAR(100),
            last_name VARCHAR(100),
            email VARCHAR(255),
            phone VARCHAR(20),
            address_line_1 VARCHAR(255),
            address_line_2 VARCHAR(255),
            city VARCHAR(100),
            state VARCHAR(100),
            postal_code VARCHAR(20),
            country VARCHAR(100),
            is_default BOOLEAN DEFAULT false,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Insert shipping address
        await query(`
          INSERT INTO user_shipping_addresses 
          (user_id, first_name, last_name, email, phone, address_line_1, address_line_2, city, state, postal_code, country, is_default)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true)
          ON CONFLICT DO NOTHING
        `, [
          userId,
          mappedShippingAddress.first_name,
          mappedShippingAddress.last_name,
          mappedShippingAddress.email,
          mappedShippingAddress.phone,
          mappedShippingAddress.address_line_1,
          mappedShippingAddress.address_line_2,
          mappedShippingAddress.city,
          mappedShippingAddress.state,
          mappedShippingAddress.postal_code,
          mappedShippingAddress.country
        ]);

        shippingDataSaved = true;
      } catch (shippingError) {
        console.error('Error saving shipping data:', shippingError);
        // Don't fail the entire transfer if shipping data save fails
      }
    }

    // Log the transfer operation
    await query(
      `INSERT INTO audit_logs 
       (user_id, action, resource_type, resource_id, details, ip_address, user_agent) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        userId,
        'guest_cart_transfer',
        'cart_items',
        userId,
        JSON.stringify({
          guest_items_count: guest_cart_items.length,
          had_shipping_data: !!(shipping_address && shipping_method),
          transferred: totalTransferred,
          failed: totalFailed,
          shipping_data_saved: shippingDataSaved,
          results: transferResults
        }),
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        request.headers.get('user-agent') || 'unknown'
      ]
    );

    console.log(`📊 Transfer summary: totalItems=${guest_cart_items.length}, transferred=${totalTransferred}, failed=${totalFailed}`);

    // Verify the transfer by checking the user's cart
    const verifyCart = await query(
      'SELECT COUNT(*) as count FROM cart_items WHERE user_id = $1',
      [userId]
    );
    console.log(`✅ Verification: User now has ${verifyCart.rows[0].count} items in cart`);

    return NextResponse.json({
      success: true,
      message: `Successfully transferred ${totalTransferred} items from guest cart`,
      details: {
        totalItems: guest_cart_items.length,
        transferred: totalTransferred,
        failed: totalFailed,
        shippingDataSaved,
        shippingMethod: shipping_method,
        results: transferResults,
        verification: {
          userCartItems: parseInt(verifyCart.rows[0].count)
        }
      }
    });

  } catch (error) {
    console.error('Error transferring guest cart:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to transfer guest cart' },
      { status: 500 }
    );
  }
} 