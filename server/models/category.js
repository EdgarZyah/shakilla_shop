const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbconfig");

const Category = sequelize.define(
  "Category",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
  },
  {
    tableName: "categories",
    timestamps: false,
  }
);

module.exports = Category;