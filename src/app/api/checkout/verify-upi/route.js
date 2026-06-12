import { NextResponse } from 'next/server';
import models from '../../../../models/index.js';

const { Order } = models;

export async function POST(request) {
  try {
    const { orderId, utr } = await request.json();

    if (!orderId || !utr) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Verify order exists and is pending
    const order = await Order.findByPk(orderId);
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.paymentMethod !== 'upi_direct') {
      return NextResponse.json({ error: 'Invalid payment method for this operation' }, { status: 400 });
    }

    // Save the UTR and change status to verification_pending
    await order.update({
      upi_utr: utr,
      paymentStatus: 'verification_pending'
    });

    return NextResponse.json({ success: true, message: 'UTR submitted for verification' });
    
  } catch (error) {
    console.error("UPI Verification Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
