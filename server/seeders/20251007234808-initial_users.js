'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Password mentah: 'password123'
    const password = 'password123';
    // Hashing password secara manual (karena bulkInsert melewati hooks model)
    const hashedPassword = await bcrypt.hash(password, 10);

    await queryInterface.bulkInsert('Users', [
      {
        first_name: 'Super',
        last_name: 'Admin',
        username: 'superadmin',
        email: 'admin@shakillashop.com',
        password: hashedPassword,
        role: 'admin',
        address: 'Kantor Pusat',
        zip_code: '10001',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        first_name: 'Contoh',
        last_name: 'User',
        username: 'userbiasa',
        email: 'user@example.com',
        password: hashedPassword,
        role: 'user',
        address: 'Jalan Kenanga No. 12',
        zip_code: '50123',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    // Perintah untuk menghapus data yang dimasukkan saat rollback
    await queryInterface.bulkDelete('Users', {
      email: {
        [Sequelize.Op.in]: ['admin@shakillashop.com', 'user@example.com']
      }
    }, {});
  }
};