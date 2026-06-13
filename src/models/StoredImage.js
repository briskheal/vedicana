import { DataTypes } from 'sequelize';
import sequelize from '../lib/sequelize.js';

const StoredImage = sequelize.define('StoredImage', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mimeType: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'image/webp',
  },
  data: {
    type: DataTypes.BLOB('long'),
    allowNull: false,
  },
}, {
  timestamps: true,
});

export default StoredImage;
