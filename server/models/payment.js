// server/models/payment.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    static associate(models) {
      Payment.belongsTo(models.Order, { foreignKey: 'order_id', as: 'order' });
    }
  }
  Payment.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    // FIX: Mendefinisikan order_id secara eksplisit
    order_id: { 
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // FIX: Mendefinisikan payment_proof_url secara eksplisit
    payment_proof_url: {
      type: DataTypes.STRING,
    },
    payment_status: {
      type: DataTypes.ENUM("pending", "verified"),
      allowNull: false,
      defaultValue: "pending",
    },
    // Menggunakan uploaded_at untuk konsistensi dengan skema
    uploaded_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
  }, {
    sequelize,
    modelName: 'Payment',
    tableName: 'payments',
    timestamps: false,
    underscored: true,
  });
  return Payment;
};