const express = require('express');
const router = express.Router();
const upload = require('../config/cloudinary');
const merchantController = require('../controllers/merchantController');

// Quán ăn
router.get('/store', merchantController.getStoreInfo);
router.put('/store', merchantController.updateStoreInfo);

// Thực đơn
router.get('/menu', merchantController.getMenu);
router.post('/categories', merchantController.addCategory);
router.post('/products', upload.single('image'), merchantController.addProduct);
router.put('/products/:id', upload.single('image'), merchantController.updateProduct);
router.delete('/products/:id', merchantController.deleteProduct);

// Đơn hàng
router.get('/orders', merchantController.getOrders);
router.put('/orders/:id/status', merchantController.updateOrderStatus);

// Thống kê
router.get('/dashboard', merchantController.getDashboard);

module.exports = router;
