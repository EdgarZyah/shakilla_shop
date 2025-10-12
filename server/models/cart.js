// server/models/cart.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Cart extends Model {
    static associate(models) {
      Cart.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      Cart.hasMany(models.CartItem, { foreignKey: 'cart_id', as: 'items' });
    }
  }
  Cart.init({
    // ... (fields tetap)
  }, {
    sequelize,
    modelName: 'Cart',
    tableName: 'carts',
    underscored: true,
  });
  return Cart;
};