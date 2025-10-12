// server/models/product.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      Product.belongsTo(models.Category, { foreignKey: 'category_id', as: 'category' });
      Product.hasMany(models.CartItem, { foreignKey: 'product_id', as: 'cartItems' });
      Product.hasMany(models.OrderItem, { foreignKey: 'product_id', as: 'orderItems' });
    }
  }
  
  Product.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    // FIX UTAMA: Menggunakan snake_case secara eksplisit di model
    category_id: { 
      type: DataTypes.INTEGER,
      allowNull: false, 
    },
    thumbnail_url: {
      type: DataTypes.STRING,
    },
    image_url: {
      type: DataTypes.TEXT, // FIX: Menggunakan TEXT untuk menampung JSON String yang panjang
    },
  }, {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    underscored: true,
  });
  return Product;
};