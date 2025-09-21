const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbconfig");

const Cart = sequelize.define(
  "Cart",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: DataTypes.INTEGER,
  },
  {
    tableName: "carts",
    timestamps: false,
  }
);

module.exports = Cart;