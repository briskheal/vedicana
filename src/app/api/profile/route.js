import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import User from '../../../models/User.js';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('vedicana_session')?.value;

    if (!token) {
      return NextResponse.json({ loggedIn: false });
    }

    let decoded;
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_key_vedicana_auth_xyz123');
      const { payload } = await jwtVerify(token, secret);
      decoded = payload;
    } catch (err) {
      return NextResponse.json({ loggedIn: false });
    }

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return NextResponse.json({ loggedIn: false });
    }

    return NextResponse.json({
      loggedIn: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Profile GET Error:', error);
    return NextResponse.json({ loggedIn: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('vedicana_session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized. Please login again.' }, { status: 401 });
    }

    let decoded;
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_key_vedicana_auth_xyz123');
      const { payload } = await jwtVerify(token, secret);
      decoded = payload;
    } catch (err) {
      return NextResponse.json({ error: 'Invalid or expired session. Please login again.' }, { status: 401 });
    }

    const { name, phone, address, currentPassword, newPassword } = await request.json();

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // Basic fields update
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;

    // Password change logic
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required to set a new password.' }, { status: 400 });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'New password must be at least 6 characters long.' }, { status: 400 });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Profile Update Error:', error);
    return NextResponse.json({ error: 'An error occurred while updating your profile.' }, { status: 500 });
  }
}
