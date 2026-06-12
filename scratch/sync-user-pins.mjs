import { Sequelize, DataTypes } from 'sequelize';

const DATABASE_URL = 'postgresql://postgres.oeuelrgzxtogwmotdomd:VedicanaOrganics%401306@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres';

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: console.log,
});

async function run() {
  try {
    await sequelize.authenticate();
    console.log("Connected to Supabase.");

    // Define the User model as it is in the app
    const User = sequelize.define('User', {
      name: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      password: { type: DataTypes.STRING, allowNull: false },
      role: { type: DataTypes.ENUM('customer', 'admin'), defaultValue: 'customer' },
      address: { type: DataTypes.TEXT },
      phone: { type: DataTypes.STRING },
      hasSpunWheel: { type: DataTypes.BOOLEAN, defaultValue: false },
      reset_pin: { type: DataTypes.STRING, allowNull: true },
      reset_pin_expires: { type: DataTypes.DATE, allowNull: true },
    }, {
      timestamps: true,
    });

    console.log("Syncing User table to add PIN fields...");
    await User.sync({ alter: true });
    
    console.log("Successfully altered User table!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await sequelize.close();
  }
}

run();
