const express = require("express");
const router = express.Router();
const { User, Cart, CartItem, Order, OrderItem } = require("../models");
const { Op } = require("sequelize");

// Middleware untuk otentikasi sederhana
const authenticateUser = (req, res, next) => {
    const userId = req.cookies.userId;
    if (!userId) {
        return res.status(401).json({ message: "Akses ditolak. Tidak ada user yang terautentikasi." });
    }
    req.userId = userId;
    next();
};

router.post("/checkout", authenticateUser, async (req, res) => {
    const transaction = await User.sequelize.transaction();
    try {
        const userId = req.userId;

        // 1. Ambil keranjang pengguna
        const cart = await Cart.findOne({
            where: { user_id: userId },
            include: [{ model: CartItem }],
            transaction
        });

        if (!cart || !cart.CartItems || cart.CartItems.length === 0) {
            await transaction.rollback();
            return res.status(400).json({ message: "Keranjang Anda kosong." });
        }

        // 2. Hitung total harga
        let total_price = 0;
        for (const item of cart.CartItems) {
            const product = await OrderItem.sequelize.models.Product.findByPk(item.product_id, { transaction });
            if (!product) {
                await transaction.rollback();
                return res.status(404).json({ message: `Produk dengan ID ${item.product_id} tidak ditemukan.` });
            }
            total_price += product.price * item.quantity;
        }

        // 3. Buat pesanan baru
        const order = await Order.create({
            user_id: userId,
            order_status: "pending",
            total_price: total_price
        }, { transaction });

        // 4. Pindahkan item dari keranjang ke pesanan
        const orderItems = cart.CartItems.map(item => ({
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity
        }));

        await OrderItem.bulkCreate(orderItems, { transaction });

        // 5. Hapus item dari keranjang
        await CartItem.destroy({ where: { cart_id: cart.id }, transaction });

        // Komit transaksi
        await transaction.commit();

        res.status(201).json({ message: "Checkout berhasil!", order_id: order.id });
    } catch (err) {
        await transaction.rollback();
        console.error("Error during checkout:", err);
        res.status(500).json({ message: "Gagal melakukan checkout.", error: err.message });
    }
});

module.exports = router;