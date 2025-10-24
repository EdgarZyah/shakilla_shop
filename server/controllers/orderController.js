// server/controllers/orderController.js
const db = require("../models/index");
const { Order, OrderItem, Cart, CartItem, Product, Payment, User } = db;
const { sequelize } = db;
const { Op } = db.Sequelize;

// ... (fungsi orderIncludeOptions dan checkout tidak perlu diubah dari versi terakhir) ...

const orderIncludeOptions = (includeUser = false) => {
  const includes = [
    {
      model: OrderItem,
      as: "items",
      required: false,
      include: [
        {
          model: Product,
          as: "product",
          attributes: [
            "id",
            "name",
            "price",
            "stock",
            "thumbnail_url",
            "image_url",
          ],
        },
      ],
    },
    {
      model: Payment,
      as: "payment",
    },
  ];

  if (includeUser) {
    includes.push({
      model: User,
      as: "user",
      attributes: ["id", "first_name", "last_name", "email", "address"],
    });
  }

  return includes;
};

exports.checkout = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.user.id;
    const { shipping_address, shipping_method, shipping_cost } = req.body;

    if (!shipping_address) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "Alamat pengiriman wajib diisi." });
    }

    const parsedShippingCost = parseFloat(shipping_cost);
    if (!shipping_method || shipping_method.trim() === "") {
        await t.rollback();
        return res.status(400).json({ message: "Metode pengiriman harus dipilih." });
    }
    if (isNaN(parsedShippingCost) || parsedShippingCost < 0) {
        await t.rollback();
        return res.status(400).json({ message: "Biaya ongkir tidak valid." });
    }

    const cart = await Cart.findOne({
      where: { user_id: userId },
      include: [
        {
          model: CartItem,
          as: "items",
          include: [{ model: Product, as: "product" }],
        },
      ],
      transaction: t,
    });

    if (!cart || cart.items.length === 0) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "Keranjang kosong, tidak dapat checkout." });
    }

    let total_price = 0; 
    const orderItemsData = [];
    const stockUpdates = [];

    for (const item of cart.items) {
      const product = item.product;

      if (!product) {
        await t.rollback();
        return res.status(400).json({
          message: `Checkout gagal: Produk (ID: ${item.product_id}) tidak valid.`,
        });
      }
      const itemPrice = parseFloat(product.price || 0);
      const itemStock = parseInt(product.stock || 0);
      const itemQty = parseInt(item.quantity || 0);

      if (itemQty <= 0) {
        await t.rollback();
        return res.status(400).json({
          message: `Kuantitas untuk produk ${product.name} harus positif.`,
        });
      }

      if (itemStock < itemQty) {
        await t.rollback();
        return res.status(400).json({
          message: `Stok untuk produk ${product.name} (${itemStock}) tidak mencukupi.`,
        });
      }

      total_price += itemQty * itemPrice;

      orderItemsData.push({
        product_id: product.id,
        quantity: itemQty,
        price: itemPrice.toFixed(2),
        size: item.size,
      });

      stockUpdates.push({
        id: product.id,
        newStock: itemStock - itemQty,
      });
    }

    const finalSubtotal = parseFloat(total_price).toFixed(2);
    const finalShippingCost = parseFloat(parsedShippingCost).toFixed(2);
    const finalGrandTotal = (parseFloat(finalSubtotal) + parseFloat(finalShippingCost)).toFixed(2);

    const newOrder = await Order.create(
      {
        user_id: userId,
        total_price: finalSubtotal,
        shipping_address: shipping_address,
        shipping_method: shipping_method,
        shipping_cost: finalShippingCost,
        grand_total: finalGrandTotal,
        order_status: "menunggu pembayaran",
      },
      { transaction: t }
    );

    const itemsWithOrderId = orderItemsData.map((item) => ({
      ...item,
      order_id: newOrder.id,
    }));
    await OrderItem.bulkCreate(itemsWithOrderId, { transaction: t });

    for (const update of stockUpdates) {
      await Product.update(
        { stock: update.newStock },
        { where: { id: update.id }, transaction: t }
      );
    }

    await CartItem.destroy({ where: { cart_id: cart.id }, transaction: t });

    await t.commit();

    res.status(201).json({
      message: "Checkout berhasil! Order menunggu pembayaran.",
      order: newOrder,
    });
  } catch (error) {
    await t.rollback();
    console.error("Checkout error:", error);
    res.status(500).json({
      message: "Checkout gagal karena kesalahan server.",
      error: error.message,
    });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin";
    const userId = req.user.id;

    let whereCondition = {};
    if (!isAdmin) {
      whereCondition.user_id = userId;
    } else if (req.query.user_id) {
      whereCondition.user_id = req.query.user_id;
    }

    const orders = await Order.findAll({
      where: whereCondition,
      include: orderIncludeOptions(true),
      order: [["created_at", "DESC"]],
    });

    if (isAdmin && !req.query.user_id) {
      return res.status(200).json(orders);
    }

    return res.status(200).json({ orders });
  } catch (error) {
    console.error("Get orders error:", error);
    res
      .status(500)
      .json({ message: "Gagal mengambil daftar order.", error: error.message });
  }
};

