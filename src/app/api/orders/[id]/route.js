import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import models from '../../../../models/index.js';

const { Order, OrderItem } = models;

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('vedicana_session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized. Please login again.' }, { status: 401 });
    }

    let decoded;
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_key_vedicana_auth_xyz123');
      const { payload } = await jwtVerify(token, secret);
      decoded = payload;
    } catch (err) {
      return NextResponse.json({ error: 'Invalid session. Please login.' }, { status: 401 });
    }

    const orderObj = await Order.findByPk(id);
    if (!orderObj) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    // Verify ownership: either the user who placed the order or an admin
    if (orderObj.userId !== decoded.id && decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. You do not have permission to delete this order.' }, { status: 403 });
    }

    // First delete associated Order Items (to prevent foreign key constraint violations)
    await OrderItem.destroy({ where: { orderId: id } });

    // Then delete the Order record
    await orderObj.destroy();

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully.'
    });

  } catch (error) {
    console.error('Delete Order Error:', error);
    return NextResponse.json({ error: 'An error occurred while deleting the order.' }, { status: 500 });
  }
}
