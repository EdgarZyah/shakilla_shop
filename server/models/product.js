// server/models/product.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      // Produk TETAP terhubung ke Kategori
      Product.belongsTo(models.Category, { foreignKey: 'category_id', as: 'category' });

      // BARU: Produk memiliki BANYAK Varian
      Product.hasMany(models.ProductVariant, { foreignKey: 'product_id', as: 'variants' });
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
    category_id: { 
      type: DataTypes.INTEGER,
      allowNull: false, 
    },
    thumbnail_url: {
      type: DataTypes.STRING,
    },
    image_url: {
      type: DataTypes.TEXT,
    },
  }, {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    underscored: true,
  });
  return Product;
};