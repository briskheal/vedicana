import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false }
  }
});

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, defaultValue: 'customer' },
  phone: { type: DataTypes.STRING },
  address: { type: DataTypes.TEXT }
}, { tableName: 'users', timestamps: true });

async function check() {
  try {
    const user = await User.findOne({ where: { email: 'jrdash.ctc@gmail.com' } });
    if (user) {
      console.log('User found:', user.toJSON());
    } else {
      console.log('User not found.');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
}

check();
