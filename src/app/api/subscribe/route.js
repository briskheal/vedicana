import { NextResponse } from 'next/server';
import models from '../../../models/index.js';

const { Subscriber } = models;

export async function POST(request) {
  try {
    const { email } = await request.json();

    // 1. Validation
    if (!email) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    // 2. Check if already subscribed
    const existing = await Subscriber.findOne({
      where: {
        email: email.toLowerCase().trim()
      }
    });

    if (existing) {
      if (existing.is_active) {
        return NextResponse.json({ 
          success: true, 
          message: 'You are already subscribed to our newsletter!' 
        }, { status: 200 });
      } else {
        // Reactivate subscription
        existing.is_active = true;
        await existing.save();
        return NextResponse.json({
          success: true,
          message: 'Welcome back! Your subscription has been reactivated.'
        }, { status: 200 });
      }
    }

    // 3. Create subscriber
    await Subscriber.create({
      email: email.toLowerCase().trim(),
      is_active: true
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you for subscribing to the VediCana newsletter!'
    }, { status: 201 });

  } catch (error) {
    console.error('Newsletter Subscribe Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to complete subscription' }, { status: 500 });
  }
}
