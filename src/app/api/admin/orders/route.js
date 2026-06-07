import { NextResponse } from 'next/server';
import models from '../../../../models/index.js';

const { Order, User, OrderItem, Product } = models;

export async function GET() {
  try {
    const orders = await Order.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, attributes: ['name', 'email'] },
        {
          model: OrderItem,
          include: [{ model: Product, attributes: ['title', 'price'] }]
        }
      ]
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('[API Admin Orders] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
