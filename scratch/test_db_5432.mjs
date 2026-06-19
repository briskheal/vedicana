import { Sequelize } from 'sequelize';

async function run() {
  const url = "postgresql://postgres.oeuelrgzxtogwmotdomd:VedicanaOrganics%401306@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres";
  console.log("Testing 5432...");
  const sequelize = new Sequelize(url, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false }
    }
  });

  try {
    await sequelize.authenticate();
    console.log("Connection successful on 5432!");
  } catch (error) {
    console.error("Connection failed on 5432:", error.name, error.message);
  } finally {
    await sequelize.close();
  }
}

run();
