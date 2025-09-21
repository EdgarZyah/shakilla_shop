'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Tabel `users`
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      last_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      username: {
        type: Sequelize.STRING,
        unique: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      address: {
        type: Sequelize.STRING,
      },
      zip_code: {
        type: Sequelize.STRING,
      },
      role: {
        type: Sequelize.STRING,
        defaultValue: 'user',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    // Tabel `categories`
    await queryInterface.createTable('categories', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });
    
    // Tabel `products`
    await queryInterface.createTable('products', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
      },
      price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      stock: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      category_id: {
        type: Sequelize.INTEGER,
      },
      thumbnail_url: {
        type: Sequelize.STRING,
      },
      image_url: {
        type: Sequelize.STRING,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    // Tabel `carts`
    await queryInterface.createTable('carts', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    // Tabel `cart_items`
    await queryInterface.createTable('cart_items', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      cart_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
    });
    
    // Tabel `orders`
    await queryInterface.createTable('orders', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      order_status: {
        type: Sequelize.ENUM('pending', 'diproses', 'dikirim', 'selesai'),
        allowNull: false,
        defaultValue: 'pending',
      },
      total_price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });
    
    // Tabel `order_items`
    await queryInterface.createTable('order_items', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
    });

    // Tabel `shipping`
    await queryInterface.createTable('shipping', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      shipping_address: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      shipping_status: {
        type: Sequelize.ENUM('pending', 'dikirim', 'diterima'),
        allowNull: false,
        defaultValue: 'pending',
      },
      shipped_at: {
        type: Sequelize.DATE,
      },
      received_at: {
        type: Sequelize.DATE,
      },
    });

    // Tabel `payments`
    await queryInterface.createTable('payments', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      payment_proof_url: {
        type: Sequelize.STRING,
      },
      payment_status: {
        type: Sequelize.ENUM('pending', 'verified'),
        allowNull: false,
        defaultValue: 'pending',
      },
      uploaded_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Tabel `messages`
    await queryInterface.createTable('messages', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      message_text: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Tambahkan relasi kunci asing (Foreign Keys)
    await queryInterface.addConstraint('products', {
      fields: ['category_id'],
      type: 'foreign key',
      name: 'FK_products_category',
      references: {
        table: 'categories',
        field: 'id'
      },
      onDelete: 'SET NULL',
    });
    await queryInterface.addConstraint('carts', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'FK_carts_user',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'CASCADE',
    });
    await queryInterface.addConstraint('cart_items', {
      fields: ['cart_id'],
      type: 'foreign key',
      name: 'FK_cart_items_cart',
      references: {
        table: 'carts',
        field: 'id'
      },
      onDelete: 'CASCADE',
    });
    await queryInterface.addConstraint('cart_items', {
      fields: ['product_id'],
      type: 'foreign key',
      name: 'FK_cart_items_product',
      references: {
        table: 'products',
        field: 'id'
      },
      onDelete: 'CASCADE',
    });
    await queryInterface.addConstraint('orders', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'FK_orders_user',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'CASCADE',
    });
    await queryInterface.addConstraint('order_items', {
      fields: ['order_id'],
      type: 'foreign key',
      name: 'FK_order_items_order',
      references: {
        table: 'orders',
        field: 'id'
      },
      onDelete: 'CASCADE',
    });
    await queryInterface.addConstraint('order_items', {
      fields: ['product_id'],
      type: 'foreign key',
      name: 'FK_order_items_product',
      references: {
        table: 'products',
        field: 'id'
      },
      onDelete: 'CASCADE',
    });
    await queryInterface.addConstraint('shipping', {
      fields: ['order_id'],
      type: 'foreign key',
      name: 'FK_shipping_order',
      references: {
        table: 'orders',
        field: 'id'
      },
      onDelete: 'CASCADE',
    });
    await queryInterface.addConstraint('payments', {
      fields: ['order_id'],
      type: 'foreign key',
      name: 'FK_payments_order',
      references: {
        table: 'orders',
        field: 'id'
      },
      onDelete: 'CASCADE',
    });
    await queryInterface.addConstraint('messages', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'FK_messages_user',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'CASCADE',
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Menghapus tabel secara berurutan
    await queryInterface.dropTable('messages');
    await queryInterface.dropTable('payments');
    await queryInterface.dropTable('shipping');
    await queryInterface.dropTable('order_items');
    await queryInterface.dropTable('orders');
    await queryInterface.dropTable('cart_items');
    await queryInterface.dropTable('carts');
    await queryInterface.dropTable('products');
    await queryInterface.dropTable('categories');
    await queryInterface.dropTable('users');
  }
};