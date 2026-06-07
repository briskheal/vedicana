import 'dotenv/config';
import models, { sequelize } from '../models/index.js';

async function syncDb() {
  try {
    await sequelize.authenticate();
    console.log('Connection established successfully.');
    await sequelize.sync({ alter: true });
    console.log('Database synced successfully.');

    // Seed default Spin to Win coupons
    const { Coupon } = models;
    const spinCoupons = [
      { code: 'FIRSTSPIN10', discountType: 'percentage', discountValue: 10.00, minOrderValue: 0.00 },
      { code: 'SPINCONSULT', discountType: 'percentage', discountValue: 0.00, minOrderValue: 0.00 },
      { code: 'SPINDOSHA', discountType: 'percentage', discountValue: 0.00, minOrderValue: 0.00 },
      { code: 'SPINCOINS', discountType: 'percentage', discountValue: 0.00, minOrderValue: 0.00 },
      { code: 'SPINGIFT', discountType: 'percentage', discountValue: 0.00, minOrderValue: 1000.00 },
      { code: 'SPINGUIDE', discountType: 'percentage', discountValue: 0.00, minOrderValue: 0.00 }
    ];

    for (const sc of spinCoupons) {
      const [coupon, created] = await Coupon.findOrCreate({
        where: { code: sc.code },
        defaults: {
          discountType: sc.discountType,
          discountValue: sc.discountValue,
          isActive: true,
          minOrderValue: sc.minOrderValue
        }
      });
      if (created) {
        console.log(`  [CREATED] Seeded default ${sc.code} coupon successfully.`);
      } else {
        console.log(`  [EXISTS] ${sc.code} coupon already exists.`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

syncDb();
