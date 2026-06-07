import sequelize from '../src/lib/sequelize.js';

async function check() {
  try {
    const [results] = await sequelize.query('SELECT * FROM "Users" LIMIT 1');
    console.log('User row sample:', results[0]);
    
    // Also describe the columns
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Users'
    `);
    console.log('Columns in Users table:');
    columns.forEach(col => console.log(` - ${col.column_name}: ${col.data_type}`));
  } catch (err) {
    console.error('Error querying DB:', err);
  } finally {
    process.exit(0);
  }
}

check();
