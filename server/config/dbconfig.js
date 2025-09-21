const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('shakilla_shop', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false,
});

module.exports = sequelize;
