import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { Op } from 'sequelize';
import models from '../../../../models/index.js';

const { Coupon, Order, User } = models;

async function getUserId() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('vedicana_session')?.value;
    if (!token) return null;
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_key_vedicana_auth_xyz123');
    const { payload } = await jwtVerify(token, secret);
    return payload.id;
  } catch {
    return null;
  }
}

async function isFirstTimeUser(userId, email) {
  // 1. If logged in, check by userId
  if (userId) {
    const ordersCount = await Order.count({
      where: {
        userId,
        [Op.or]: [
          { paymentStatus: 'paid' },
          { paymentMethod: 'cod' }
        ]
      }
    });
    if (ordersCount > 0) return false;
  }

  // 2. If email is provided, check if a registered user with this email has orders
  if (email) {
    const cleanEmail = email.toLowerCase().trim();
    const regUser = await User.findOne({ where: { email: cleanEmail } });
    if (regUser) {
      const regUserOrders = await Order.count({
        where: {
          userId: regUser.id,
          [Op.or]: [
            { paymentStatus: 'paid' },
            { paymentMethod: 'cod' }
          ]
        }
      });
      if (regUserOrders > 0) return false;
    }

    // Check if any guest orders exist with this email in the JSON shippingAddress
    const guestOrders = await Order.count({
      where: {
        shippingAddress: {
          [Op.like]: `%"email":"${cleanEmail}"%`
        },
        [Op.or]: [
          { paymentStatus: 'paid' },
          { paymentMethod: 'cod' }
        ]
      }
    });
    if (guestOrders > 0) return false;
  }

  return true;
}

export async function POST(request) {
  try {
    const { code, cartTotal, email } = await request.json();

    if (!code) {
      return NextResponse.json({ valid: false, error: 'Please enter a coupon code.' }, { status: 400 });
    }

    const coupon = await Coupon.findOne({ where: { code, isActive: true } });

    if (!coupon) {
      return NextResponse.json({ valid: false, error: 'Coupon "'+code+'" does not exist!' }, { status: 404 });
    }

    // Secure Verification for First-Time User Coupon (FIRSTSPIN10)
    if (code.toUpperCase().trim() === 'FIRSTSPIN10') {
      const userId = await getUserId();
      const firstTime = await isFirstTimeUser(userId, email);
      if (!firstTime) {
        return NextResponse.json({ 
          valid: false, 
          error: 'The FIRSTSPIN10 coupon is strictly valid for your first order only!' 
        }, { status: 400 });
      }
    }

    if (cartTotal < parseFloat(coupon.minOrderValue)) {
      return NextResponse.json({ 
        valid: false, 
        error: `The minimum spend for this coupon is ₹${coupon.minOrderValue}.` 
      }, { status: 400 });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (cartTotal * parseFloat(coupon.discountValue)) / 100;
    } else {
      discountAmount = parseFloat(coupon.discountValue);
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      discountAmount
    });

  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json({ valid: false, error: 'Internal server error' }, { status: 500 });
  }
}
