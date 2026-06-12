import { DataTypes } from 'sequelize';
import sequelize from '../lib/sequelize.js';

const ContactMessage = sequelize.define('ContactMessage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Unread', 'Read', 'Replied'),
    allowNull: false,
    defaultValue: 'Unread',
  }
}, {
  tableName: 'contact_messages',
  timestamps: true,
});

export default ContactMessage;
