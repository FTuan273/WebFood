const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const upload = require('../utils/upload');

// Middleware xác thực Auth (sẽ tích hợp file của nhánh tai-auth sau)
// Hiện tại chạy thẳng để test UI

// 1. Thống kê
router.get('/stats', adminController.getDashboardStats);

// 2. User management
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/status', adminController.toggleUserStatus);
router.delete('/users/:id', adminController.deleteUser);
router.put('/users/:id/role', adminController.updateUserRole);

// 3. Restaurant approval & management
router.get('/restaurants/pending', adminController.getPendingRestaurants);
router.get('/restaurants/active', adminController.getActiveRestaurants);
router.get('/restaurants/:id/revenue', adminController.getRestaurantRevenue);
router.put('/restaurants/:id/status', adminController.updateRestaurantStatus);

// 4. Quản lý Danh mục Chung (CategoryFood)
router.get('/categories', adminController.getAllCategories);
router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.put('/categories/:id/toggle', adminController.toggleCategoryStatus);
router.delete('/categories/:id', adminController.deleteCategory);

// 5. Quản lý Địa Điểm (Location)
router.get('/locations', adminController.getAllLocations);
router.post('/locations', adminController.createLocation);
router.put('/locations/:id', adminController.updateLocation);
router.put('/locations/:id/toggle', adminController.toggleLocationStatus);
router.delete('/locations/:id', adminController.deleteLocation);

// 6. Quản lý Banner
router.get('/banners', adminController.getBanners);
router.post('/banners', upload.single('image'), adminController.createBanner);
router.put('/banners/:id/toggle', adminController.toggleBannerStatus);
router.delete('/banners/:id', adminController.deleteBanner);

// 7. Thống kê & Tài chính nền tảng
router.get('/config', adminController.getSystemConfig);
router.put('/config', adminController.updateSystemConfig);
router.get('/finances', adminController.getPlatformFinances);

// 8. Quản lí đơn hàng (Master Control)
router.get('/orders', adminController.getAllSystemOrders);
router.put('/orders/:id/force-cancel', adminController.forceCancelOrder);

// 9. Quản lý Vouchers (Platform Vouchers)
router.get('/vouchers', adminController.getAllVouchers);
router.post('/vouchers', adminController.createVoucher);
router.put('/vouchers/:id', adminController.updateVoucher);
router.delete('/vouchers/:id', adminController.deleteVoucher);
router.post('/vouchers/:id/publish', adminController.publishVoucher);

module.exports = router;
