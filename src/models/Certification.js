import { DataTypes } from 'sequelize';
import sequelize from '../lib/sequelize.js';

const Certification = sequelize.define('Certification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  image: {
    type: DataTypes.TEXT, // Storing optimized WebP Base64 image
    allowNull: false
  },
  order_index: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'certifications',
  timestamps: true
});

export default Certification;
