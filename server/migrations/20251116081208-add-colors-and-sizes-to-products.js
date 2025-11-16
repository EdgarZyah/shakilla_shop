// server/migrations/YYYYMMDDHHMMSS-add-colors-and-sizes-to-products.js

'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Gunakan transaksi untuk memastikan kedua kolom ditambahkan atau tidak sama sekali
    await queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.addColumn('products', 'colors', {
          type: Sequelize.TEXT, // Menyimpan JSON String array
          allowNull: true,
        }, { transaction }),
        
        queryInterface.addColumn('products', 'sizes', {
          type: Sequelize.TEXT, // Menyimpan JSON String array
          allowNull: true,
        }, { transaction })
      ]);
    });
  },

  async down(queryInterface, Sequelize) {
    // Transaksi untuk revert
    await queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.removeColumn('products', 'colors', { transaction }),
        queryInterface.removeColumn('products', 'sizes', { transaction })
      ]);
    });
  }
};