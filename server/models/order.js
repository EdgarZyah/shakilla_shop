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

    // --- TAMBAHAN YANG HILANG ---
    shipping_method: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shipping_cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00
    },
    grand_total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00
    },
    // --- AKHIR TAMBAHAN ---

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
    
    // --- TAMBAHAN RESI YANG HILANG ---
    shipping_receipt_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shipping_receipt_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // --- AKHIR TAMBAHAN RESI ---
    
  }, {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    underscored: true,
    timestamps: true, 
  });

  return Order;
};