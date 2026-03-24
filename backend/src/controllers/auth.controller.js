/**
 * @file auth.controller.js
 * @description Xử lý tất cả logic nghiệp vụ liên quan đến Xác thực và Hồ sơ người dùng.
 *
 * Bao gồm:
 *   - Đăng ký / Đăng nhập: Tạo JWT và trả về token.
 *   - Quên mật khẩu: Gửi email khôi phục (hỗ trợ chế độ Debug qua Terminal).
 *   - Đặt lại mật khẩu: Xác thực token và đổi mật khẩu mới.
 *   - Hồ sơ cá nhân: Đọc và cập nhật thông tin (Tên, SĐT, Địa chỉ, Avatar).
 *
 * @author WebFood Team
 * @version 2.0.0
 */

const User      = require('../models/user.model');
const jwt       = require('jsonwebtoken');
const crypto    = require('crypto');
const sendEmail = require('../utils/sendEmail');

// ─── Hàm tiện ích nội bộ ─────────────────────────────────────────────────────

/**
 * Tạo JWT và gửi phản hồi chuẩn về client.
 *
 * Payload JWT bao gồm: `id` (ObjectId) và `role` của user.
 * Thời hạn token được đọc từ biến môi trường `JWT_EXPIRE` (mặc định 30 ngày).
 *
 * @param {import('../models/user.model')} user       - Document User từ MongoDB.
 * @param {number}                         statusCode - HTTP status code (201 hoặc 200).
 * @param {import('express').Response}     res        - Response object của Express.
 */
const sendTokenResponse = (user, statusCode, res) => {
  // Ký token với payload chứa id và role
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'secretkey',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );

  // Trả về token và các thông tin công khai của user (không bao gồm password)
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id:             user._id,
      lastName:       user.lastName,
      firstName:      user.firstName,
      email:          user.email,
      role:           user.role,
      phoneNumber:    user.phoneNumber,
      address:        user.address,
      profilePicture: user.profilePicture,
      // Thông tin quán (Nếu có)
      storeName:    user.storeName,
      cuisineType:  user.cuisineType,
      storeAddress: user.storeAddress,
      storePhone:   user.storePhone,
      openingTime:  user.openingTime,
      closingTime:  user.closingTime,
      bankAccount:  user.bankAccount,
      bankName:     user.bankName,
      isMerchantPending: user.isMerchantPending
    }
  });
};

// ─── Controller: Đăng ký ─────────────────────────────────────────────────────

/**
 * @desc  Đăng ký tài khoản người dùng mới.
 * @route POST /api/auth/register
 * @access Public
 */
