import sequelize from '../src/lib/sequelize.js';

async function checkSchema() {
  try {
    const [results, metadata] = await sequelize.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Users'");
    console.log(results);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

checkSchema();
