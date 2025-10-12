// server/models/cartitem.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CartItem extends Model {
    static associate(models) {
      CartItem.belongsTo(models.Cart, { foreignKey: 'cart_id', as: 'cart' });
      CartItem.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
    }
  }
  CartItem.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    cart_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    // FIX: Mendefinisikan field 'size' secara eksplisit
    size: { 
      type: DataTypes.STRING,
      allowNull: true, // Biarkan NULL jika tidak ada size, tapi defaultnya ada dari frontend
    },
  }, {
    sequelize,
    modelName: 'CartItem',
    tableName: 'cart_items',
    timestamps: false, 
    underscored: true,
  });
  return CartItem;
};