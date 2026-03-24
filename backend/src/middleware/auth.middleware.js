/**
 * @file auth.middleware.js
 * @description Middleware xác thực và phân quyền người dùng dựa trên JWT.
 *
 * Cung cấp 2 middleware:
 *   - `protect`: Bảo vệ route, yêu cầu có JWT hợp lệ trong header.
 *   - `authorize`: Giới hạn truy cập theo Vai trò (Role-Based Access Control).
 *
 * Cách dùng trong Route:
 *   router.get('/admin-only', protect, authorize('Admin'), handler);
 *
 * @author WebFood Team
 * @version 2.0.0
 */

const jwt  = require('jsonwebtoken');
const User = require('../models/user.model');

// ─── Middleware 1: Xác thực JWT ───────────────────────────────────────────────

/**
 * Kiểm tra JWT và xác thực người dùng. Phải được gọi trước `authorize`.
 *
 * Luồng xử lý:
 *   1. Đọc token từ Header: `Authorization: Bearer <token>`
 *   2. Giải mã (verify) token bằng secret key.
 *   3. Tìm user trong DB theo `id` trong payload của token.
 *   4. Gắn user vào `req.user` để các middleware/controller tiếp theo sử dụng.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
exports.protect = async (req, res, next) => {
  let token;

  // Lấy token từ header Authorization (định dạng: "Bearer eyJhbGci...")
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Từ chối nếu không có token
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Vui lòng đăng nhập để truy cập nội dung này'
    });
  }

  try {
    // Giải mã token và lấy payload (id, role, iat, exp)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');

    // Tìm user trong DB để đảm bảo tài khoản vẫn tồn tại
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản không tồn tại. Vui lòng đăng nhập lại'
      });
    }

    next(); // Cho phép tiếp tục đến handler tiếp theo
  } catch (err) {
    // Xảy ra khi token sai định dạng hoặc đã hết hạn
    return res.status(401).json({
      success: false,
      message: 'Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại'
    });
  }
};

// ─── Middleware 2: Phân quyền theo Vai trò (RBAC) ────────────────────────────

/**
 * Kiểm tra vai trò người dùng có nằm trong danh sách được phép không.
 * Phải được sử dụng SAU middleware `protect`.
 *
 * @param {...string} roles - Danh sách role được phép (VD: 'Admin', 'Merchant').
 * @returns {import('express').RequestHandler} Middleware function.
 *
 * @example
 * // Chỉ Admin mới được vào route này
 * router.get('/admin-only', protect, authorize('Admin'), handler);
 *
 * // Cả Admin lẫn Merchant đều được
 * router.get('/manage', protect, authorize('Admin', 'Merchant'), handler);
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Kiểm tra vai trò của user trong req.user (được gắn bởi `protect`)
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Vai trò "${req.user.role}" không có quyền thực hiện hành động này. Yêu cầu: [${roles.join(', ')}]`
      });
    }
    next();
  };
};
