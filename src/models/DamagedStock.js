import { DataTypes } from 'sequelize';
import sequelize from '../lib/sequelize.js';

const DamagedStock = sequelize.define('DamagedStock', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  productName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  variant: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  reason: {
    type: DataTypes.STRING, // 'Expired' or 'Damage' or 'Returned Expired/Damaged' or 'Returned Damaged'
    allowNull: false,
  },
}, {
  timestamps: true,
  tableName: 'damaged_stocks'
});

export default DamagedStock;
