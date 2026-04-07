const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const { protect } = require('../middleware/auth.middleware');

// Public routes cho trang chủ và danh sách sản phẩm
router.get('/home', customerController.getHomeData);
router.get('/products', customerController.getProducts);
router.get('/products/:id', customerController.getProductDetail);
router.get('/restaurants/:id', customerController.getRestaurantDetail);
router.get('/locations', customerController.getLocations);

// Protected routes (đăng nhập mới được Review, Checkout, Lịch sử Order)
router.post('/products/:id/reviews', protect, customerController.addReview);
router.post('/orders', protect, customerController.createOrder);
router.get('/orders', protect, customerController.getMyOrders);

// Voucher: kiểm tra mã giảm giá
router.post('/vouchers/apply', protect, customerController.applyVoucher);

// Thông báo
router.get('/notifications', protect, customerController.getNotifications);
router.post('/notifications/read', protect, customerController.markNotificationsRead);

// Yêu thích
router.get('/favorites', protect, customerController.getFavorites);
router.post('/favorites', protect, customerController.addFavorite);
router.delete('/favorites/:targetId', protect, customerController.removeFavorite);

module.exports = router;
