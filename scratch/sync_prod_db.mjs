import { Sequelize } from 'sequelize';
import User from '../src/models/User.js';
import Category from '../src/models/Category.js';
import Product from '../src/models/Product.js';
import Order from '../src/models/Order.js';
import OrderItem from '../src/models/OrderItem.js';
import Coupon from '../src/models/Coupon.js';
import DiscoverPage from '../src/models/DiscoverPage.js';
import Review from '../src/models/Review.js';
import FooterLink from '../src/models/FooterLink.js';
import PopularCategory from '../src/models/PopularCategory.js';
import HeroSlide from '../src/models/HeroSlide.js';
import Certification from '../src/models/Certification.js';
import Appointment from '../src/models/Appointment.js';
import DamagedStock from '../src/models/DamagedStock.js';
import Subscriber from '../src/models/Subscriber.js';
import Blog from '../src/models/Blog.js';
import CareerApplication from '../src/models/CareerApplication.js';
import ContactMessage from '../src/models/ContactMessage.js';
import StoredImage from '../src/models/StoredImage.js';
import Mantra from '../src/models/Mantra.js';

// Setup relationships
Product.hasMany(Review, { foreignKey: 'productId', onDelete: 'CASCADE' });
Review.belongsTo(Product, { foreignKey: 'productId' });

Product.hasMany(DamagedStock, { foreignKey: 'productId', onDelete: 'CASCADE' });
DamagedStock.belongsTo(Product, { foreignKey: 'productId' });
Order.hasMany(DamagedStock, { foreignKey: 'orderId', onDelete: 'SET NULL' });
DamagedStock.belongsTo(Order, { foreignKey: 'orderId' });

async function syncAll() {
  const url = "postgresql://postgres.oeuelrgzxtogwmotdomd:VedicanaOrganics%401306@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres";
  
  const sequelize = new Sequelize(url, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false }
    }
  });

  // Re-bind all models to the new instance
  const models = [
    User, Category, Product, Order, OrderItem, Coupon, DiscoverPage, Review, 
    FooterLink, PopularCategory, HeroSlide, Certification, Appointment, 
    DamagedStock, Subscriber, Blog, CareerApplication, ContactMessage, 
    StoredImage, Mantra
  ];

  for (const model of models) {
    model.init(model.rawAttributes, { ...model.options, sequelize });
  }

  try {
    console.log("Syncing database tables (alter: true)...");
    await sequelize.sync({ alter: true });
    console.log("Database synchronized successfully!");
  } catch (error) {
    console.error("Failed to sync database:", error);
  } finally {
    await sequelize.close();
  }
}

syncAll();
