import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import models from '../../../../models/index.js';

const { Order, OrderItem } = models;

// PATCH — Admin only: update shipment info / status
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('vedicana_session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    let decoded;
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_key_vedicana_auth_xyz123');
      const { payload } = await jwtVerify(token, secret);
      decoded = payload;
    } catch {
      return NextResponse.json({ error: 'Invalid session.' }, { status: 401 });
    }

    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const order = await Order.findByPk(id);
    if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });

    const body = await request.json();
    const allowedFields = ['status', 'trackingNumber', 'courierPartner', 'refundStatus', 'deliveredAt', 'paymentStatus'];
    const updates = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) updates[field] = body[field];
    }

    // Auto-set deliveredAt when status changes to 'delivered'
    if (updates.status === 'delivered' && !order.deliveredAt) {
      updates.deliveredAt = new Date();
    }

    await order.update(updates);
    return NextResponse.json({ success: true, message: 'Order updated.', order: order.toJSON() });

  } catch (error) {
    console.error('PATCH Order Error:', error);
    return NextResponse.json({ error: 'Failed to update order.' }, { status: 500 });
  }
}

// DELETE — Admin only (customers can no longer delete orders)
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('vedicana_session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    let decoded;
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_key_vedicana_auth_xyz123');
      const { payload } = await jwtVerify(token, secret);
      decoded = payload;
    } catch {
      return NextResponse.json({ error: 'Invalid session.' }, { status: 401 });
    }

    // Only admins can hard-delete orders
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Only administrators can delete orders.' }, { status: 403 });
    }

    const order = await Order.findByPk(id);
    if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });

    await OrderItem.destroy({ where: { orderId: id } });
    await order.destroy();

    return NextResponse.json({ success: true, message: 'Order deleted successfully.' });

  } catch (error) {
    console.error('DELETE Order Error:', error);
    return NextResponse.json({ error: 'Failed to delete order.' }, { status: 500 });
  }
}
