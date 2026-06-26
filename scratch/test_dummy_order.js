import models from '../src/models/index.js';
import fs from 'fs';
import path from 'path';

const { User, Product, Order, OrderItem } = models;

async function runTest() {
  try {
    console.log("=== RUNNING DUMMY ORDER TEST WITH LOYALTY GUARDRAILS ===");
    
    // 1. Read settings
    const cfgPath = path.join(process.cwd(), 'public/settings_config.json');
    const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf-8'));
    console.log("Loaded Loyalty Settings:", {
      spin_coins: cfg.loyalty_spin_coins,
      cashback_percent: cfg.loyalty_cashback_percent,
      max_redeem_percent: cfg.loyalty_max_redeem_percent,
      min_order_value: cfg.loyalty_min_order_value
    });

    // 2. Find or create dummy user
    let user = await User.findOne({ where: { email: 'dummy_tester@vedicana.com' } });
    if (!user) {
      user = await User.create({
        name: 'Dummy Tester',
        email: 'dummy_tester@vedicana.com',
        password: 'dummy_password_xyz123',
        points: 100,
        role: 'customer'
      });
    } else {
      user.points = 100; // reset to 100
      await user.save();
    }
    console.log(`Dummy User: ${user.name} (${user.email}), Starting Points: ${user.points}`);

    // 3. Test Case A: Order value below min threshold (e.g. 299 vs 399)
    let subtotalA = 299;
    let pointsDiscountA = 0;
    if (user.points > 0 && subtotalA >= cfg.loyalty_min_order_value) {
      const cap = Math.floor((subtotalA * cfg.loyalty_max_redeem_percent) / 100);
      pointsDiscountA = Math.min(user.points, cap, subtotalA);
    }
    console.log(`Test Case A (Subtotal ₹${subtotalA} < Min ₹${cfg.loyalty_min_order_value}): Points Discount Allowed = ₹${pointsDiscountA}`);
    if (pointsDiscountA !== 0) throw new Error("Guardrail FAILED: Points allowed below min order threshold!");

    // 4. Test Case B: Order value above threshold (e.g. 500)
    let subtotalB = 500;
    let pointsDiscountB = 0;
    if (user.points > 0 && subtotalB >= cfg.loyalty_min_order_value) {
      const cap = Math.floor((subtotalB * cfg.loyalty_max_redeem_percent) / 100); // 15% of 500 = 75
      pointsDiscountB = Math.min(user.points, cap, subtotalB); // min(100, 75, 500) = 75
    }
    console.log(`Test Case B (Subtotal ₹${subtotalB} >= Min ₹${cfg.loyalty_min_order_value}): Points Discount Allowed = ₹${pointsDiscountB} (Cap is 15% = ₹75)`);
    if (pointsDiscountB !== 75) throw new Error(`Guardrail FAILED: Expected ₹75 discount, got ₹${pointsDiscountB}`);

    // 5. Create Dummy Order B in DB
    const order = await Order.create({
      totalAmount: subtotalB - pointsDiscountB,
      status: 'pending',
      paymentStatus: 'paid',
      paymentMethod: 'upi_direct',
      discountAmount: pointsDiscountB,
      shippingAddress: JSON.stringify({ name: user.name, email: user.email, address: "Test St" }),
      userId: user.id
    });
    console.log(`Created Dummy Order ID: ${order.id}`);

    // Deduct points
    user.points -= pointsDiscountB;
    await user.save();
    console.log(`Dummy User remaining points after order: ${user.points} (Expected 25)`);
    if (user.points !== 25) throw new Error(`Points deduction mismatch: Expected 25, got ${user.points}`);

    console.log("=== ALL DUMMY ORDER TESTS PASSED SUCCESSFULLY! ===");
    process.exit(0);
  } catch(err) {
    console.error("TEST FAILED:", err);
    process.exit(1);
  }
}

runTest();
