// server/models/orderItem.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbconfig");

const OrderItem = sequelize.define(
  "OrderItem",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    order_id: DataTypes.INTEGER,
    product_id: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    price: DataTypes.DECIMAL(12, 2),
    size: DataTypes.STRING,
  },
  {
    tableName: "order_items",
    timestamps: false,
  }
);

module.exports = OrderItem;