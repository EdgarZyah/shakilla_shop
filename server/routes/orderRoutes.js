// shakilla_shop/server/routes/orderRoutes.js

const express = require("express");
const router = express.Router();
const {
  Order,
  OrderItem,
  Product,
  Shipping,
  Payment,
  User,
  Cart,
  CartItem,
} = require("../models");
const formidable = require("express-formidable");
const path = require("path");
const fs = require("fs").promises;
const { Op } = require("sequelize");

// Helper untuk menghapus file
const deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.warn(`Gagal menghapus file ${filePath}:`, err);
    }
  }
};

// Middleware untuk otentikasi sederhana
const authenticateUser = (req, res, next) => {
  const userId = req.cookies.userId;
  if (!userId) {
    return res
      .status(401)
      .json({ message: "Akses ditolak. Tidak ada user yang terautentikasi." });
  }
  req.userId = userId;
  next();
};

// Rute untuk mendapatkan semua pesanan (untuk Admin)
router.get("/", async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: User, attributes: ["first_name", "last_name", "email"] },
        { model: Shipping },
        { model: Payment },
      ],
      order: [["created_at", "DESC"]],
    });
    res.json(orders);
  } catch (err) {
    console.error("Error fetching all orders:", err);
    res
      .status(500)
      .json({ message: "Gagal mengambil data pesanan.", error: err.message });
  }
});

// Rute untuk mendapatkan detail pesanan tunggal (untuk Admin)
router.get("/:orderId", async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findByPk(orderId, {
      include: [
        { model: User, attributes: ["first_name", "last_name", "email"] },
        {
          model: OrderItem,
          include: [{ model: Product, attributes: ["id", "name", "price"] }],
        },
        { model: Shipping },
        { model: Payment },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan." });
    }

    res.json(order);
  } catch (err) {
    console.error("Error fetching order detail:", err);
    res
      .status(500)
      .json({ message: "Gagal mengambil detail pesanan.", error: err.message });
  }
});

// Mendapatkan pesanan pengguna berdasarkan ID
router.get("/user/:userId", authenticateUser, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);

    if (parseInt(req.userId) !== userId) {
      return res.status(403).json({ message: "Akses ditolak." });
    }

    const orders = await Order.findAll({
      where: { user_id: userId },
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: Product,
              attributes: ["id", "name", "price", "thumbnail_url"],
            },
          ],
        },
        {
          model: Shipping,
          attributes: [
            "id",
            "shipping_address",
            "shipping_status",
            "shipped_at",
            "received_at",
          ],
        },
        {
          model: Payment,
          attributes: ["id", "payment_proof_url", "payment_status"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.json(orders);
  } catch (err) {
    console.error("Error fetching user orders:", err);
    res
      .status(500)
      .json({ message: "Gagal mengambil data pesanan.", error: err.message });
  }
});

// Rute untuk memperbarui status pesanan (untuk Admin)
router.put("/:orderId/status", async (req, res) => {
  const { orderStatus, shippingStatus, paymentStatus } = req.body;
  const { orderId } = req.params;
  try {
    const order = await Order.findByPk(orderId, {
      include: [{ model: User }],
    });
    if (!order) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan." });
    }
    
    if (orderStatus) {
       await order.update({ order_status: orderStatus });
    }
    
    if (shippingStatus) {
        let shipping = await Shipping.findOne({ where: { order_id: orderId } });
        const updateData = { shipping_status: shippingStatus };

        if (shippingStatus === 'dikirim') {
            updateData.shipped_at = new Date();
        } else if (shippingStatus === 'diterima') {
            updateData.received_at = new Date();
        }

        if (shipping) {
          await shipping.update(updateData);
        } else {
          shipping = await Shipping.create({
            order_id: orderId,
            shipping_address: order.User.address,
            ...updateData,
          });
        }
    }
    
    if (paymentStatus === 'verified') {
        const payment = await Payment.findOne({ where: { order_id: orderId } });
        if (payment) {
            await payment.update({ payment_status: 'verified' });
        }
        await order.update({ order_status: 'diproses' });
    }

    res.json({ message: "Status pesanan berhasil diperbarui.", order });
  } catch (err) {
    console.error("Error updating order status:", err);
    res
      .status(500)
      .json({ message: "Gagal memperbarui status pesanan.", error: err.message });
  }
});

