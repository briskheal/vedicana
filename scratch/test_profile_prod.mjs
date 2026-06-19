import { Sequelize } from 'sequelize';
import User from '../src/models/User.js';
import Order from '../src/models/Order.js';

async function testProfile() {
  const url = "postgresql://postgres.oeuelrgzxtogwmotdomd:VedicanaOrganics%401306@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres";
  
  const sequelize = new Sequelize(url, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false }
    }
  });

  User.init(User.rawAttributes, { ...User.options, sequelize });
  Order.init(Order.rawAttributes, { ...Order.options, sequelize });

  User.hasMany(Order, { foreignKey: 'userId' });
  Order.belongsTo(User, { foreignKey: 'userId' });

  try {
    const user = await User.findByPk(1, {
      include: [{ model: Order, as: 'Orders', separate: true, order: [['createdAt', 'DESC']] }]
    });
    console.log("Found user:", user ? "yes" : "no");
  } catch (error) {
    console.error("Profile Fetch Error:", error.message, error.stack);
  } finally {
    await sequelize.close();
  }
}

testProfile();
