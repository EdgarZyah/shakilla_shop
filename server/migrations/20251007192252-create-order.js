'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("orders", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      // FIX UTAMA: Menambahkan status "menunggu verifikasi"
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
        type: Sequelize.TEXT, // Menggunakan TEXT atau STRING sesuai kebutuhan
      },
      shipped_at: {
        type: Sequelize.DATE,
      },
      received_at: {
        type: Sequelize.DATE,
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
    await queryInterface.dropTable('Orders');
  }
};