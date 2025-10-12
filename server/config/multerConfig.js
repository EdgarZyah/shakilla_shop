// server/config/multerConfig.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Utility untuk membuat folder kalau belum ada
function ensureDirExistence(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// === CONFIG UNTUK PRODUK ===
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.resolve(__dirname, '../uploads/products');
    ensureDirExistence(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// === CONFIG UNTUK PEMBAYARAN ===
const paymentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.resolve(__dirname, '../uploads/payments');
    ensureDirExistence(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Hanya file gambar yang diizinkan!'), false);
};

const productUpload = multer({
  storage: productStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'images', maxCount: 4 },
]);

const paymentUpload = multer({
  storage: paymentStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('payment_proof');

module.exports = { productUpload, paymentUpload };
