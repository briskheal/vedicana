import { NextResponse } from 'next/server';
import models from '../../../../models/index.js';

const { Order, OrderItem, Product, User } = models;

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

    // Send the email ONLY now that they've submitted the UTR
    try {
      const fullOrder = await Order.findByPk(order.id, { include: [{ model: OrderItem, include: [Product] }] });
      
      let shippingInfo = {};
      try {
        shippingInfo = typeof order.shippingAddress === 'string' ? JSON.parse(order.shippingAddress) : order.shippingAddress;
      } catch (e) {}

      let email = shippingInfo?.billingEmail || shippingInfo?.email || '';
      let name = shippingInfo?.billingFirstName ? `${shippingInfo.billingFirstName} ${shippingInfo.billingLastName}` : shippingInfo?.name || 'Customer';
      
      if (!email && order.userId) {
        const uObj = await User.findByPk(order.userId);
        if (uObj) {
          email = email || uObj.email;
          name = name === 'Customer' ? (uObj.name || 'Customer') : name;
        }
      }

      import('../../../../lib/orderMailer.js').then(({ sendOrderConfirmation }) => {
        sendOrderConfirmation(fullOrder, email, name);
      }).catch(err => console.error('Failed to load mailer:', err));
    } catch (e) {
      console.error('Error triggering UPI confirmation email:', e);
    }

    return NextResponse.json({ success: true, message: 'UTR submitted for verification' });
    
  } catch (error) {
    console.error("UPI Verification Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