exports.register = async (req, res) => {
  try {
    const { 
      lastName, firstName, email, phoneNumber, password, role,
      storeName, cuisineType, storeAddress, storePhone, 
      openingTime, closingTime, bankAccount, bankName
    } = req.body;

    // Kiểm tra email đã tồn tại trong hệ thống chưa
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email này đã được sử dụng để đăng ký' });
    }

    // Tạo mới user trong DB
    const user = await User.create({
      lastName,
      firstName,
      email,
      phoneNumber,
      password,
      role: role || 'Customer',
      // Gán thông tin Merchant (nếu role là Merchant)
      storeName,
      cuisineType,
      storeAddress,
      storePhone,
      openingTime,
      closingTime,
      bankAccount,
      bankName
    });

    // Trả về token để user đăng nhập ngay sau khi đăng ký
    sendTokenResponse(user, 201, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Controller: Đăng nhập ───────────────────────────────────────────────────

/**
 * @desc  Đăng nhập bằng email và mật khẩu.
 * @route POST /api/auth/login
 * @access Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate đầu vào cơ bản
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập Email và Mật khẩu' });
    }

    // Tìm user và lấy kèm trường `password` (mặc định bị ẩn bởi `select: false`)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác' });
    }

    // So sánh mật khẩu nhập vào với mật khẩu đã băm trong DB
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Controller: Quên mật khẩu ───────────────────────────────────────────────

/**
 * @desc  Gửi email chứa link khôi phục mật khẩu (hợp lệ trong 10 phút).
 *        Nếu SMTP chưa cấu hình, link sẽ được in ra Terminal để phục vụ Debug.
 * @route POST /api/auth/forgot-password
 * @access Public
 */
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản với địa chỉ Email này' });
    }

    // Tạo token khôi phục và lưu phiên bản đã băm vào DB
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // URL mà người dùng sẽ nhấp vào trong email
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    const emailBody = `
Bạn nhận được email này vì bạn đã yêu cầu đặt lại mật khẩu cho tài khoản ShopeeGRAB.

Vui lòng nhấp vào đường dẫn bên dưới để đặt lại mật khẩu của bạn:
${resetUrl}

Lưu ý: Link này sẽ hết hạn sau 10 phút. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.
    `.trim();

    try {
      await sendEmail({
        email:   user.email,
        subject: 'Khôi phục mật khẩu - ShopeeGRAB',
        message: emailBody
      });

      res.status(200).json({ success: true, message: 'Link đặt lại mật khẩu đã được gửi đến Email của bạn' });
    } catch (emailErr) {
      // ── Chế độ Debug: Khi SMTP chưa cấu hình ───────────────────────────────
      // In link ra terminal để developer tự test mà không cần email thật.
      // Xóa block này trước khi deploy lên Production.
      console.warn('⚠️  [DEBUG MODE] Gửi email SMTP thất bại. Link reset mật khẩu:');
      console.warn(`    ${resetUrl}`);
      console.warn('    → Cấu hình SMTP_EMAIL, SMTP_PASSWORD trong .env để gửi email thật.');

      res.status(200).json({
        success: true,
        message: 'Hệ thống đang ở chế độ Debug. Vui lòng kiểm tra link reset trong Terminal của Backend.'
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Controller: Đặt lại mật khẩu ───────────────────────────────────────────

/**
 * @desc  Đặt lại mật khẩu mới bằng token nhận từ email.
 * @route PUT /api/auth/resetpassword/:resettoken
 * @access Public
 */
exports.resetPassword = async (req, res) => {
  try {
    // Bước 1: Băm token nhận từ URL params để so sánh với token đã lưu trong DB
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    // Bước 2: Tìm user có token khớp VÀ chưa hết hạn (resetPasswordExpire > thời điểm hiện tại)
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Link khôi phục không hợp lệ hoặc đã hết hạn (10 phút)' });
    }

    // Bước 3: Cập nhật mật khẩu mới và xóa token (password sẽ được băm bởi hook pre-save)
    user.password            = req.body.password;
    user.resetPasswordToken  = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Bước 4: Đăng nhập ngay với token mới sau khi đổi mật khẩu thành công
    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Controller: Hồ sơ cá nhân ───────────────────────────────────────────────

/**
 * @desc  Lấy thông tin người dùng đang đăng nhập (dựa trên JWT trong header).
 * @route GET /api/auth/me
 * @access Private (Yêu cầu đăng nhập)
 */
exports.getMe = async (req, res) => {
  try {
    // `req.user.id` được gắn bởi middleware `protect`
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc  Cập nhật thông tin cá nhân của người dùng (Họ, Tên, SĐT, Địa chỉ, Avatar).
 *        Lưu ý: Để đổi mật khẩu, dùng route `resetpassword` riêng (có xác thực token).
 * @route PUT /api/auth/updatedetails
 * @access Private (Yêu cầu đăng nhập)
 */
exports.updateDetails = async (req, res) => {
  try {
    // Chỉ cho phép cập nhật các trường được chỉ định (tránh ghi đè role/password)
    const fieldsToUpdate = {
      firstName:      req.body.firstName,
      lastName:       req.body.lastName,
      phoneNumber:    req.body.phoneNumber,
      address:        req.body.address,
      profilePicture: req.body.profilePicture,
      // Thông tin Merchant (Nếu có)
      storeName:    req.body.storeName,
      cuisineType:  req.body.cuisineType,
      storeAddress: req.body.storeAddress,
      storePhone:   req.body.storePhone,
      openingTime:  req.body.openingTime,
      closingTime:  req.body.closingTime,
      bankAccount:  req.body.bankAccount,
      bankName:     req.body.bankName
    };

    // Không cấp quyền Merchant lập tức. Chuyển sang chờ duyệt và đẩy 1 bản ghi vào Restaurant
    if (req.user.role === 'Customer' && req.body.role === 'Merchant') {
      fieldsToUpdate.isMerchantPending = true;
      
      const Restaurant = require('../models/Restaurant');
      const existingRestaurant = await Restaurant.findOne({ ownerId: req.user.id });
      if (!existingRestaurant) {
        await Restaurant.create({
          ownerId: req.user.id,
          name: req.body.storeName || 'Chưa đặt tên',
          address: req.body.storeAddress || 'Chưa cung cấp địa chỉ',
          openingHours: `${req.body.openingTime || '08:00'} - ${req.body.closingTime || '22:00'}`,
          status: 'pending'
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new:           true, // Trả về document đã cập nhật (không phải bản cũ)
        runValidators: true  // Chạy lại validators trong schema để đảm bảo dữ liệu hợp lệ
      }
    );

    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