exports.getOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const role = req.user.role;
    const userId = req.user.id;

    let whereCondition = { id };
    if (role !== "admin") {
      whereCondition.user_id = userId;
    }

    const order = await Order.findOne({
      where: whereCondition,
      include: orderIncludeOptions(true),
    });

    if (!order) {
      return res
        .status(404)
        .json({ message: "Pesanan tidak ditemukan atau akses ditolak." });
    }

    res.status(200).json({ order });
  } catch (error) {
    console.error("Get order detail error:", error);
    res
      .status(500)
      .json({ message: "Gagal mengambil detail order.", error: error.message });
  }
};


// [ADMIN & USER] Mengubah Status Order
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { order_status } = req.body;
    const { role, id: userId } = req.user; // Ambil role dan id user

    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({ message: "Order tidak ditemukan." });
    }

    // --- PERBAIKAN LOGIKA KEAMANAN ---
    if (role !== "admin") {
      // KASUS 1: Jika BUKAN ADMIN
      // Pengguna hanya boleh membatalkan pesanannya sendiri
      if (order.user_id !== userId) {
        return res.status(403).json({ message: "Akses ditolak. Ini bukan pesanan Anda." });
      }
      if (order_status !== "dibatalkan") {
        return res.status(403).json({ message: "Pengguna hanya dapat membatalkan pesanan." });
      }
      if (order.order_status !== "menunggu pembayaran") {
         return res.status(400).json({ message: "Pesanan yang sudah diproses tidak dapat dibatalkan." });
      }

    } else {
      // KASUS 2: Jika ADMIN
      // Admin bisa update status lain
      const validAdminStatuses = [
        "menunggu verifikasi",
        "diproses",
        "dikirim",
        "diterima",
        "selesai",
        "dibatalkan", // Admin juga boleh membatalkan
      ];
      if (!order_status || !validAdminStatuses.includes(order_status)) {
        return res.status(400).json({ message: `Status order tidak valid: ${order_status}` });
      }
    }
    // --- AKHIR PERBAIKAN LOGIKA ---


    const updateFields = { order_status };

    if (order_status === "dikirim" && !order.shipped_at) {
       // Hanya admin yang bisa set 'dikirim' dan harus ada resi
      if (role !== 'admin' || !order.shipping_receipt_number) {
        return res.status(400).json({ message: "Upload resi terlebih dahulu sebelum mengubah status menjadi 'dikirim'." });
      }
      updateFields.shipped_at = new Date();
    }

    if (order_status === "diterima" && !order.received_at) {
      updateFields.received_at = new Date();
      updateFields.order_status = "selesai"; 
    }

    await order.update(updateFields);

    res.status(200).json({
      message: `Status Order #${id} berhasil diubah menjadi ${updateFields.order_status}.`,
      order, 
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({
      message: "Gagal memperbarui status order.",
      error: error.message,
    });
  }
};

// --- FUNGSI UPLOAD RESI (ADMIN) ---
exports.shipOrder = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Akses ditolak. Hanya admin." });
  }

  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { shipping_receipt_number } = req.body;

    if (!shipping_receipt_number || shipping_receipt_number.trim() === '') {
      await t.rollback();
      return res.status(400).json({ message: "Nomor resi wajib diisi." });
    }

    const order = await Order.findByPk(id, { transaction: t });
    if (!order) {
      await t.rollback();
      return res.status(404).json({ message: "Order tidak ditemukan." });
    }

    if (order.order_status !== 'diproses') {
      await t.rollback();
      return res.status(400).json({ 
        message: `Hanya pesanan berstatus 'diproses' yang dapat dikirim. Status saat ini: ${order.order_status}` 
      });
    }

    // --- PERBAIKAN URL RESI ---
    // Simpan path relatif yang sesuai dengan app.js
    // req.file.filename = 'shipping-12345.jpg'
    // hasil: 'uploads/receipts/shipping-12345.jpg'
    const receiptUrl = req.file ? `uploads/receipts/${req.file.filename}` : null;
    // --- AKHIR PERBAIKAN URL RESI ---

    await order.update({
      shipping_receipt_number: shipping_receipt_number,
      shipping_receipt_url: receiptUrl,
      order_status: 'dikirim', 
      shipped_at: new Date()   
    }, { transaction: t });

    await t.commit();

    res.status(200).json({
      message: "Resi berhasil diupload. Status order diubah menjadi 'dikirim'.",
      order: order 
    });

  } catch (error) {
    await t.rollback();
    console.error("Ship order error:", error);
    res.status(500).json({
      message: "Gagal mengupload resi.",
      error: error.message
    });
  }
};
// --- AKHIR FUNGSI UPLOAD RESI ---