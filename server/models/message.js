const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbconfig");

const Message = sequelize.define(
  "Message",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: DataTypes.INTEGER,
    message: DataTypes.TEXT,
    created_at: DataTypes.DATE,
  },
  {
    tableName: "messages",
    timestamps: false,
  }
);

module.exports = Message;
