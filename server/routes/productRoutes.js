const express = require('express');
const router = express.Router();
const { productUpload } = require('../config/multerConfig');
const productController = require('../controllers/productController');
const { authenticate, isAdmin } = require('../middlewares/auth');

// PUBLIC ROUTES
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductDetail);

// ADMIN ROUTES
router.post('/', authenticate, isAdmin, productUpload, productController.createProduct);
router.put('/:id', authenticate, isAdmin, productUpload, productController.updateProduct);
router.delete('/:id', authenticate, isAdmin, productController.deleteProduct);

module.exports = router;
