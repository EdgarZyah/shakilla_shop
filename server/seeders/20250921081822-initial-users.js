'use strict';
const bcrypt = require("bcrypt");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const hashedPasswordAdmin = await bcrypt.hash('1234567890', 10);

    await queryInterface.bulkInsert('users', [
      {
        first_name: 'Admin',
        last_name: '1',
        username: 'Admin',
        email: 'admin@shakillashop.com',
        password: hashedPasswordAdmin,
        role: 'admin',
        address: 'shakilla shop',
        zip_code: '12345',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};