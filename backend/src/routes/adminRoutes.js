const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Middleware xác thực Auth (sẽ tích hợp file của nhánh tai-auth sau)
// Hiện tại chạy thẳng để test UI

// 1. Thống kê
router.get('/stats', adminController.getDashboardStats);

// 2. User management
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/status', adminController.toggleUserStatus);

// 3. Restaurant approval & management
router.get('/restaurants/pending', adminController.getPendingRestaurants);
router.get('/restaurants/active', adminController.getActiveRestaurants);
router.put('/restaurants/:id/status', adminController.updateRestaurantStatus);

module.exports = router;
