import { NextResponse } from 'next/server';
import models from '../../../../models/index.js';

const { DamagedStock, Product } = models;

export async function GET() {
  try {
    const list = await DamagedStock.findAll({
      order: [['createdAt', 'DESC']],
      include: [{ model: Product, attributes: ['title', 'price', 'image'] }]
    });
    return NextResponse.json(list);
  } catch (error) {
    console.error('[API Admin Inventory] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { productId, variant, quantity, reason } = await request.json();
    
    if (!productId || !quantity || !reason) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      return NextResponse.json({ error: 'Quantity must be a positive integer' }, { status: 400 });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Decrement stock in database (warehouse damage audit adjustment)
    product.stock = Math.max(0, product.stock - qty);
    await product.save();

    const record = await DamagedStock.create({
      productId,
      productName: product.title,
      variant: variant || null,
      quantity: qty,
      reason: reason // 'Expired' or 'Damage'
    });

    return NextResponse.json({ success: true, record });
  } catch (error) {
    console.error('[API Admin Inventory] POST Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
