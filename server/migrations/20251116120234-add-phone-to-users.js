// server/migrations/YYYYMMDDHHMMSS-add-phone-to-users.js
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'phone_number', {
      type: Sequelize.STRING(20), // varchar(20)
      allowNull: true, // Izinkan null (opsional)
      unique: true, // Nomor HP harus unik
      after: 'email' // Menempatkan kolom ini setelah 'email'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'phone_number');
  }
};