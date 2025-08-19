import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/utils/database";
import { sendOrderStatusUpdateEmail } from "@/utils/email";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin permissions
    const userRoles = session.user.roles || [];
    const isAdmin =
      userRoles.includes("admin") || userRoles.includes("super_admin");

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Access denied. Admin privileges required." },
        { status: 403 },
      );
    }

    const orderId = parseInt(params.id);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const body = await request.json();
    const { payment_status, notes } = body;

    if (!payment_status) {
      return NextResponse.json(
        { error: "Payment status is required" },
        { status: 400 },
      );
    }

    // Get current order with user details
    const currentOrder = await query(
      `SELECT o.*, u.email as user_email, u.username, u.first_name, u.last_name
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.id = $1`,
      [orderId],
    );

    if (currentOrder.rows.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = currentOrder.rows[0];
    const oldPaymentStatus = order.payment_status;

    // Update payment status and order status if payment is confirmed
    const shouldUpdateOrderStatus =
      payment_status === "paid" && oldPaymentStatus !== "paid";
    const newOrderStatus = shouldUpdateOrderStatus ? "confirmed" : order.status;

    const result = await query(
      `UPDATE orders
       SET payment_status = $2, status = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [orderId, payment_status, newOrderStatus],
    );

    const updatedOrder = result.rows[0];

    // Add note if provided
    if (notes) {
      try {
        await query(
          `INSERT INTO order_notes (order_id, user_id, note, is_internal, note_type)
           VALUES ($1, $2, $3, true, 'payment_status_update')`,
          [orderId, parseInt(session.user.id), notes],
        );
      } catch (noteError) {
        console.error("Error adding note (non-critical):", noteError);
      }
    }

    // Clear cart if payment is confirmed for bank transfer
    if (
      shouldUpdateOrderStatus &&
      order.payment_method === "bank_transfer" &&
      order.user_id
    ) {
      try {
        await query("DELETE FROM cart_items WHERE user_id = $1", [
          order.user_id,
        ]);
        console.log(
          "✅ Cart cleared for user after bank transfer payment confirmation",
        );
      } catch (cartError) {
        console.error("❌ Error clearing cart (non-critical):", cartError);
      }
    }

    // Add books to user's library if payment is confirmed
    if (shouldUpdateOrderStatus && order.user_id) {
      try {
        // Parse order items
        const orderItems =
          typeof order.order_items === "string"
            ? JSON.parse(order.order_items)
            : order.order_items;

        if (Array.isArray(orderItems)) {
          for (const item of orderItems) {
            if (item.book_id) {
              // Check if user already has access to this book
              const existingAccess = await query(
                "SELECT id FROM user_books WHERE user_id = $1 AND book_id = $2",
                [order.user_id, item.book_id],
              );

              if (existingAccess.rows.length === 0) {
                // Grant access to the book
                await query(
                  `INSERT INTO user_books (user_id, book_id, purchased_at, is_active)
                   VALUES ($1, $2, NOW(), true)`,
                  [order.user_id, item.book_id],
                );
              }
            }
          }
          console.log("✅ Books added to user library");
        }
      } catch (libraryError) {
        console.error(
          "❌ Error adding books to library (non-critical):",
          libraryError,
        );
      }
    }

    // Send email notification if payment status changed and user has email
    if (oldPaymentStatus !== payment_status && order.user_email) {
      try {
        const userName =
          order.first_name && order.last_name
            ? `${order.first_name} ${order.last_name}`
            : order.username || "Customer";

        const orderDetails = {
          orderNumber: order.id,
          orderId: order.id,
          status: payment_status === "paid" ? "confirmed" : payment_status,
          statusDescription: getPaymentStatusDescription(payment_status),
          paymentMethod: order.payment_method,
          totalAmount: order.total_amount,
          currency: order.currency || "NGN",
          items:
            typeof order.order_items === "string"
              ? JSON.parse(order.order_items)
              : order.order_items,
        };

        await sendOrderStatusUpdateEmail(
          order.user_email,
          orderDetails,
          userName,
        );
        console.log("✅ Order status update email sent to user");
      } catch (emailError) {
        console.error(
          "❌ Error sending email notification (non-critical):",
          emailError,
        );
      }
    }

    // Log admin action
    try {
      await query(
        `
        INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address)
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
        [
          parseInt(session.user.id),
          "PAYMENT_STATUS_UPDATE",
          "orders",
          orderId,
          JSON.stringify({
            old_payment_status: oldPaymentStatus,
            new_payment_status: payment_status,
            old_order_status: order.status,
            new_order_status: newOrderStatus,
            payment_method: order.payment_method,
            notes,
          }),
          request.headers.get("x-forwarded-for") || "admin_dashboard",
        ],
      );
    } catch (auditError) {
      console.error("Error logging audit (non-critical):", auditError);
    }

    console.log("✅ Payment status update successful:", {
      orderId,
      oldPaymentStatus,
      newPaymentStatus: payment_status,
      orderStatus: newOrderStatus,
      cartCleared:
        shouldUpdateOrderStatus && order.payment_method === "bank_transfer",
      emailSent: oldPaymentStatus !== payment_status && order.user_email,
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: "Payment status updated successfully",
      actions: {
        cartCleared:
          shouldUpdateOrderStatus && order.payment_method === "bank_transfer",
        emailSent: oldPaymentStatus !== payment_status && order.user_email,
        libraryUpdated: shouldUpdateOrderStatus,
      },
    });
  } catch (error) {
    console.error(
      "❌ Error in PATCH /api/admin/orders/[id]/payment-status:",
      error,
    );
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

function getPaymentStatusDescription(status: string): string {
  switch (status) {
    case "pending":
      return "Your payment is being processed. We will notify you once confirmed.";
    case "paid":
      return "Your payment has been confirmed! You now have access to your purchased books.";
    case "failed":
      return "Your payment could not be processed. Please try again or contact support.";
    case "cancelled":
      return "Your payment has been cancelled. No charges have been made.";
    case "refunded":
      return "Your payment has been refunded. The amount will be credited back to your account.";
    case "partially_refunded":
      return "Part of your payment has been refunded. Check your account for details.";
    default:
      return "Your order status has been updated.";
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRoles = session.user.roles || [];
    const isAdmin =
      userRoles.includes("admin") || userRoles.includes("super_admin");

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Access denied. Admin privileges required." },
        { status: 403 },
      );
    }

    const orderId = parseInt(params.id);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    // Get order payment status history
    const result = await query(
      `SELECT o.id, o.payment_status, o.status, o.payment_method, o.updated_at,
              u.email as user_email, u.username, u.first_name, u.last_name
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.id = $1`,
      [orderId],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Get payment status history from audit logs
    const auditResult = await query(
      `SELECT created_at, details, user_id
       FROM audit_logs
       WHERE resource_type = 'orders' AND resource_id = $1 AND action = 'PAYMENT_STATUS_UPDATE'
       ORDER BY created_at DESC`,
      [orderId],
    );

    return NextResponse.json({
      order: result.rows[0],
      history: auditResult.rows,
    });
  } catch (error) {
    console.error(
      "❌ Error in GET /api/admin/orders/[id]/payment-status:",
      error,
    );
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
