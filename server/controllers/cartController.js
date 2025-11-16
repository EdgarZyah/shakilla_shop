// server/controllers/cartController.js
const db = require('../models/index');
// Kita perlu ProductVariant dan Product sekarang
const { Cart, CartItem, Product, ProductVariant } = db;
const { Op } = db.Sequelize;

// Fungsi utilitas untuk mendapatkan atau membuat Keranjang User
const getOrCreateCart = async (userId) => {
    let cart = await Cart.findOne({ where: { user_id: userId } });
    if (!cart) {
        cart = await Cart.create({ user_id: userId });
    }
    return cart;
};

// Opsi include untuk keranjang
const cartIncludeOptions = {
    model: CartItem,
    as: 'items',
    required: false,
    include: [{
        model: ProductVariant, // Include varian
        as: 'productVariant',
        required: true, // Pastikan varian ada
        include: [{
            model: Product, // Include produk induk (untuk nama, gambar)
            as: 'product',
            attributes: ['id', 'name', 'thumbnail_url', 'image_url']
        }]
    }]
};

// [USER] Mengambil Keranjang Belanja dan isinya
exports.getCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const cart = await Cart.findOne({
            where: { user_id: userId },
            include: [cartIncludeOptions]
        });

        if (!cart) {
            return res.status(200).json({ cartId: null, items: [], totalPrice: 0, totalItems: 0 });
        }
        
        const items = cart.items || [];
        
        const totalPrice = items.reduce((total, item) => {
            // Harga sekarang ada di varian
            const price = item.productVariant?.price ? parseFloat(item.productVariant.price) : 0;
            const qty = item.quantity ? parseInt(item.quantity) : 0;
            return total + (price * qty);
        }, 0);

        res.status(200).json({ 
            cartId: cart.id,
            items: items, // Frontend harus menyesuaikan dengan struktur baru ini
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
        // HANYA menerima product_variant_id
        const { product_variant_id, quantity } = req.body; 

        if (!product_variant_id || !quantity) {
            return res.status(400).json({ message: 'Product Variant ID dan Quantity wajib diisi.' });
        }
        
        const requestedQuantity = parseInt(quantity);
        
        // 1. Temukan Varian dan cek stok
        const variant = await ProductVariant.findByPk(product_variant_id);
        if (!variant) {
             return res.status(404).json({ message: 'Varian produk tidak ditemukan.' });
        }
        if (variant.stock < requestedQuantity) {
            return res.status(400).json({ message: 'Stok untuk varian ini tidak mencukupi.' });
        }

        const cart = await getOrCreateCart(userId);
        
        // 2. Cari item di keranjang berdasarkan variant_id
        let cartItem = await CartItem.findOne({
            where: {
                cart_id: cart.id,
                product_variant_id: product_variant_id,
            }
        });

        if (cartItem) {
            // Item sudah ada, update kuantitas
            const newQuantity = cartItem.quantity + requestedQuantity;
            
            // Cek stok lagi untuk kuantitas gabungan
            if (variant.stock < newQuantity) {
                 return res.status(400).json({ message: `Stok tidak mencukupi. Anda sudah punya ${cartItem.quantity} di keranjang.` });
            }
            
            cartItem.quantity = newQuantity;
            await cartItem.save();
        } else {
            // Item baru, buat item
            cartItem = await CartItem.create({
                cart_id: cart.id,
                product_variant_id: product_variant_id,
                quantity: requestedQuantity,
            });
        }
        
        // Ambil data lengkap untuk dikembalikan ke frontend
        const updatedCartItem = await CartItem.findByPk(cartItem.id, {
             include: [cartIncludeOptions.include[0]] // Include yang sama dengan getCart
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

// [USER] Memperbarui Kuantitas Item di Keranjang
exports.updateCartItemQuantity = async (req, res) => {
    try {
        const userId = req.user.id;
        const itemId = req.params.itemId; // Item ID (cart_item ID)
        const { quantity } = req.body; // New quantity

        const newQuantity = parseInt(quantity);

        if (isNaN(newQuantity) || newQuantity < 1) {
            return res.status(400).json({ message: 'Kuantitas harus berupa angka positif.' });
        }

        const cart = await Cart.findOne({ where: { user_id: userId } });
        if (!cart) {
            return res.status(404).json({ message: 'Keranjang tidak ditemukan.' });
        }

        const cartItem = await CartItem.findOne({ 
            where: { id: itemId, cart_id: cart.id },
            include: [{ model: ProductVariant, as: 'productVariant' }] // Include varian untuk cek stok
        });

        if (!cartItem) {
            return res.status(404).json({ message: 'Item keranjang tidak ditemukan.' });
        }
        
        // 2. Cek Stok
        const variant = cartItem.productVariant;
        if (variant.stock < newQuantity) {
            return res.status(400).json({ message: `Stok varian (${variant.stock}) tidak mencukupi untuk kuantitas ${newQuantity}.` });
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