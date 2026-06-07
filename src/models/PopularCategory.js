import { DataTypes } from 'sequelize';
import sequelize from '../lib/sequelize.js';

const PopularCategory = sequelize.define('PopularCategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  image: {
    type: DataTypes.TEXT, // Base64 optimized WebP data for fast loading
    allowNull: false
  },
  shape: {
    type: DataTypes.STRING, // 'round' or 'square'
    allowNull: false,
    defaultValue: 'round'
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'popular_categories',
  timestamps: true
});

export default PopularCategory;
