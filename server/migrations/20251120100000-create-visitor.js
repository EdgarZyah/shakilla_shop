// server/migrations/20251120100000-create-visitor.js
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('visitors', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ip_address: {
        type: Sequelize.STRING,
        allowNull: false
      },
      visit_date: {
        type: Sequelize.DATEONLY, // Kita hanya butuh Tanggal (YYYY-MM-DD), tanpa jam
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    // Tambahkan index agar pencarian berdasarkan tanggal & IP cepat
    await queryInterface.addIndex('visitors', ['ip_address', 'visit_date'], {
      unique: true, // Satu IP hanya dihitung 1x per hari
      name: 'unique_visitor_per_day'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('visitors');
  }
};