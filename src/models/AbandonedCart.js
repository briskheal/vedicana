import { DataTypes } from 'sequelize';
import sequelize from '../lib/sequelize.js';

const AbandonedCart = sequelize.define('AbandonedCart', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  cartData: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
  isRecovered: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  lastActive: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  timestamps: true,
});

export default AbandonedCart;
