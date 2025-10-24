// server/controllers/userController.js
const db = require('../models/index');
const { User, Cart, Order, Message } = db;
const { Op } = db.Sequelize;

// [USER] Mengambil data profil sendiri (sudah ada di authController.js, tapi ini versi lebih lengkap)
exports.getProfile = async (req, res) => {
    try {
        // Data user sudah tersedia di req.user dari middleware authenticate
        const userProfile = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });

        if (!userProfile) {
            return res.status(404).json({ message: 'Profil pengguna tidak ditemukan.' });
        }

        res.status(200).json({ 
            message: 'Profil berhasil diambil.',
            user: userProfile 
        });
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil profil.', error: error.message });
    }
};

// [USER] edit profil sendiri
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { firstName, lastName, username, email, password, address, zipCode, phone } = req.body;

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
        }

        // Cek duplikasi email/username
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [{ email }, { username }],
                id: { [Op.ne]: userId } // Kecuali ID sendiri
            }
        });

        if (existingUser) {
            let field = existingUser.email === email ? 'Email' : 'Username';
            return res.status(409).json({ message: `${field} sudah digunakan oleh pengguna lain.` });
        }

        // Siapkan data yang akan diupdate
        const updateData = {
            first_name: firstName || user.first_name,
            last_name: lastName || user.last_name,
            username: username || user.username,
            email: email || user.email,
            address: address || user.address,
            zip_code: zipCode || user.zip_code,
            phone: phone || user.phone,
        };

        // Jika password diisi, password akan otomatis di-hash oleh hook di model user.js
        if (password) {
            updateData.password = password;
        }

        await user.update(updateData);
        
        // Hapus password dari respons
        const updatedUser = await User.findByPk(userId, {
            attributes: { exclude: ['password'] }
        });

        res.status(200).json({ 
            message: 'Profil berhasil diperbarui.',
            user: updatedUser
        });

    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: 'Gagal memperbarui profil.', error: error.message });
    }
};

// [ADMIN] Mengambil daftar semua pengguna
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            order: [['created_at', 'DESC']]
        });
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil daftar pengguna.', error: error.message });
    }
};

// [ADMIN] Mengambil detail pengguna
exports.getUserDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id, {
            attributes: { exclude: ['password'] },
            include: [
                { model: Cart, as: 'carts' },
                { model: Order, as: 'orders' }
            ]
        });

        if (!user) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
        }

        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil detail pengguna.', error: error.message });
    }
};

// [ADMIN] Mengubah peran (role) pengguna
exports.updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!role || !['user', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Peran tidak valid.' });
        }
        
        const [updatedRows] = await User.update({ role }, { where: { id } });

        if (updatedRows === 0) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
        }

        const updatedUser = await User.findByPk(id, { attributes: { exclude: ['password'] } });

        res.status(200).json({ 
            message: `Peran pengguna #${id} berhasil diubah menjadi ${role}.`, 
            user: updatedUser
        });
    } catch (error) {
        res.status(500).json({ message: 'Gagal memperbarui peran pengguna.', error: error.message });
    }
};

// [ADMIN] Menghapus pengguna
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Hapus juga cart, order, dan message terkait (CASCADE di Migrasi)
        const deletedRows = await User.destroy({ where: { id } });

        if (deletedRows === 0) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
        }

        res.status(200).json({ message: 'Pengguna berhasil dihapus.' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus pengguna.', error: error.message });
    }
};

// [USER/ADMIN] Memperbarui password sendiri
exports.updateUserPassword = async (req, res) => {
    try {
        const userId = req.user.id; // User ID diambil dari token
        const { newPassword } = req.body; // Terima field 'newPassword'

        if (!newPassword || newPassword.length < 8) {
            return res.status(400).json({ message: 'Password baru wajib diisi dan minimal 8 karakter.' });
        }

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
        }
        
        // Update password. Hook beforeUpdate di model akan otomatis me-hash.
        user.password = newPassword;
        await user.save(); // Gunakan save() agar hook beforeUpdate terpicu

        res.status(200).json({ 
            message: 'Password berhasil diperbarui.'
        });

    } catch (error) {
        console.error("Error updating password:", error);
        res.status(500).json({ message: 'Gagal memperbarui password.', error: error.message });
    }
};