import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function test(port) {
  let url = process.env.DATABASE_URL;
  if (port) {
    url = url.replace(':6543', \`:\${port}\`);
  }
  
  console.log(\`Testing connection with port \${port || 6543}...\`);
  const sequelize = new Sequelize(url, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false }
    }
  });

  try {
    await sequelize.authenticate();
    console.log("Connection successful!");
    return true;
  } catch (error) {
    console.error("Connection failed:", error.name, error.message);
    return false;
  } finally {
    await sequelize.close();
  }
}

async function run() {
  await test(6543);
  await test(5432);
}

run();
