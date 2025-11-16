// server/models/productvariant.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProductVariant extends Model {
    static associate(models) {
      // Varian terhubung ke satu "induk" Produk
      ProductVariant.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });

      // Varian ini bisa ada di banyak CartItem
      ProductVariant.hasMany(models.CartItem, { foreignKey: 'product_variant_id', as: 'cartItems' });
      
      // Varian ini bisa ada di banyak OrderItem
      ProductVariant.hasMany(models.OrderItem, { foreignKey: 'product_variant_id', as: 'orderItems' });
    }
  }
  
  ProductVariant.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    product_id: { // Foreign key ke Products
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    size: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    price: { // Harga spesifik untuk varian ini
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    stock: { // Stok spesifik untuk varian ini
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    sku: { // (Opsional) Kode unik untuk varian, misal: "KEMEJA-MERAH-L"
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    }
  }, {
    sequelize,
    modelName: 'ProductVariant',
    tableName: 'productvariants', // Sesuai nama tabel di migrasi
    underscored: true,
  });
  return ProductVariant;
};