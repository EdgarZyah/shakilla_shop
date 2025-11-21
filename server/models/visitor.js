'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Visitor extends Model {
    static associate(models) {
    }
  }
  Visitor.init({
    ip_address: {
      type: DataTypes.STRING,
      allowNull: false
    },
    visit_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Visitor',
    tableName: 'visitors',
    underscored: true,
  });
  return Visitor;
};