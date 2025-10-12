// server/controllers/messageController.js
const db = require('../models/index');
const { Message, User } = db;

// [USER] Mengirim pesan baru
exports.createMessage = async (req, res) => {
    try {
        const userId = req.user.id;
        const { messageText } = req.body;

        if (!messageText) {
            return res.status(400).json({ message: 'Isi pesan wajib diisi.' });
        }

        const newMessage = await Message.create({
            user_id: userId,
            message_text: messageText
        });

        res.status(201).json({ 
            message: 'Pesan berhasil dikirim. Kami akan segera menghubungi Anda.', 
            data: newMessage 
        });

    } catch (error) {
        console.error("Error creating message:", error);
        res.status(500).json({ message: 'Gagal mengirim pesan.', error: error.message });
    }
};

// [ADMIN] Mengambil semua pesan
exports.getAllMessages = async (req, res) => {
    try {
        const messages = await Message.findAll({
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'first_name', 'email', 'phone']
            }],
            order: [['created_at', 'DESC']]
        });
        res.status(200).json({ messages });
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil daftar pesan.', error: error.message });
    }
};

// [ADMIN] Menghapus pesan
exports.deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedRows = await Message.destroy({ where: { id } });

        if (deletedRows === 0) {
            return res.status(404).json({ message: 'Pesan tidak ditemukan.' });
        }

        res.status(200).json({ message: 'Pesan berhasil dihapus.' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus pesan.', error: error.message });
    }
};