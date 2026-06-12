import { DataTypes } from 'sequelize';
import sequelize from '../lib/sequelize.js';
import Category from './Category.js';

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
  },
  short_description: {
    type: DataTypes.TEXT,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  sale_price: {
    type: DataTypes.DECIMAL(10, 2),
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  image: {
    type: DataTypes.TEXT,
  },
  gallery: {
    type: DataTypes.JSON, // Array of strings
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  specification: {
    type: DataTypes.TEXT,
  },
  additional_info: {
    type: DataTypes.JSON,
  },
  tax_rate: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
}, {
  timestamps: true,
});

// Relationships
Category.hasMany(Product, { foreignKey: 'categoryId' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });

export default Product;
