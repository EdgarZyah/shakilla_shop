// server/migrations/YYYYMMDDHHMMSS-create-order-item.js
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('OrderItems', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      order_id: { // Foreign Key ke Orders
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      // product_id, color, dan size DIHAPUS
      // DIGANTI DENGAN:
      product_variant_id: { // Foreign Key ke ProductVariants
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ProductVariants', // Nama tabel baru
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT', // JANGAN HAPUS order item jika varian dihapus
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      price: { // Harga saat checkout (penting!)
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('OrderItems');
  }
};