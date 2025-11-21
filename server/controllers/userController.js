// server/controllers/userController.js
const db = require('../models/index');
const { User, Cart, Order, Message, Visitor } = db;
const { Op } = db.Sequelize;

// [USER] Mengambil data profil sendiri
exports.getProfile = async (req, res) => {
    try {
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

        if(email || username) {
             const existingUser = await User.findOne({
                where: {
                    [Op.or]: [{ email: email || null }, { username: username || null }],
                    id: { [Op.ne]: userId } 
                }
            });
            if (existingUser) {
                let field = existingUser.email === email ? 'Email' : 'Username';
                return res.status(409).json({ message: `${field} sudah digunakan oleh pengguna lain.` });
            }
        }

        if (phone && phone !== user.phone_number) { 
            const existingPhone = await User.findOne({
                where: {
                    phone_number: phone,
                    id: { [Op.ne]: userId }
                }
            });
            if (existingPhone) {
                return res.status(409).json({ message: "Nomor telepon sudah digunakan oleh pengguna lain." });
            }
        }

        const updateData = {
            first_name: firstName || user.first_name,
            last_name: lastName || user.last_name,
            username: username || user.username,
            email: email || user.email,
            address: address || user.address,
            zip_code: zipCode || user.zip_code,
            phone_number: phone || user.phone_number,
        };

        if (password) {
            updateData.password = password;
        }

        await user.update(updateData);
        
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
        const userId = req.user.id;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 8) {
            return res.status(400).json({ message: 'Password baru wajib diisi dan minimal 8 karakter.' });
        }

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
        }
        
        user.password = newPassword;
        await user.save();

        res.status(200).json({ 
            message: 'Password berhasil diperbarui.'
        });

    } catch (error) {
        console.error("Error updating password:", error);
        res.status(500).json({ message: 'Gagal memperbarui password.', error: error.message });
    }
};

// [ADMIN] Mengambil data statistik untuk dashboard (REAL DATA & DINAMIS)
exports.getDashboardStats = async (req, res) => {
    try {
        // [PERBAIKAN UTAMA] Ambil parameter 'days' dari query URL. Default ke 7 jika tidak ada.
        const daysParam = req.query.days ? parseInt(req.query.days) : 20;
        
        const labels = [];
        const data = [];
        const today = new Date();

        // Loop mundur sesuai jumlah hari yang diminta (daysParam)
        // Jika 7 hari -> i = 6, 5, 4... 0
        // Jika 30 hari -> i = 29, 28... 0
        for (let i = daysParam - 1; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            
            // 1. Siapkan Label (Contoh: "20 Nov")
            const dateLabel = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
            labels.push(dateLabel);

            // 2. Siapkan Format Tanggal DB (YYYY-MM-DD)
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const dbDateString = `${year}-${month}-${day}`;

            // 3. Hitung jumlah visitor unik pada tanggal tersebut
            // Pastikan tabel Visitor sudah ada & model diimport dengan benar
            let count = 0;
            if (Visitor) {
                count = await Visitor.count({
                    where: {
                        visit_date: dbDateString
                    }
                });
            }
            
            data.push(count);
        }

        res.status(200).json({
            labels, 
            data    
        });

    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        // Fallback agar chart tidak error
        res.status(200).json({ labels: [], data: [] });
    }
};