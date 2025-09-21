const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbconfig");

const HeroContent = sequelize.define(
  "HeroContent",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    button_text: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    order_index: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "hero_content",
    timestamps: true,
  }
);

module.exports = HeroContent;
