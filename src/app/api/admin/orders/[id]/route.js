import { NextResponse } from 'next/server';
import models from '../../../../../models/index.js';

const { Order, OrderItem, Product, DamagedStock } = models;

export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();
    const { status, paymentStatus, shippingAddress, returnItems } = body;

    const order = await Order.findByPk(id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const oldStatus = order.status;
    const newStatus = status || oldStatus;
    
    // Manage stock increments/decrements based on status transition
    if (newStatus === 'cancelled' && oldStatus !== 'cancelled') {
      // Restore stock
      try {
        const orderItems = await OrderItem.findAll({ where: { orderId: id } });
        for (const item of orderItems) {
          await Product.increment('stock', { by: item.quantity, where: { id: item.productId } });
        }
        console.log(`[Inventory] Restored stock for cancelled Order #${id}`);
      } catch (err) {
        console.error('Error restoring stock for cancelled order:', err);
      }
    } else if (oldStatus === 'cancelled' && newStatus !== 'cancelled') {
      // Re-deduct stock if un-cancelled
      try {
        const orderItems = await OrderItem.findAll({ where: { orderId: id } });
        for (const item of orderItems) {
          await Product.decrement('stock', { by: item.quantity, where: { id: item.productId } });
        }
        console.log(`[Inventory] Re-deducted stock for un-cancelled Order #${id}`);
      } catch (err) {
        console.error('Error re-deducting stock for un-cancelled order:', err);
      }
    } else if (newStatus === 'returned' && oldStatus !== 'returned') {
      // Process Returned stock modes: Resale vs Exp/Damage
      try {
        if (Array.isArray(returnItems)) {
          for (const item of returnItems) {
            if (item.mode === 'resale') {
              // Take back stock (resale mode)
              await Product.increment('stock', { by: item.quantity, where: { id: item.productId } });
              console.log(`[Returned - Resale] Restored ${item.quantity} stock for Product ID ${item.productId}`);
            } else if (item.mode === 'damaged') {
              // Save to Expired / Damaged stock logs (no product stock change)
              await DamagedStock.create({
                orderId: id,
                productId: item.productId,
                productName: item.productName || 'Returned Product',
                variant: item.variant || null,
                quantity: item.quantity,
                reason: 'Returned Expired/Damaged'
              });
              console.log(`[Returned - Damaged] Logged ${item.quantity} damaged stock for Product ID ${item.productId}`);
            }
          }
        }
      } catch (err) {
        console.error('Error processing returned order stock adjustments:', err);
      }
    }

    // Update the Order status
    await Order.update({
      status: newStatus,
      paymentStatus: paymentStatus ?? order.paymentStatus,
      ...(shippingAddress !== undefined && { shippingAddress })
    }, {
      where: { id }
    });

    const updatedOrder = await Order.findByPk(id);
    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('[API Admin Order Item] PUT Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const order = await Order.findByPk(id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // First delete associated Order Items (to prevent foreign key constraint violations)
    await OrderItem.destroy({ where: { orderId: id } });

    // Then delete the Order record
    await order.destroy();

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully.'
    });
  } catch (error) {
    console.error('[API Admin Order Item] DELETE Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

