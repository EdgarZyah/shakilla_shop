// server/controllers/orderController.js
const db = require('../models/index');
const { Order, OrderItem, Cart, CartItem, Product, Payment, User } = db;

// --- PERBAIKAN UTAMA ---
// Ambil instance sequelize langsung dari 'db'
const { sequelize } = db; 
// Ambil object Operator (Op) dari library Sequelize ('db.Sequelize')
const { Op } = db.Sequelize;
// --- AKHIR PERBAIKAN ---


// Standard includes untuk mengambil detail Pesanan (FIXED ALIASES)
const orderIncludeOptions = (includeUser = false) => {
    // ... (sisa kode tidak perlu diubah) ...
    const includes = [
        {
            model: OrderItem,
            as: 'items', // Alias OrderItem
            required: false,
            include: [{
                model: Product,
                as: 'product', // Alias Product di dalam OrderItem
                attributes: ['id', 'name', 'price', 'stock', 'thumbnail_url', 'image_url']
            }]
        },
        {
            model: Payment,
            as: 'payment', // Alias Payment
        }
    ];

    if (includeUser) {
        includes.push({
            model: User,
            as: 'user', // FIX: Alias lowercase 'user'
            attributes: ['id', 'first_name', 'last_name', 'email', 'address']
        });
    }

    return includes;
};

// [USER] Melakukan Checkout (Membuat Order dari Cart)
exports.checkout = async (req, res) => {
    const t = await sequelize.transaction(); // Mulai transaksi
    try {
        const userId = req.user.id;
        const { shipping_address } = req.body;

        if (!shipping_address) {
            await t.rollback();
            return res.status(400).json({ message: 'Alamat pengiriman wajib diisi.' });
        }

        // 1. Ambil Keranjang dan Itemnya
        const cart = await Cart.findOne({
            where: { user_id: userId },
            include: [{
                model: CartItem,
                as: 'items',
                include: [{ model: Product, as: 'product' }]
            }],
            transaction: t
        });

        if (!cart || cart.items.length === 0) {
            await t.rollback();
            return res.status(400).json({ message: 'Keranjang kosong, tidak dapat checkout.' });
        }

        let total_price = 0;
        const orderItemsData = [];
        const stockUpdates = [];

        // 2. Validasi Stok dan Hitung Total Harga
        for (const item of cart.items) {
            const product = item.product;
            
            // FIX UTAMA: Cek jika produk telah dihapus (NULL Product object)
            if (!product) { 
                 await t.rollback();
                 return res.status(400).json({ message: `Checkout gagal: Salah satu produk di keranjang (ID: ${item.product_id}) tidak valid atau sudah dihapus.` });
            }

            // Konversi nilai dengan safety check
            const itemPrice = parseFloat(product.price || 0); 
            const itemStock = parseInt(product.stock || 0);
            const itemQty = parseInt(item.quantity || 0);
            
            if (itemQty <= 0) {
                 await t.rollback();
                 return res.status(400).json({ message: `Kuantitas untuk produk ${product.name} harus positif.` });
            }

            if (itemStock < itemQty) {
                await t.rollback();
                return res.status(400).json({ message: `Stok untuk produk ${product.name} (${itemStock}) tidak mencukupi untuk kuantitas ${itemQty}.` });
            }

            total_price += itemQty * itemPrice;

            orderItemsData.push({
                product_id: product.id,
                quantity: itemQty,
                // PERBAIKAN: Format itemPrice menjadi string 2 desimal agar sesuai dengan tipe data DECIMAL di DB
                price: itemPrice.toFixed(2), 
                size: item.size
            });

            stockUpdates.push({
                id: product.id,
                newStock: itemStock - itemQty
            });
        }
        
        const finalTotalPrice = parseFloat(total_price).toFixed(2);


        // 3. Buat Order Baru
        const newOrder = await Order.create({
            user_id: userId,
            total_price: finalTotalPrice,
            shipping_address: shipping_address,
            order_status: 'menunggu pembayaran'
        }, { transaction: t });

        // 4. Buat Order Items
        const itemsWithOrderId = orderItemsData.map(item => ({ ...item, order_id: newOrder.id }));
        await OrderItem.bulkCreate(itemsWithOrderId, { transaction: t });

        // 5. Update Stok Produk
        for (const update of stockUpdates) {
            await Product.update(
                { stock: update.newStock },
                { where: { id: update.id }, transaction: t }
            );
        }

        // 6. Kosongkan Keranjang (hapus Cart Items)
        await CartItem.destroy({ where: { cart_id: cart.id }, transaction: t });

        await t.commit(); // Commit transaksi

        res.status(201).json({
            message: 'Checkout berhasil! Order menunggu pembayaran.',
            order: newOrder
        });

    } catch (error) {
        await t.rollback();
        console.error('Checkout error:', error);
        res.status(500).json({ message: 'Checkout gagal karena kesalahan server.', error: error.message });
    }
};

// [USER & ADMIN] Mendapatkan daftar Order (untuk orders.jsx dan receipt.jsx)
exports.getOrders = async (req, res) => {
    try {
        const isAdmin = req.user.role === 'admin';
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
            order: [['created_at', 'DESC']],
        });
        
        if (isAdmin && !req.query.user_id) {
            return res.status(200).json(orders); 
        }
        
        return res.status(200).json({ orders }); 

    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ message: 'Gagal mengambil daftar order.', error: error.message });
    }
};


// [USER & ADMIN] Mendapatkan detail Order
exports.getOrderDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const role = req.user.role;
        const userId = req.user.id;
        
        let whereCondition = { id };
        if (role !== 'admin') {
            whereCondition.user_id = userId;
        }

        const order = await Order.findOne({
            where: whereCondition,
            include: orderIncludeOptions(true)
        });

        if (!order) {
            return res.status(404).json({ message: 'Pesanan tidak ditemukan atau akses ditolak.' });
        }

        res.status(200).json({ order });
    } catch (error) {
        console.error('Get order detail error:', error);
        res.status(500).json({ message: 'Gagal mengambil detail order.', error: error.message });
    }
};

// [ADMIN] Mengubah Status Order (Misal: Diproses, Dikirim, Dibatalkan)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { order_status } = req.body; 
        
        const validStatuses = ["menunggu verifikasi", "diproses", "dikirim", "diterima", "selesai", "dibatalkan"];
        if (!order_status || !validStatuses.includes(order_status)) {
            return res.status(400).json({ message: 'Status order tidak valid.' });
        }

        const order = await Order.findByPk(id);

        if (!order) {
            return res.status(404).json({ message: 'Order tidak ditemukan.' });
        }
        
        const updateFields = { order_status };

        if (order_status === 'dikirim' && !order.shipped_at) {
            updateFields.shipped_at = new Date();
        }
        
        if (order_status === 'diterima' && !order.received_at) {
            updateFields.received_at = new Date();
            updateFields.order_status = 'selesai'; 
        }

        await order.update(updateFields);

        res.status(200).json({ 
            message: `Status Order #${id} berhasil diubah menjadi ${updateFields.order_status}.`, 
            order 
        });

    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ message: 'Gagal memperbarui status order.', error: error.message });
    }
};