import { NextResponse } from 'next/server';
import User from '../../../../models/User.js';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { email, pin, newPassword } = await request.json();

    if (!email || !pin || !newPassword) {
      return NextResponse.json({ error: 'Missing email, PIN, or new password.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ where: { email: cleanEmail } });

    if (!user) {
      return NextResponse.json({ error: 'No account found with this email address.' }, { status: 404 });
    }

    // Check if pin matches
    if (!user.reset_pin || user.reset_pin !== pin) {
      return NextResponse.json({ error: 'Invalid verification PIN.' }, { status: 400 });
    }

    // Check if pin is expired
    if (!user.reset_pin_expires || new Date() > new Date(user.reset_pin_expires)) {
      return NextResponse.json({ error: 'Verification PIN has expired. Please request a new one.' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters long.' }, { status: 400 });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Save user's updated password and clear the PIN fields
    user.password = hashedPassword;
    user.reset_pin = null;
    user.reset_pin_expires = null;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully!'
    });

  } catch (error) {
    console.error('Reset Password API Error:', error);
    return NextResponse.json({ error: 'An error occurred while resetting the password.' }, { status: 500 });
  }
}
