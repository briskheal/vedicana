import { NextResponse } from 'next/server';
import models from '../../../../../../models/index.js';

const { Order, OrderItem, Product } = models;

export async function POST(request, { params }) {
  try {
    const { id } = params;

    const order = await Order.findByPk(id, {
      include: [{ model: OrderItem, as: 'items' }]
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.paymentStatus !== 'verification_pending' && order.paymentMethod !== 'upi_direct') {
      return NextResponse.json({ error: 'Order is not pending UPI verification' }, { status: 400 });
    }

    // Mark as paid and processing
    await order.update({
      paymentStatus: 'paid',
      status: 'processing'
    });

    // Decrement inventory since the payment is now confirmed
    try {
      const orderItems = await OrderItem.findAll({ where: { orderId: id } });
      for (const item of orderItems) {
        await Product.decrement('stock', { by: item.quantity, where: { id: item.productId } });
      }
    } catch (stockErr) {
      console.error('[ERROR] Decrementing inventory stock on UPI approve:', stockErr);
    }

    return NextResponse.json({ success: true, message: 'Payment approved successfully', order });
  } catch (error) {
    console.error("UPI Approve Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
