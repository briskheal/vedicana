import { DataTypes } from 'sequelize';
import sequelize from '../lib/sequelize.js';

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

export default Blog;
