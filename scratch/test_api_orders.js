import 'dotenv/config';
import models from '../src/models/index.js';

const { Order, OrderItem, Product, DamagedStock } = models;

async function test() {
  try {
    // 1. Get first order with items to test
    const order = await Order.findOne({
      include: [{ model: OrderItem, include: [Product] }]
    });
    if (!order) {
      console.log("No orders found to test.");
      return;
    }

    console.log(`Testing with Order ID: ${order.id}`);
    
    // Simulate returnItems list matching frontend structure
    const returnItems = (order.OrderItems || []).map(item => ({
      productId: item.productId,
      productName: item.Product?.title || 'Returned Product',
      variant: item.variant || null,
      quantity: item.quantity,
      mode: 'damaged' // test damaged write-off path
    }));

    console.log("Prepared return items for test:", JSON.stringify(returnItems, null, 2));

    // Run the exact database logic inside api/admin/orders/[id]/route.js
    console.log("Starting transaction/actions simulation...");

    for (const item of returnItems) {
      if (item.mode === 'resale') {
        await Product.increment('stock', { by: item.quantity, where: { id: item.productId } });
        console.log(`[Resale Test] Increment stock by ${item.quantity} for Product ${item.productId}`);
      } else if (item.mode === 'damaged') {
        console.log("Creating DamagedStock record...");
        const result = await DamagedStock.create({
          orderId: order.id,
          productId: item.productId,
          productName: item.productName,
          variant: item.variant,
          quantity: item.quantity,
          reason: 'Returned Expired/Damaged'
        });
        console.log("DamagedStock created successfully:", result.toJSON());
      }
    }

    console.log("Order return logic simulation completed successfully with no errors!");
  } catch (err) {
    console.error("CRITICAL ERROR during simulation:", err);
  }
}

test();
