const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbconfig");

const Shipping = sequelize.define(
  "Shipping",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    order_id: DataTypes.INTEGER,
    shipping_address: DataTypes.TEXT, // Perbaikan nama kolom
    shipping_status: DataTypes.STRING,  // Perbaikan nama kolom
    shipped_at: DataTypes.DATE,         // Perbaikan nama kolom
    received_at: DataTypes.DATE,        // Perbaikan nama kolom
  },
  {
    tableName: "shipping",
    timestamps: false,
  }
);

module.exports = Shipping;