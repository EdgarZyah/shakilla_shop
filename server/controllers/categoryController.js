// server/controllers/categoryController.js
const db = require('../models/index');
const { Category } = db;
const { Op } = db.Sequelize;

// [ADMIN & PUBLIC] Ambil semua kategori
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            attributes: ['id', 'name', 'description']
        });
        res.status(200).json({ categories });
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil kategori.', error: error.message });
    }
};

// [ADMIN] Buat kategori baru
exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Nama kategori wajib diisi.' });
        }

        const newCategory = await Category.create({ name, description });
        res.status(201).json({ 
            message: 'Kategori berhasil dibuat.', 
            category: newCategory 
        });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Nama kategori sudah ada.' });
        }
        res.status(500).json({ message: 'Gagal membuat kategori.', error: error.message });
    }
};

// [ADMIN] Update kategori
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const [updatedRows] = await Category.update(
            { name, description },
            { where: { id } }
        );

        if (updatedRows === 0) {
            return res.status(404).json({ message: 'Kategori tidak ditemukan atau tidak ada perubahan.' });
        }
        
        const updatedCategory = await Category.findByPk(id);

        res.status(200).json({ 
            message: 'Kategori berhasil diperbarui.', 
            category: updatedCategory 
        });
    } catch (error) {
        res.status(500).json({ message: 'Gagal memperbarui kategori.', error: error.message });
    }
};

// [ADMIN] Hapus kategori
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedRows = await Category.destroy({ where: { id } });

        if (deletedRows === 0) {
            return res.status(404).json({ message: 'Kategori tidak ditemukan.' });
        }

        res.status(200).json({ message: 'Kategori berhasil dihapus.' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus kategori.', error: error.message });
    }
};