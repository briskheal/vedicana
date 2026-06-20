import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { Op } from 'sequelize';
import Razorpay from 'razorpay';
import models from '../../../models/index.js';

const { Order, OrderItem, Product, Coupon, User } = models;

function calculateVariantPrice(basePrice, selectedVariant, baseVariant) {
  const parse = (str) => {
    if (!str) return null;
    const match = str.match(/(\d+)\s*(ML|GM|KG|L)/i);
    if (!match) return null;
    return { val: parseInt(match[1], 10), unit: match[2].toUpperCase() };
  };

  const base = parse(baseVariant);
  const sel = parse(selectedVariant);

  if (!base || !sel || base.unit !== sel.unit || base.val === 0) {
    return basePrice;
  }

  const ratio = sel.val / base.val;
  if (ratio === 1) return basePrice;

  let multiplier = ratio;
  if (ratio < 1) {
    multiplier = Math.max(ratio, ratio * 1.15);
  } else {
    multiplier = ratio * (1 - Math.min(0.2, (ratio - 1) * 0.08));
  }

  const estimated = basePrice * multiplier;
  return Math.round(estimated / 5) * 5;
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

export async function POST(request) {
  try {
    const { cartItems, shippingInfo, paymentMethod, couponCode } = await request.json();

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const userId = await getUserId();

    // Secure Verification for First-Time User Coupon (FIRSTSPIN10)
    if (couponCode && couponCode.toUpperCase().trim() === 'FIRSTSPIN10') {
      const email = shippingInfo?.email;
      const firstTime = await isFirstTimeUser(userId, email);
      if (!firstTime) {
        return NextResponse.json({ 
          error: 'The FIRSTSPIN10 coupon is strictly valid for your first order only!' 
        }, { status: 400 });
      }
    }
    // Allow guest checkout by setting userId to null if not logged in.
    
    // 1. Verify Prices & Calculate Subtotal
    let subtotal = 0;
    const productIds = cartItems.map(item => item.id);
    const dbProducts = await Product.findAll({ where: { id: productIds } });
    
    const validItems = [];

    for (const item of cartItems) {
      const dbProduct = dbProducts.find(p => p.id === item.id);
      if (dbProduct) {
        let activePrice = parseFloat(dbProduct.sale_price || dbProduct.price);
        
        // Parse variant pricing if a variant is selected
        if (item.selectedVariant) {
          try {
            const addInfo = typeof dbProduct.additional_info === 'string'
              ? JSON.parse(dbProduct.additional_info)
              : dbProduct.additional_info;
            
            let matchedPriceSet = false;
            
            if (addInfo?.variants && Array.isArray(addInfo.variants)) {
              const matched = addInfo.variants.find(sv => sv.size === item.selectedVariant);
              if (matched) {
                const targetPrice = matched.sale_price !== null && matched.sale_price !== undefined && matched.sale_price !== '' 
                  ? matched.sale_price 
                  : matched.price;
                activePrice = parseFloat(targetPrice);
                matchedPriceSet = true;
              }
            }
            
            if (!matchedPriceSet) {
              const variantStr = addInfo?.Variant || addInfo?.variant || '';
              const variants = variantStr.split(',').map(v => v.trim()).filter(Boolean);
              const baseVariant = variants[0] || '';
              if (baseVariant) {
                activePrice = calculateVariantPrice(parseFloat(dbProduct.sale_price || dbProduct.price), item.selectedVariant, baseVariant);
              }
            }
          } catch (e) {
            console.error("Failed to parse variant in checkout:", e);
          }
        }

        subtotal += activePrice * parseInt(item.quantity, 10);
        validItems.push({
          productId: dbProduct.id,
          quantity: item.quantity,
          price: activePrice,
          selectedVariant: item.selectedVariant || null
        });
      }
    }

    // 2. Apply Coupon
    let discountAmount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({ where: { code: couponCode, isActive: true } });
      if (coupon) {
        if (subtotal >= parseFloat(coupon.minOrderValue)) {
          appliedCoupon = coupon.code;
          if (coupon.discountType === 'percentage') {
            discountAmount = (subtotal * parseFloat(coupon.discountValue)) / 100;
          } else {
            discountAmount = parseFloat(coupon.discountValue);
          }
        }
      }
    }

    const shippingFee = subtotal < 500 ? 50 : 0;
    const totalAmount = Math.max(0, subtotal - discountAmount) + shippingFee;

    // 3. Create Order in DB
    const newOrder = await Order.create({
      totalAmount,
      status: paymentMethod === 'cod' ? 'processing' : 'pending',
      paymentStatus: 'pending',
      paymentMethod,
      couponCode: appliedCoupon,
      discountAmount,
      shippingAddress: JSON.stringify(shippingInfo),
      userId: userId || null
    });

    // Automatically update User table fields (phone/address) with checkout details if missing
    if (userId && shippingInfo) {
      try {
        const userObj = await User.findByPk(userId);
        if (userObj) {
          let updated = false;
          if (!userObj.phone && shippingInfo.phone) {
            userObj.phone = shippingInfo.phone;
            updated = true;
          }
          if (!userObj.address) {
            const formattedAddress = [
              shippingInfo.address,
              shippingInfo.city,
              shippingInfo.state,
              shippingInfo.pincode
            ].filter(Boolean).join(', ');
            userObj.address = formattedAddress;
            updated = true;
          }
          if (updated) {
            await userObj.save();
          }
        }
      } catch (err) {
        console.error("Failed to automatically update user details during checkout:", err);
      }
    }

    // 4. Create Order Items & Manage Inventory Stock (for COD)
    for (const item of validItems) {
      await OrderItem.create({
        orderId: newOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        variant: item.selectedVariant || null
      });

      if (paymentMethod === 'cod') {
        await Product.decrement('stock', { by: item.quantity, where: { id: item.productId } });
      }
    }

    // 5. Handle Payment Method
    if (paymentMethod === 'cod' || paymentMethod === 'upi_direct') {
      const fullOrder = await Order.findByPk(newOrder.id, { include: [{ model: OrderItem, include: [Product] }] });
      
      let email = shippingInfo?.billingEmail || shippingInfo?.email || '';
      let name = shippingInfo?.billingFirstName ? `${shippingInfo.billingFirstName} ${shippingInfo.billingLastName}` : shippingInfo?.name || 'Customer';
      
      try {
        if (!email && userId) {
          const uObj = await User.findByPk(userId);
          if (uObj) {
            email = email || uObj.email;
            name = name === 'Customer' ? (uObj.name || 'Customer') : name;
          }
        }
      } catch (e) {}
      
      // Async email sending without awaiting to not block checkout response
      import('../../../lib/orderMailer.js').then(({ sendOrderConfirmation }) => {
        sendOrderConfirmation(fullOrder, email, name);
      }).catch(err => console.error('Failed to load mailer:', err));
    }

    if (paymentMethod === 'cod') {
      return NextResponse.json({ success: true, orderId: newOrder.id, method: 'cod' });
    } else if (paymentMethod === 'upi_direct') {
      return NextResponse.json({
        success: true,
        method: 'upi_direct',
        internalOrderId: newOrder.id,
        amount: totalAmount
      });
    } else {
      return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
    }

  } catch (error) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
