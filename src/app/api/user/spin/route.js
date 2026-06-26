import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import models from '../../../../models/index.js';

const { User } = models;

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('vedicana_session')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_key_vedicana_auth_xyz123');
    const { payload } = await jwtVerify(token, secret);
    
    // Find the user
    const user = await User.findByPk(payload.id);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Check if they have already claimed spin points
    if (user.hasSpunWheel) {
      return NextResponse.json({ 
        success: false, 
        error: 'You have already claimed your Spin Wheel bonus points!' 
      }, { status: 400 });
    }

    // Grant 100 points and mark as claimed
    user.points = (user.points || 0) + 100;
    user.hasSpunWheel = true;
    await user.save();

    return NextResponse.json({ 
      success: true, 
      message: '100 points added successfully!',
      newPoints: user.points
    });

  } catch (error) {
    console.error('Spin Wheel claim error:', error);
    return NextResponse.json({ success: false, error: 'Failed to claim spin bonus' }, { status: 500 });
  }
}
