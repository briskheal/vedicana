import { DataTypes } from 'sequelize';
import sequelize from '../lib/sequelize.js';

const Mantra = sequelize.define('Mantra', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  timestamps: true,
});

export default Mantra;
