import { NextResponse } from 'next/server';
import AbandonedCart from '@/models/AbandonedCart';
import { sendAbandonedCartReminder } from '@/lib/orderMailer';

export async function POST(req) {
  try {
    const { cartId, email } = await req.json();

    if (!cartId || !email) {
      return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
    }

    const cart = await AbandonedCart.findByPk(cartId);
    if (!cart) {
      return NextResponse.json({ success: false, error: 'Cart not found' }, { status: 404 });
    }

    const cartData = typeof cart.cartData === 'string' ? JSON.parse(cart.cartData) : cart.cartData;

    const emailSent = await sendAbandonedCartReminder(email, cartData);

    if (emailSent) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: 'Failed to dispatch email' }, { status: 500 });
    }
  } catch (error) {
    console.error('Abandoned cart recovery API error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
