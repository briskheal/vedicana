import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import Order from '../../../models/Order.js';

export async function POST(request) {
  try {
    const { amount, cartItems, shippingInfo } = await request.json();

    if (!amount || !cartItems) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Create an order in Razorpay (amount must be in paise)
    const options = {
      amount: amount * 100, // convert INR to paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      payment_capture: 1 // Auto capture
    };

    const order = await razorpay.orders.create(options);
    
    // Here we could also insert the pending order into our Postgres DB
    // using the Order model we created, storing the Razorpay Order ID.
    // e.g. await Order.create({ total: amount, razorpay_order_id: order.id, ... })

    return NextResponse.json({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
      key_id: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error("Razorpay Order Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
