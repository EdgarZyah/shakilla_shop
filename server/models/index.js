const sequelize = require("../config/dbconfig");

// Test koneksi
sequelize
  .authenticate()
  .then(() => {
    console.log("Koneksi database berhasil!");
  })
  .catch((error) => {
    console.error("Koneksi gagal:", error);
  });

const User = require("./user");
const Order = require("./order");
const Shipping = require("./shipping");
const Product = require("./product");
const Category = require("./category");
const Cart = require("./cart");
const CartItem = require("./cartItem");
const OrderItem = require("./orderItem");
const Payment = require("./payment");
const Message = require("./message");
const HeroContent = require("./heroContent");

// Definisikan semua asosiasi di sini
// Relasi Order dan User
Order.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Order, { foreignKey: "user_id" });

// Relasi Order dan Shipping
Order.hasOne(Shipping, { foreignKey: "order_id" });
Shipping.belongsTo(Order, { foreignKey: "order_id" });

// Relasi Product dan Category
Product.belongsTo(Category, { foreignKey: "category_id" });
Category.hasMany(Product, { foreignKey: "category_id" });

// Relasi Order dan OrderItem
Order.hasMany(OrderItem, { foreignKey: "order_id" });
OrderItem.belongsTo(Order, { foreignKey: "order_id" });

// Relasi Product dan OrderItem
OrderItem.belongsTo(Product, { foreignKey: "product_id" });
Product.hasMany(OrderItem, { foreignKey: "product_id" });

// Relasi Payment dan Order
Order.hasOne(Payment, { foreignKey: "order_id" });
Payment.belongsTo(Order, { foreignKey: "order_id" });

// Relasi Cart dan User
Cart.belongsTo(User, { foreignKey: "user_id" });
User.hasOne(Cart, { foreignKey: "user_id" });

// Relasi Cart dan CartItem
Cart.hasMany(CartItem, { foreignKey: "cart_id" });
CartItem.belongsTo(Cart, { foreignKey: "cart_id" });

// Relasi CartItem dan Product
CartItem.belongsTo(Product, { foreignKey: "product_id" });

// Relasi Message dan User
Message.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Message, { foreignKey: "user_id" });

// HANYA JALANKAN INI DI LINGKUNGAN PENGEMBANGAN!
//sequelize.sync({ force: false });

module.exports = {
  sequelize,
  User,
  Order,
  Shipping,
  Product,
  Category,
  Cart,
  CartItem,
  OrderItem,
  Payment,
  Message,
  HeroContent,
};
