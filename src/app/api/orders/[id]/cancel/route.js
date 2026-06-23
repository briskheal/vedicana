import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import nodemailer from 'nodemailer';
import models from '../../../../../models/index.js';

const { Order, OrderItem, Product } = models;

const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 2525,
  auth: { user: 'apikey', pass: process.env.SENDGRID_API_KEY },
});

async function sendCancellationEmails(order, decoded) {
  try {
    let shippingInfo = {};
    try { shippingInfo = typeof order.shippingAddress === 'string' ? JSON.parse(order.shippingAddress) : order.shippingAddress; } catch (e) {}
    const customerEmail = shippingInfo?.billingEmail || shippingInfo?.email || decoded?.email || '';
    const customerName = shippingInfo?.billingFirstName ? `${shippingInfo.billingFirstName} ${shippingInfo.billingLastName}` : shippingInfo?.name || 'Customer';

    const refundMsg = order.paymentMethod === 'cod'
      ? 'Since this was a Cash on Delivery order, no payment was charged.'
      : 'Your refund will be processed within 5–7 business days to your original payment method.';

    const customerHtml = `
      <!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#333;background:#f9f9f9;padding:20px;">
      <div style="max-width:600px;margin:0 auto;background:#fff;padding:30px;border-radius:8px;">
        <h2 style="color:#1a5c38;">Order Cancelled — #${order.id}</h2>
        <p>Dear ${customerName},</p>
        <p>Your order <strong>#${order.id}</strong> has been successfully <strong>cancelled</strong>.</p>
        <p>${refundMsg}</p>
        <p>If you have any questions, please contact us at <a href="mailto:info@vedicana.com">info@vedicana.com</a>.</p>
        <p style="margin-top:30px;">Warm regards,<br/><strong>VediCana Organics Team</strong></p>
      </div></body></html>`;

    const adminHtml = `
      <!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#333;padding:20px;">
      <h2>⚠️ Order #${order.id} Cancelled</h2>
      <p>Customer <strong>${customerName}</strong> (${customerEmail}) has cancelled order <strong>#${order.id}</strong>.</p>
      <p><strong>Total:</strong> ₹${order.totalAmount} | <strong>Payment:</strong> ${order.paymentMethod.toUpperCase()}</p>
      <p><strong>Refund Status:</strong> Pending — please process within 5–7 business days.</p>
      </body></html>`;

    if (customerEmail) {
      await transporter.sendMail({ from: '"VediCana Organics" <info@vedicana.com>', to: customerEmail, subject: `Order #${order.id} Cancelled — Refund Initiated`, html: customerHtml });
    }
    await transporter.sendMail({ from: '"VediCana Website" <info@vedicana.com>', to: 'info@vedicana.com', subject: `[Action Required] Order #${order.id} Cancelled — Refund Pending`, html: adminHtml });
  } catch (e) {
    console.error('Cancellation email error:', e.message);
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('vedicana_session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized. Please login.' }, { status: 401 });

    let decoded;
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_key_vedicana_auth_xyz123');
      const { payload } = await jwtVerify(token, secret);
      decoded = payload;
    } catch {
      return NextResponse.json({ error: 'Invalid session.' }, { status: 401 });
    }

    const order = await Order.findByPk(id, { include: [{ model: OrderItem, include: [Product] }] });
    if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    if (order.userId !== decoded.id && decoded.role !== 'admin') return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });

    const cancellableStatuses = ['pending', 'processing'];
    if (!cancellableStatuses.includes(order.status)) {
      return NextResponse.json({ error: `Cannot cancel an order with status: ${order.status}.` }, { status: 400 });
    }

    // Restore product stock
    const items = order.OrderItems || [];
    for (const item of items) {
      if (item.Product) {
        await item.Product.increment('stock', { by: item.quantity });
      }
    }

    // Update order status and refund status
    await order.update({ status: 'cancelled', refundStatus: order.paymentMethod === 'cod' ? 'none' : 'pending' });

    // Send emails asynchronously
    sendCancellationEmails(order, decoded);

    return NextResponse.json({ success: true, message: 'Order cancelled successfully. Refund will be processed within 5–7 business days.' });

  } catch (error) {
    console.error('Cancel Order Error:', error);
    return NextResponse.json({ error: 'An error occurred while cancelling the order.' }, { status: 500 });
  }
}
