// server/migrations/YYYYMMDDHHMMSS-create-cart-item.js
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CartItems', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      cart_id: { // Foreign Key ke Carts
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Carts',
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
        onDelete: 'CASCADE', // Jika varian dihapus, item keranjang hilang
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('CartItems');
  }
};