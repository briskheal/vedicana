import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import nodemailer from 'nodemailer';
import models from '../../../../../models/index.js';

const { Order } = models;

const transporter = nodemailer.createTransport({
  host: process.env.ZOHO_SMTP_HOST || 'smtp.zoho.in',
  port: parseInt(process.env.ZOHO_SMTP_PORT || '465', 10),
  secure: true,
  auth: {
    user: process.env.ZOHO_SMTP_USER || 'info@vedicana.com',
    pass: process.env.ZOHO_SMTP_PASS,
  },
});

const RETURN_WINDOW_DAYS = 7;

async function sendReturnEmails(order, decoded) {
  try {
    let shippingInfo = {};
    try { shippingInfo = typeof order.shippingAddress === 'string' ? JSON.parse(order.shippingAddress) : order.shippingAddress; } catch (e) {}
    const customerEmail = shippingInfo?.billingEmail || shippingInfo?.email || decoded?.email || '';
    const customerName = shippingInfo?.billingFirstName ? `${shippingInfo.billingFirstName} ${shippingInfo.billingLastName}` : shippingInfo?.name || 'Customer';

    const customerHtml = `
      <!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#333;background:#f9f9f9;padding:20px;">
      <div style="max-width:600px;margin:0 auto;background:#fff;padding:30px;border-radius:8px;">
        <h2 style="color:#1a5c38;">Return Request Received — Order #${order.id}</h2>
        <p>Dear ${customerName},</p>
        <p>We have received your return request for order <strong>#${order.id}</strong>.</p>
        <p>Our team will inspect your returned goods and process the refund within <strong>7–10 business days</strong> after receiving the item.</p>
        <p>Please ensure the product is returned in its original packaging. For assistance, contact <a href="mailto:info@vedicana.com">info@vedicana.com</a>.</p>
        <p style="margin-top:30px;">Warm regards,<br/><strong>VediCana Organics Team</strong></p>
      </div></body></html>`;

    const adminHtml = `
      <!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#333;padding:20px;">
      <h2>🔄 Return Requested — Order #${order.id}</h2>
      <p>Customer <strong>${customerName}</strong> (${customerEmail}) has requested a return for order <strong>#${order.id}</strong>.</p>
      <p><strong>Total:</strong> ₹${order.totalAmount} | <strong>Payment:</strong> ${order.paymentMethod.toUpperCase()}</p>
      <p><strong>Action Required:</strong> Coordinate pickup and inspect goods before processing the refund (7–10 business days).</p>
      </body></html>`;

    if (customerEmail) {
      await transporter.sendMail({ from: '"VediCana Organics" <info@vedicana.com>', to: customerEmail, subject: `Return Request Confirmed — Order #${order.id}`, html: customerHtml });
    }
    await transporter.sendMail({ from: '"VediCana Website" <info@vedicana.com>', to: 'info@vedicana.com', subject: `[Action Required] Return Request — Order #${order.id}`, html: adminHtml });
  } catch (e) {
    console.error('Return email error:', e.message);
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

    const order = await Order.findByPk(id);
    if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    if (order.userId !== decoded.id && decoded.role !== 'admin') return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });

    if (order.status !== 'delivered') {
      return NextResponse.json({ error: 'Returns can only be requested for delivered orders.' }, { status: 400 });
    }

    // Check 7-day return window
    const deliveredDate = order.deliveredAt ? new Date(order.deliveredAt) : new Date(order.updatedAt);
    const now = new Date();
    const daysSinceDelivery = Math.floor((now - deliveredDate) / (1000 * 60 * 60 * 24));
    if (daysSinceDelivery > RETURN_WINDOW_DAYS) {
      return NextResponse.json({
        error: `Return window has expired. Returns are only accepted within ${RETURN_WINDOW_DAYS} days of delivery.`
      }, { status: 400 });
    }

    await order.update({ status: 'returned', refundStatus: order.paymentMethod === 'cod' ? 'none' : 'pending' });

    // Send emails asynchronously
    sendReturnEmails(order, decoded);

    return NextResponse.json({ success: true, message: 'Return request submitted. Our team will contact you within 24 hours.' });

  } catch (error) {
    console.error('Return Order Error:', error);
    return NextResponse.json({ error: 'An error occurred while processing your return request.' }, { status: 500 });
  }
}
