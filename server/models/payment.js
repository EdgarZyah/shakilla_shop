// shakilla_shop/server/models/payment.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbconfig");

const Payment = sequelize.define(
  "Payment",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    order_id: DataTypes.INTEGER,
    payment_proof_url: DataTypes.STRING,
    payment_status: DataTypes.ENUM('pending', 'verified'),
    uploaded_at: DataTypes.DATE,
  },
  {
    tableName: "payments",
    timestamps: false,
  }
);

module.exports = Payment;