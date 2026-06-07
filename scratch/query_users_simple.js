import 'dotenv/config';
import models from '../src/models/index.js';
const { User } = models;

async function test() {
  try {
    const users = await User.findAll({ attributes: ['id', 'name', 'email', 'role'] });
    console.log("USERS_LIST_START");
    console.log(JSON.stringify(users, null, 2));
    console.log("USERS_LIST_END");
  } catch (err) {
    console.error("Error querying users:", err);
  } finally {
    if (models.sequelize) {
      await models.sequelize.close();
    }
    process.exit(0);
  }
}

test();
