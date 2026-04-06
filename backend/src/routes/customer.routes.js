const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const { protect } = require('../middleware/auth.middleware');

// Public routes cho trang chủ và danh sách sản phẩm
router.get('/home', customerController.getHomeData);
router.get('/products', customerController.getProducts);
router.get('/products/:id', customerController.getProductDetail);

// Protected routes (đăng nhập mới được Review)
router.post('/products/:id/reviews', protect, customerController.addReview);

module.exports = router;
