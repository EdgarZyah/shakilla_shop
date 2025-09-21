const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbconfig");

const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    first_name: {
      // Tambahkan kolom nama depan
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      // Tambahkan kolom nama belakang
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      // Tambahkan kolom alamat
      type: DataTypes.STRING,
      allowNull: true, // Bisa disesuaikan
    },
    zip_code: {
      // Tambahkan kolom kode pos
      type: DataTypes.STRING,
      allowNull: true, // Bisa disesuaikan
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: "user",
    },
  },
  {
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = User;
