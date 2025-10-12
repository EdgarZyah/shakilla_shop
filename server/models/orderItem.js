// server/models/orderitem.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderItem extends Model {
    static associate(models) {
      // FIX: Menggunakan alias 'order' dan 'product' (huruf kecil)
      OrderItem.belongsTo(models.Order, { foreignKey: 'order_id', as: 'order' });
      OrderItem.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
    }
  }
  OrderItem.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // FIX 1: Mendefinisikan quantity secara eksplisit
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // FIX 2: Mendefinisikan price secara eksplisit
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    // FIX 3: Mendefinisikan size secara eksplisit
    size: { 
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'OrderItem',
    tableName: 'order_items',
    timestamps: false,
    underscored: true, // Memastikan mapping ke snake_case di DB
  });
  return OrderItem;
};