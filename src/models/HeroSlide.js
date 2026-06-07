import { DataTypes } from 'sequelize';
import sequelize from '../lib/sequelize.js';

const HeroSlide = sequelize.define('HeroSlide', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true
  },
  subtitle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  badge: {
    type: DataTypes.STRING,
    allowNull: true
  },
  image: {
    type: DataTypes.TEXT, // Storing optimized WebP Base64 image
    allowNull: false
  },
  link: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '/shop'
  },
  order_index: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'hero_slides',
  timestamps: true
});

export default HeroSlide;
