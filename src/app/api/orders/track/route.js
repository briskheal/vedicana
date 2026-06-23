import { NextResponse } from 'next/server';
import models from '../../../../models/index.js';

const { Order, OrderItem, Product, User } = models;

export async function POST(request) {
  try {
    const { orderId, contact } = await request.json();

    if (!orderId || !contact) {
      return NextResponse.json({ error: 'Order ID and Email/Phone are required' }, { status: 400 });
    }

    const order = await Order.findByPk(orderId, {
      include: [
        { model: OrderItem, include: [Product] },
        { model: User }
      ]
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Verify contact
    const contactLower = contact.toLowerCase().trim();
    let isMatch = false;

    // 1. Check User table if linked
    if (order.User) {
      if (order.User.email?.toLowerCase() === contactLower || order.User.phone === contactLower) {
        isMatch = true;
      }
    }

    // 2. Check shippingAddress JSON
    if (!isMatch && order.shippingAddress) {
      try {
        const addr = JSON.parse(order.shippingAddress);
        if (
          addr.billingEmail?.toLowerCase() === contactLower || 
          addr.billingPhone === contactLower ||
          addr.email?.toLowerCase() === contactLower ||
          addr.phone === contactLower ||
          addr.shippingEmail?.toLowerCase() === contactLower ||
          addr.shippingPhone === contactLower
        ) {
          isMatch = true;
        }
      } catch (e) {
        // Fallback string search
        if (order.shippingAddress.toLowerCase().includes(contactLower)) {
          isMatch = true;
        }
      }
    }

    if (!isMatch) {
      return NextResponse.json({ error: 'Order found, but the provided Email/Phone does not match our records for this order.' }, { status: 403 });
    }

    // Return safe data
    return NextResponse.json({
      id: order.id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      totalAmount: order.totalAmount,
      trackingNumber: order.trackingNumber,
      courierPartner: order.courierPartner,
      createdAt: order.createdAt,
      items: order.OrderItems.map(item => ({
        id: item.id,
        productName: item.Product?.title || 'Unknown Product',
        image: item.Product?.images ? JSON.parse(item.Product.images)[0] : null,
        quantity: item.quantity,
        price: item.price,
        variant: item.variant
      })),
      shippingAddress: order.shippingAddress
    });

  } catch (err) {
    console.error('Order Tracking Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
