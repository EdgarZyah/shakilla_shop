const db = require('../models/index');
const { Cart, CartItem, Product } = db;
const { Op } = db.Sequelize;

// Fungsi utilitas untuk mendapatkan atau membuat Keranjang User
const getOrCreateCart = async (userId) => {
    let cart = await Cart.findOne({ where: { user_id: userId } });
    if (!cart) {
        cart = await Cart.create({ user_id: userId });
    }
    return cart;
};

// [USER] Mengambil Keranjang Belanja dan isinya
exports.getCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const cart = await Cart.findOne({
            where: { user_id: userId },
            include: [{
                model: CartItem,
                as: 'items',
                required: false,
                include: [{
                    model: Product,
                    as: 'product', // ALIAS HARUS 'product' (huruf kecil)
                    attributes: ['id', 'name', 'price', 'stock', 'thumbnail_url', 'image_url']
                }]
            }]
        });

        if (!cart) {
            return res.status(200).json({ cartId: null, items: [], totalPrice: 0, totalItems: 0 });
        }
        
        const items = cart.items || [];
        
        const totalPrice = items.reduce((total, item) => {
            const price = item.product?.price ? parseFloat(item.product.price) : 0;
            const qty = item.quantity ? parseInt(item.quantity) : 0;
            return total + (price * qty);
        }, 0);

        res.status(200).json({ 
            cartId: cart.id,
            items: items,
            totalPrice: parseFloat(totalPrice).toFixed(2),
            totalItems: items.length
        });

    } catch (error) {
        console.error("Error getting cart:", error);
        res.status(500).json({ message: 'Gagal mengambil keranjang.', error: error.message });
    }
};

// [USER] Menambah atau Mengupdate item di Keranjang
exports.addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { product_id, quantity, size } = req.body; 

        if (!product_id || !quantity) {
            return res.status(400).json({ message: 'Product ID dan Quantity wajib diisi.' });
        }
        if (!size) {
             return res.status(400).json({ message: 'Ukuran produk wajib diisi.' });
        }

        const product = await Product.findByPk(product_id);
        if (!product || product.stock < quantity) {
            return res.status(400).json({ message: 'Produk tidak ditemukan atau stok tidak mencukupi.' });
        }

        const cart = await getOrCreateCart(userId);
        
        let cartItem = await CartItem.findOne({
            where: {
                cart_id: cart.id,
                product_id: product_id,
                size: size 
            }
        });

        if (cartItem) {
            cartItem.quantity += parseInt(quantity);
            await cartItem.save();
        } else {
            cartItem = await CartItem.create({
                cart_id: cart.id,
                product_id: product_id,
                quantity: parseInt(quantity),
                size: size 
            });
        }
        
        const updatedCartItem = await CartItem.findByPk(cartItem.id, {
             include: [{ model: Product, as: 'product' }]
        });

        res.status(200).json({ 
            message: 'Produk berhasil ditambahkan ke keranjang.', 
            cartItem: updatedCartItem 
        });

    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({ message: 'Gagal menambah item ke keranjang.', error: error.message });
    }
};

// [USER] Memperbarui Kuantitas Item di Keranjang (BARU)
exports.updateCartItemQuantity = async (req, res) => {
    try {
        const userId = req.user.id;
        const itemId = req.params.itemId; // Item ID (cart_item ID)
        const { quantity } = req.body; // New quantity

        const newQuantity = parseInt(quantity);

        if (isNaN(newQuantity) || newQuantity < 1) {
            return res.status(400).json({ message: 'Kuantitas harus berupa angka positif.' });
        }

        // 1. Temukan cart item dan pastikan milik user yang benar
        const cart = await Cart.findOne({ where: { user_id: userId } });
        
        if (!cart) {
            return res.status(404).json({ message: 'Keranjang tidak ditemukan.' });
        }

        const cartItem = await CartItem.findOne({ 
            where: { id: itemId, cart_id: cart.id },
            include: [{ model: Product, as: 'product' }] // Untuk cek stok
        });

        if (!cartItem) {
            return res.status(404).json({ message: 'Item keranjang tidak ditemukan.' });
        }
        
        // 2. Cek Stok
        const product = cartItem.product;
        if (product.stock < newQuantity) {
            return res.status(400).json({ message: `Stok produk (${product.stock}) tidak mencukupi untuk kuantitas ${newQuantity}.` });
        }

        // 3. Update Kuantitas
        cartItem.quantity = newQuantity;
        await cartItem.save();

        res.status(200).json({ 
            message: 'Kuantitas item berhasil diperbarui.', 
            cartItem: cartItem 
        });

    } catch (error) {
        console.error("Error updating cart item quantity:", error);
        res.status(500).json({ message: 'Gagal memperbarui kuantitas item.', error: error.message });
    }
};

// [USER] Menghapus item dari Keranjang
exports.removeItemFromCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { itemId } = req.params;

        const cart = await Cart.findOne({ where: { user_id: userId } });
        if (!cart) {
            return res.status(404).json({ message: 'Keranjang tidak ditemukan.' });
        }

        const deletedRows = await CartItem.destroy({
            where: {
                id: itemId,
                cart_id: cart.id
            }
        });

        if (deletedRows === 0) {
            return res.status(404).json({ message: 'Item keranjang tidak ditemukan.' });
        }

        res.status(200).json({ message: 'Item berhasil dihapus dari keranjang.' });

    } catch (error) {
        console.error("Error removing item from cart:", error);
        res.status(500).json({ message: 'Gagal menghapus item dari keranjang.', error: error.message });
    }
    
};

// [USER] Menghapus seluruh isi Keranjang
exports.clearCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const cart = await Cart.findOne({ where: { user_id: userId } });
        
        if (!cart) {
            return res.status(200).json({ message: 'Keranjang sudah kosong.' });
        }

        await CartItem.destroy({ where: { cart_id: cart.id } });

        res.status(200).json({ message: 'Keranjang berhasil dikosongkan.' });

    } catch (error) {
        console.error("Error clearing cart:", error);
        res.status(500).json({ message: 'Gagal mengosongkan keranjang.', error: error.message });
    }
    
};