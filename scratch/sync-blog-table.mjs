import { Sequelize, DataTypes } from 'sequelize';

const DATABASE_URL = 'postgresql://postgres.oeuelrgzxtogwmotdomd:VedicanaOrganics%401306@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres';

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: false,
});

const Blog = sequelize.define('Blog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  excerpt: { type: DataTypes.TEXT, allowNull: true },
  content: { type: DataTypes.TEXT, allowNull: true },
  cover_image: { type: DataTypes.TEXT, allowNull: true },
  author: { type: DataTypes.STRING, allowNull: false, defaultValue: 'VediCana Team' },
  category: { type: DataTypes.STRING, allowNull: true, defaultValue: 'Wellness' },
  tags: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: true, defaultValue: [] },
  status: { type: DataTypes.ENUM('draft', 'published', 'scheduled'), allowNull: false, defaultValue: 'draft' },
  scheduled_at: { type: DataTypes.DATE, allowNull: true },
  published_at: { type: DataTypes.DATE, allowNull: true },
  read_time: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 5 },
  views: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  is_featured: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
}, { tableName: 'blogs', timestamps: true });

async function main() {
  try {
    console.log('🔌 Connecting to Supabase PostgreSQL...');
    await sequelize.authenticate();
    console.log('✅ Connection established successfully.');

    console.log('🔄 Syncing Blog table (alter: true)...');
    await sequelize.sync({ alter: true });
    console.log('✅ Blog table synced successfully!');

    // Quick check
    const count = await Blog.count();
    console.log(`📊 Blogs table ready. Current row count: ${count}`);

  } catch (err) {
    console.error('❌ Sync failed:', err.message);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('🔒 Connection closed.');
  }
}

main();
