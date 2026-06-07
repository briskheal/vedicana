import { NextResponse } from 'next/server';
import crypto from 'crypto';
import models from '../../../../models/index.js';

const { Order, OrderItem, Product } = models;

export async function POST(request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, internalOrderId } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !internalOrderId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // Signature is valid. Update order in database.
      await Order.update(
        { 
          status: 'processing', 
          paymentStatus: 'paid' 
        }, 
        { 
          where: { id: internalOrderId } 
        }
      );

      // Decrement Inventory Stock on payment validation
      try {
        const orderItems = await OrderItem.findAll({ where: { orderId: internalOrderId } });
        for (const item of orderItems) {
          await Product.decrement('stock', { by: item.quantity, where: { id: item.productId } });
        }
        console.log(`[SUCCESS] Stock decremented successfully for Order #${internalOrderId}`);
      } catch (stockErr) {
        console.error('[ERROR] Decrementing inventory stock on verify:', stockErr);
      }

      return NextResponse.json({ success: true, message: 'Payment verified successfully' });
    } else {
      await Order.update(
        { paymentStatus: 'failed' },
        { where: { id: internalOrderId } }
      );
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
  } catch (error) {
    console.error("Verification Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
