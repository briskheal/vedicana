import { DataTypes } from 'sequelize';
import sequelize from '../lib/sequelize.js';

const CareerApplication = sequelize.define('CareerApplication', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  position: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  experience_years: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cover_letter: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  resume_file_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resume_file_type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resume_base64: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Reviewed', 'Interviewed', 'Rejected', 'Hired'),
    allowNull: false,
    defaultValue: 'Pending',
  }
}, {
  tableName: 'career_applications',
  timestamps: true,
});

export default CareerApplication;
