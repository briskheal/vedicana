import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectModule: await import('pg'),
  logging: false,
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
});

async function main() {
  const [pages] = await sequelize.query('SELECT slug FROM "DiscoverPages"');
  console.log("Pages:", pages);
}
main().catch(console.error).finally(() => process.exit(0));
