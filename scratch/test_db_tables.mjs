import { Sequelize } from 'sequelize';

async function run() {
  const url = "postgresql://postgres.oeuelrgzxtogwmotdomd:VedicanaOrganics%401306@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres";
  const sequelize = new Sequelize(url, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false }
    }
  });

  try {
    const [results] = await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
    console.log("Tables in DB:");
    console.log(results);
  } catch (error) {
    console.error("Query failed:", error);
  } finally {
    await sequelize.close();
  }
}

run();
