// shakilla_shop/server/models/order.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbconfig");

const Order = sequelize.define(
  "Order",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: DataTypes.INTEGER,
    total_price: DataTypes.DECIMAL(12, 2),
    order_status: DataTypes.ENUM('pending', 'menunggu pembayaran', 'diproses', 'dikirim', 'selesai'),
  },
  {
    tableName: "orders",
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = Order;