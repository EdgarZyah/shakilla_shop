// server/controllers/paymentController.js
const db = require("../models/index");
const { Payment, Order } = db;
const { Op } = db.Sequelize;
// [BARU] Impor service email
const { sendAdminPaymentNotificationEmail } = require('../services/emailService');

// [USER] Mengunggah Bukti Pembayaran
exports.uploadPaymentProof = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Bukti pembayaran (file gambar) wajib diunggah." });
    }

    const { order_id } = req.body;
    const paymentProofUrl = `/uploads/payments/${req.file.filename}`;

    if (!order_id) {
      return res
        .status(400)
        .json({
          message: "ID Pesanan (order_id) tidak ditemukan dalam permintaan.",
        });
    }

    const orderId = parseInt(order_id);

    // [MODIFIKASI] Tambahkan 'include' untuk mengambil data User
    const order = await Order.findByPk(orderId, {
      include: [{ 
        model: db.User, 
        as: 'user', 
        attributes: ['first_name', 'last_name', 'email'] 
      }]
    });
    // ---

    if (!order || order.user_id !== userId) {
      return res
        .status(404)
        .json({ message: "Pesanan tidak ditemukan atau bukan milik Anda." });
    }

    let payment = await Payment.findOne({ where: { order_id: orderId } });

    if (payment) {
      payment.payment_proof_url = paymentProofUrl;
      payment.payment_status = "pending";
      payment.uploaded_at = new Date();
      await payment.save();
    } else {
      payment = await Payment.create({
        order_id: orderId,
        payment_proof_url: paymentProofUrl,
        payment_status: "pending",
      });
    }

    order.order_status = "menunggu verifikasi";
    await order.save();

    // [BARU] Panggil fungsi notifikasi email
    // Kita panggil tanpa 'await' (fire-and-forget) 
    // agar respons ke user tidak tertunda jika pengiriman email lambat.
    // Error logging sudah ditangani di dalam emailService.
    sendAdminPaymentNotificationEmail(order, payment);
    // ---

    res
      .status(200)
      .json({
        message:
          "Bukti pembayaran berhasil diunggah. Pesanan kini menunggu verifikasi admin.",
      });
  } catch (error) {
    if (
      error.name === "MulterError" ||
      error.message.includes("Hanya file gambar")
    ) {
      return res.status(400).json({ message: error.message });
    }
    console.error("Payment upload error:", error);
    res
      .status(500)
      .json({
        message: "Gagal mengunggah bukti pembayaran karena kesalahan server.",
        error: error.message,
      });
  }
};

// [ADMIN] Mendapatkan daftar pembayaran yang perlu diverifikasi
exports.getPendingPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      where: { payment_status: "pending" },
      include: [
        {
          model: Order,
          as: "order",
          attributes: ["id", "user_id", "total_price", "order_status"],
          include: [
            { model: db.User, as: "user", attributes: ["first_name", "email"] },
          ],
        },
      ],
      order: [["uploaded_at", "ASC"]],
    });
    res.status(200).json({ payments });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Gagal mengambil daftar pembayaran pending.",
        error: error.message,
      });
  }
};

// [ADMIN] Verifikasi Pembayaran (Diperbarui untuk menangani status baru)
exports.verifyPayment = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const { id } = req.params; 
    const payment = await Payment.findByPk(id, { transaction: t });

    if (!payment) {
      await t.rollback();
      return res
        .status(404)
        .json({ message: "Data pembayaran tidak ditemukan." });
    }

    const order = await Order.findByPk(payment.order_id, { transaction: t });

    if (!order) {
      await t.rollback();
      return res
        .status(404)
        .json({ message: "Order terkait tidak ditemukan." });
    }
    if (
      order.order_status === "dibatalkan" ||
      order.order_status === "selesai"
    ) {
      await t.rollback();
      return res
        .status(400)
        .json({
          message:
            "Tidak dapat memverifikasi pembayaran untuk pesanan yang sudah selesai/dibatalkan.",
        });
    }

    if (order.order_status !== "menunggu verifikasi") {
      await t.rollback();
      return res
        .status(400)
        .json({
          message: `Pesanan #${order.id} tidak dalam status 'menunggu verifikasi'. Status saat ini: ${order.order_status}.`,
        });
    }
    payment.payment_status = "verified";
    await payment.save({ transaction: t });

    order.order_status = "diproses";
    await order.save({ transaction: t });

    await t.commit();

    res.status(200).json({
      message: `Pembayaran Order #${order.id} berhasil diverifikasi. Status order diubah menjadi "diproses".`,
      payment,
      order,
    });
  } catch (error) {
    await t.rollback();
    console.error("Payment verification error:", error);
    res
      .status(500)
      .json({
        message: "Gagal memverifikasi pembayaran karena kesalahan server.",
        error: error.message,
      });
  }
};