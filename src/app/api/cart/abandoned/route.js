import { NextResponse } from 'next/server';
import AbandonedCart from '@/models/AbandonedCart';

export async function POST(req) {
  try {
    const { email, cartData } = await req.json();

    if (!email || !cartData || cartData.length === 0) {
      return NextResponse.json({ success: false, error: 'Missing required data' }, { status: 400 });
    }

    // Find existing unrecovered cart for this email
    let cart = await AbandonedCart.findOne({
      where: { email, isRecovered: false }
    });

    if (cart) {
      cart.cartData = cartData;
      cart.lastActive = new Date();
      await cart.save();
    } else {
      cart = await AbandonedCart.create({
        email,
        cartData,
      });
    }

    return NextResponse.json({ success: true, id: cart.id });
  } catch (error) {
    console.error('Abandoned Cart save error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save draft cart' }, { status: 500 });
  }
}
