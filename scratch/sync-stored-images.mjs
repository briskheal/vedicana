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
  logging: false,
});

async function run() {
  try {
    await sequelize.authenticate();
    console.log("Connected to Supabase.");

    const StoredImage = sequelize.define('StoredImage', {
      filename: { type: DataTypes.STRING, allowNull: false },
      mimeType: { type: DataTypes.STRING, allowNull: false, defaultValue: 'image/webp' },
      data: { type: DataTypes.BLOB('long'), allowNull: false },
    }, {
      timestamps: true,
    });

    console.log("Creating StoredImages table...");
    await StoredImage.sync({ alter: true });
    
    console.log("Successfully created StoredImages table!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await sequelize.close();
  }
}

run();
