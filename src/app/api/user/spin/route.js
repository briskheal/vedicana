import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import User from '@/models/User';

export async function POST(req) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // Find the user
    const user = await User.findByPk(decoded.userId);
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
