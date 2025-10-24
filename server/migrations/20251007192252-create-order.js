'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("orders", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        // Asumsi ada foreign key constraint ke tabel 'users'
        // references: { model: 'users', key: 'id' },
        // onUpdate: 'CASCADE',
        // onDelete: 'SET NULL',
      },
      order_status: {
        type: Sequelize.ENUM("pending", "menunggu pembayaran", "menunggu verifikasi", "diproses", "dikirim", "diterima", "selesai", "dibatalkan"),
        allowNull: false,
        defaultValue: "pending",
      },
      total_price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      shipping_address: {
        type: Sequelize.TEXT,
        allowNull: false, // Alamat pengiriman seharusnya wajib
      },

      // --- Kolom dari migrasi "add-shipping-to-orders" ---
      shipping_method: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      shipping_cost: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
      grand_total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false, // Dibuat NOT NULL karena controller akan mengisinya
      },
      // --- Akhir kolom shipping ---

      // --- Kolom dari migrasi "add-shipping-receipt-to-orders" ---
      shipping_receipt_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      shipping_receipt_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      // --- Akhir kolom resi ---

      shipped_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      received_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });
  },
  async down(queryInterface, Sequelize) {
    // Perbaikan: Gunakan nama tabel 'orders' (lowercase)
    await queryInterface.dropTable('orders');
  }
};