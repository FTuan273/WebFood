const express = require('express');
const router  = express.Router();
const path    = require('path');
const { protect, authorize } = require('../middleware/auth.middleware');
const upload = require('../utils/upload');
const ctrl   = require('../controllers/merchant.controller');

// Tất cả route đều yêu cầu đăng nhập và quyền Merchant
router.use(protect, authorize('Merchant'));

// Upload ảnh → trả về URL trỏ đến file đã lưu
router.post('/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'Không có file nào được upload' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ success: true, url });
});

router.get('/restaurant',          ctrl.getMyRestaurant);
router.put('/restaurant',          ctrl.updateMyRestaurant);
router.get('/products',            ctrl.getProducts);
router.post('/products',           ctrl.createProduct);
router.put('/products/:id',        ctrl.updateProduct);
router.delete('/products/:id',     ctrl.deleteProduct);
router.get('/orders',              ctrl.getOrders);
router.put('/orders/:id/status',   ctrl.updateOrderStatus);
router.get('/stats',               ctrl.getStats);

module.exports = router;