// Rute untuk mengunggah bukti pembayaran (untuk User)
router.post(
  "/:orderId/payment",
  authenticateUser,
  formidable(),
  async (req, res) => {
    try {
      const { orderId } = req.params;
      const userId = req.userId;
      
      const order = await Order.findByPk(orderId);
      if (!order || order.user_id != userId) {
          return res.status(403).json({ message: "Akses ditolak atau pesanan tidak ditemukan." });
      }

      const paymentProof = req.files.paymentProof;
      const uploadDir = path.join(__dirname, "../../client/uploads/payments");

      if (!paymentProof) {
        return res
          .status(400)
          .json({ message: "File bukti pembayaran tidak ditemukan." });
      }
      
      await fs.mkdir(uploadDir, { recursive: true });
      
      const fileName = `${Date.now()}-${paymentProof.originalFilename || paymentProof.name}`;
      const newPath = path.join(uploadDir, fileName);

      // Salin file yang diunggah ke folder tujuan
      await fs.copyFile(paymentProof.filepath || paymentProof.path, newPath);
      // Hapus file sementara
      await deleteFile(paymentProof.filepath || paymentProof.path);

      const paymentProofUrl = `/uploads/payments/${fileName}`;

      let payment = await Payment.findOne({ where: { order_id: orderId } });

      if (payment) {
        // Hapus file lama jika ada
        if (payment.payment_proof_url) {
          const oldPath = path.join(__dirname, "../../client", payment.payment_proof_url);
          await deleteFile(oldPath);
        }
        await payment.update({ payment_proof_url: paymentProofUrl, payment_status: 'pending', uploaded_at: new Date() });
      } else {
        payment = await Payment.create({
          order_id: orderId,
          payment_proof_url: paymentProofUrl,
          payment_status: "pending",
          uploaded_at: new Date(),
        });
      }

      await order.update({ order_status: "menunggu pembayaran" });

      res.status(200).json({ message: "Bukti pembayaran berhasil diunggah." });
    } catch (err) {
      console.error("Error uploading payment proof:", err);
      res
        .status(500)
        .json({ message: "Gagal mengunggah bukti pembayaran.", error: err.message });
    }
  }
);

// Endpoint checkout
router.post("/checkout", authenticateUser, async (req, res) => {
  const transaction = await Order.sequelize.transaction();
  try {
    const userId = req.userId;

    const user = await User.findByPk(userId, { transaction });
    if (!user || !user.address) {
        await transaction.rollback();
        return res.status(400).json({ message: "Alamat pengguna tidak ditemukan. Harap lengkapi profil Anda." });
    }

    const cart = await Cart.findOne({
      where: { user_id: userId },
      include: [{
        model: CartItem,
        include: [{ model: Product }],
      }],
      transaction,
    });

    if (!cart || !cart.CartItems || cart.CartItems.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ message: "Keranjang Anda kosong." });
    }

    let total_price = 0;
    for (const item of cart.CartItems) {
      if (!item.Product) {
        await transaction.rollback();
        return res.status(404).json({ message: `Produk dengan ID ${item.product_id} tidak ditemukan.` });
      }
      total_price += item.Product.price * item.quantity;
    }

    const order = await Order.create({
      user_id: userId,
      order_status: "pending",
      total_price: total_price
    }, { transaction });
    
    // Buat entri shipping secara otomatis
    await Shipping.create({
        order_id: order.id,
        shipping_address: user.address,
        shipping_status: 'pending',
    }, { transaction });

    const orderItems = cart.CartItems.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.Product.price,
      size: item.size, // <-- Memindahkan ukuran dari keranjang ke pesanan
    }));

    await OrderItem.bulkCreate(orderItems, { transaction });

    await CartItem.destroy({ where: { cart_id: cart.id }, transaction });

    await transaction.commit();

    res.status(201).json({ message: "Checkout berhasil!", order_id: order.id });
  } catch (err) {
    await transaction.rollback();
    console.error("Error during checkout:", err);
    res.status(500).json({ message: "Gagal melakukan checkout.", error: err.message });
  }
});

module.exports = router;