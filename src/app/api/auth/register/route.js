import { NextResponse } from 'next/server';
import User from '../../../../models/User.js';
import bcrypt from 'bcryptjs';
import { checkRateLimit } from '../../../../lib/rateLimit.js';
import { verifyRecaptcha } from '../../../../lib/recaptcha.js';

export async function POST(request) {
  try {
    // 1. Rate Limiting Check
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip, 5, 15 * 60 * 1000)) { // Max 5 requests per 15 mins
      return NextResponse.json({ error: 'Too many registration attempts. Please try again later.' }, { status: 429 });
    }

    const { firstName, lastName, email, password, phone, address, city, state, pincode, recaptchaToken } = await request.json();

    // 2. reCAPTCHA Verification
    if (recaptchaToken) {
      const isValidCaptcha = await verifyRecaptcha(recaptchaToken);
      if (!isValidCaptcha) {
        return NextResponse.json({ error: 'Security check failed. You appear to be a bot.' }, { status: 403 });
      }
    }

    if (!email || !password || !firstName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const name = lastName ? `${firstName} ${lastName}`.trim() : firstName.trim();

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user in Postgres with full captured billing details
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || null,
      address: JSON.stringify({ address, city, state, pincode })
    });

    return NextResponse.json({ message: 'User created successfully', userId: newUser.id }, { status: 201 });
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
