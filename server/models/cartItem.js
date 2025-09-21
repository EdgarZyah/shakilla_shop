const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbconfig");

const CartItem = sequelize.define(
  "CartItem",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    cart_id: DataTypes.INTEGER,
    product_id: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
  },
  {
    tableName: "cart_items",
    timestamps: false,
  }
);

module.exports = CartItem;