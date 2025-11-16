// server/models/orderitem.js
'useS trict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderItem extends Model {
    static associate(models) {
      // TETAP: Terhubung ke Order
      OrderItem.belongsTo(models.Order, { foreignKey: 'order_id', as: 'order' });

      // DIUBAH: Terhubung ke ProductVariant, bukan Product
      OrderItem.belongsTo(models.ProductVariant, { foreignKey: 'product_variant_id', as: 'productVariant' });
    }
  }
  OrderItem.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_variant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'OrderItem',
    tableName: 'orderitems',
    timestamps: false, 
    underscored: true,
  });
  return OrderItem;
};