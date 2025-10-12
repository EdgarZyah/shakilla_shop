// server/models/order.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      // Relasi ke User
      Order.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user', // Alias untuk relasi
      });
      // Relasi ke OrderItem
      Order.hasMany(models.OrderItem, {
        foreignKey: 'order_id',
        as: 'items', // Alias untuk relasi
      });
      // Relasi ke Payment
      Order.hasOne(models.Payment, {
        foreignKey: 'order_id',
        as: 'payment', // Alias untuk relasi
      });
    }
  }

  Order.init({
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    total_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    shipping_address: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    order_status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'menunggu pembayaran'
    },
    shipped_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    received_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Kolom createdAt dan updatedAt tidak perlu didefinisikan di sini
    // Sequelize akan menanganinya secara otomatis
  }, {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    // --- PERBAIKAN UTAMA ---
    // Tambahkan opsi ini agar Sequelize menggunakan snake_case untuk kolom
    // timestamp otomatis (created_at dan updated_at)
    underscored: true,
    // Pastikan timestamps diaktifkan (ini adalah default, tapi lebih baik eksplisit)
    timestamps: true, 
  });

  return Order;
};