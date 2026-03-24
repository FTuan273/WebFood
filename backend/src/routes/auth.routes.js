/**
 * @file auth.routes.js
 * @description Định nghĩa tất cả các Route liên quan đến Xác thực người dùng.
 *
 * Danh sách Route:
 *   POST   /api/auth/register          - Đăng ký tài khoản mới
 *   POST   /api/auth/login             - Đăng nhập
 *   POST   /api/auth/forgot-password   - Gửi Email quên mật khẩu
 *   PUT    /api/auth/resetpassword/:token - Đặt lại mật khẩu bằng Token
 *   GET    /api/auth/me                - Lấy thông tin cá nhân (Yêu cầu đăng nhập)
 *   PUT    /api/auth/updatedetails     - Cập nhật thông tin cá nhân (Yêu cầu đăng nhập)
 *   GET    /api/auth/admin-only        - Test endpoint chỉ dành cho Admin
 *   GET    /api/auth/merchant-only     - Test endpoint chỉ dành cho Merchant
 *   GET    /api/auth/customer-only     - Test endpoint chỉ dành cho Customer
 *
 * @author WebFood Team
 * @version 2.0.0
 */

const express = require('express');
const router  = express.Router();

// Controller xử lý logic nghiệp vụ xác thực
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  updateDetails
} = require('../controllers/auth.controller');

// Middleware bảo vệ và phân quyền
const { protect, authorize } = require('../middleware/auth.middleware');

// ─── Route Công khai (Không cần đăng nhập) ───────────────────────────────────
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// ─── Route Riêng tư (Yêu cầu đăng nhập - JWT hợp lệ) ───────────────────────
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);

// ─── Route Kiểm tra Phân quyền (RBAC Test Endpoints) ────────────────────────
// Dùng để kiểm tra hệ thống phân quyền trong quá trình phát triển
router.get('/admin-only',    protect, authorize('Admin'),    (req, res) => {
  res.status(200).json({ success: true, message: `Xác nhận quyền Admin cho [${req.user.email}]` });
});

router.get('/merchant-only', protect, authorize('Merchant'), (req, res) => {
  res.status(200).json({ success: true, message: `Xác nhận quyền Merchant cho [${req.user.email}]` });
});

router.get('/customer-only', protect, authorize('Customer'), (req, res) => {
  res.status(200).json({ success: true, message: `Xác nhận quyền Customer cho [${req.user.email}]` });
});

module.exports = router;
