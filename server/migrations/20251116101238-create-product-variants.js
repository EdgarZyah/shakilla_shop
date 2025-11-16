// server/migrations/YYYYMMDDHHMMSS-create-product-variants.js
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ProductVariants', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      product_id: { // Foreign Key ke Products
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Products', // Nama tabel
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // Jika produk dihapus, variannya ikut terhapus
      },
      color: {
        type: Sequelize.STRING,
        allowNull: true // Bisa null jika produk tidak punya varian warna
      },
      size: {
        type: Sequelize.STRING,
        allowNull: true // Bisa null jika produk tidak punya varian size
      },
      price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      sku: { // Opsional, tapi sangat direkomendasikan
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Tambahkan index untuk pencarian yang lebih cepat
    await queryInterface.addIndex('ProductVariants', ['product_id']);
    await queryInterface.addIndex('ProductVariants', ['color']);
    await queryInterface.addIndex('ProductVariants', ['size']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ProductVariants');
  }
};