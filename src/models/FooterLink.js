import { DataTypes } from 'sequelize';
import sequelize from '../lib/sequelize.js';

const FooterLink = sequelize.define('FooterLink', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  section: {
    type: DataTypes.ENUM('quick_links', 'policies'),
    allowNull: false,
    defaultValue: 'policies',
  },
  order_index: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  }
}, {
  timestamps: true,
});

export default FooterLink;
