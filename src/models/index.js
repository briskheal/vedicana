import sequelize from '../lib/sequelize.js';
import User from './User.js';
import Category from './Category.js';
import Product from './Product.js';
import Order from './Order.js';
import OrderItem from './OrderItem.js';

import Coupon from './Coupon.js';
import DiscoverPage from './DiscoverPage.js';
import Review from './Review.js';
import FooterLink from './FooterLink.js';
import PopularCategory from './PopularCategory.js';
import HeroSlide from './HeroSlide.js';
import Certification from './Certification.js';
import Appointment from './Appointment.js';
import DamagedStock from './DamagedStock.js';
import Subscriber from './Subscriber.js';
import Blog from './Blog.js';
import CareerApplication from './CareerApplication.js';
import ContactMessage from './ContactMessage.js';
import StoredImage from './StoredImage.js';
import Mantra from './Mantra.js';
import Wishlist from './Wishlist.js';
import AbandonedCart from './AbandonedCart.js';

// Relationships
Product.hasMany(Review, { foreignKey: 'productId', onDelete: 'CASCADE' });
Review.belongsTo(Product, { foreignKey: 'productId' });

Product.hasMany(DamagedStock, { foreignKey: 'productId', onDelete: 'CASCADE' });
DamagedStock.belongsTo(Product, { foreignKey: 'productId' });
Order.hasMany(DamagedStock, { foreignKey: 'orderId', onDelete: 'SET NULL' });
DamagedStock.belongsTo(Order, { foreignKey: 'orderId' });

User.hasMany(Wishlist, { foreignKey: 'userId', onDelete: 'CASCADE' });
Wishlist.belongsTo(User, { foreignKey: 'userId' });
Product.hasMany(Wishlist, { foreignKey: 'productId', onDelete: 'CASCADE' });
Wishlist.belongsTo(Product, { foreignKey: 'productId' });

const models = {
  User,
  Category,
  Product,
  Order,
  OrderItem,
  Coupon,
  DiscoverPage,
  Review,
  FooterLink,
  PopularCategory,
  HeroSlide,
  Certification,
  Appointment,
  DamagedStock,
  Subscriber,
  Blog,
  CareerApplication,
  ContactMessage,
  StoredImage,
  Mantra,
  Wishlist,
  AbandonedCart
};

export { sequelize };
export default models;
