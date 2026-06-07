import 'dotenv/config';
import models from '../src/models/index.js';

async function listOrders() {
  try {
    const { Order } = models;
    const orders = await Order.findAll({ attributes: ['id'] });
    console.log('Existing Order IDs in Database: ' + orders.map(o => o.id).join(', '));
    process.exit(0);
  } catch (error) {
    console.error('Failed to list orders:', error);
    process.exit(1);
  }
}

listOrders();
