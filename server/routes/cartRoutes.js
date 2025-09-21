const express = require("express");
const router = express.Router();
const { Cart, CartItem, Product } = require("../models");
const { Op } = require("sequelize");

const authenticateUser = (req, res, next) => {
  const userId = req.cookies.userId;
  if (!userId) {
    return res.status(401).json({ message: "Akses ditolak. Tidak ada user yang terautentikasi." });
  }
  req.userId = userId;
  next();
};

router.get("/carts/user/:userId", authenticateUser, async (req, res) => {
    try {
        const userId = parseInt(req.params.userId, 10);
        if (parseInt(req.userId) !== userId) {
            return res.status(403).json({ message: "Akses ditolak." });
        }
        
        const cart = await Cart.findOne({
            where: { user_id: userId },
            include: [{
                model: CartItem,
                include: [{
                    model: Product,
                    attributes: ['id', 'name', 'price', 'thumbnail_url']
                }]
            }]
        });
        
        if (!cart) {
            return res.status(200).json({ cart: null, message: "Keranjang kosong." });
        }
        
        res.json(cart);
    } catch (err) {
        console.error("Error fetching user cart:", err);
        res.status(500).json({ message: "Gagal mengambil data keranjang.", error: err.message });
    }
});

router.post("/carts", authenticateUser, async (req, res) => {
    try {
        const { product_id, quantity } = req.body;
        const userId = req.userId;
        
        let cart = await Cart.findOne({ where: { user_id: userId } });
        if (!cart) {
            cart = await Cart.create({ user_id: userId });
        }
        
        let cartItem = await CartItem.findOne({ 
            where: {
                cart_id: cart.id,
                product_id: product_id
            }
        });
        
        if (cartItem) {
            cartItem.quantity += quantity;
            await cartItem.save();
        } else {
            const product = await Product.findByPk(product_id);
            if (!product) {
                return res.status(404).json({ message: "Produk tidak ditemukan." });
            }
            cartItem = await CartItem.create({
                cart_id: cart.id,
                product_id: product_id,
                quantity: quantity
            });
        }
        
        res.status(200).json({ message: "Produk berhasil ditambahkan ke keranjang!", cartItem });
    } catch (err) {
        console.error("Error adding to cart:", err);
        res.status(500).json({ message: "Gagal menambahkan produk ke keranjang.", error: err.message });
    }
});

router.delete("/carts/item/:itemId", authenticateUser, async (req, res) => {
    try {
        const itemId = req.params.itemId;
        const userId = req.userId;
        
        const cart = await Cart.findOne({ where: { user_id: userId } });
        if (!cart) {
            return res.status(404).json({ message: "Keranjang tidak ditemukan." });
        }
        
        const cartItem = await CartItem.findOne({ where: { id: itemId, cart_id: cart.id } });
        if (!cartItem) {
            return res.status(404).json({ message: "Item keranjang tidak ditemukan." });
        }
        
        await cartItem.destroy();
        res.status(200).json({ message: "Item berhasil dihapus dari keranjang." });
    } catch (err) {
        console.error("Error removing from cart:", err);
        res.status(500).json({ message: "Gagal menghapus item dari keranjang.", error: err.message });
    }
});

module.exports = router;