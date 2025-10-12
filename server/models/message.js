// server/models/message.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    static associate(models) {
      Message.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
  }
  Message.init({
    // ... (fields tetap)
  }, {
    sequelize,
    modelName: 'Message',
    tableName: 'messages',
    underscored: true,
    createdAt: 'created_at', // Hanya ada created_at di skema Anda
    updatedAt: false,
  });
  return Message;
};