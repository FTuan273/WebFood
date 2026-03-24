/**
 * @file user.model.js
 * @description Định nghĩa Schema và Model Mongoose cho bảng `User`.
 *
 * Các tính năng chính:
 *   - Lưu trữ thông tin cơ bản: Họ, Tên, Email, SĐT, Mật khẩu.
 *   - Hỗ trợ Phân quyền (Role): Customer | Merchant | Admin.
 *   - Tự động băm (hash) mật khẩu trước khi lưu bằng bcrypt.
 *   - Tích hợp cơ chế Quên Mật khẩu: tạo token tạm thời có hạn sử dụng 10 phút.
 *
 * @author WebFood Team
 * @version 2.0.0
 */

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const crypto   = require('crypto');

// ─── Định nghĩa Schema ───────────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    lastName: {
      type: String,
      required: [true, 'Vui lòng nhập Họ'],
      trim: true
    },
    firstName: {
      type: String,
      required: [true, 'Vui lòng nhập Tên'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Vui lòng nhập Email'],
      unique: true,
      lowercase: true,
      trim: true,
      // Regex kiểm tra định dạng email hợp lệ
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Vui lòng nhập email hợp lệ']
    },
    phoneNumber: {
      type: String,
      required: [true, 'Vui lòng nhập Số điện thoại'],
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Vui lòng nhập Mật khẩu'],
      minlength: 6,
      select: false // Mặc định KHÔNG trả về password khi query
    },
    role: {
      type: String,
      enum: ['Customer', 'Merchant', 'Admin'],
      default: 'Customer' // Mặc định là Khách hàng thông thường
    },
    profilePicture: {
      type: String,
      default: '' // URL ảnh đại diện, để trống nếu chưa thiết lập
    },
    address: {
      type: String,
      default: '' // Địa chỉ giao hàng mặc định của NTD
    },

    // ─── THÔNG TIN CỬA HÀNG (Dành cho Merchant) ──────────────────────────────
    storeName: {
      type: String,
      trim: true,
      default: ''
    },
    cuisineType: {
      type: String,
      trim: true,
      default: '' // VD: Cơm, Phở, Trà sữa
    },
    storeAddress: {
      type: String,
      trim: true,
      default: ''
    },
    storePhone: {
      type: String,
      trim: true,
      default: ''
    },
    openingTime: {
      type: String,
      default: '' // VD: 08:00
    },
    closingTime: {
      type: String,
      default: '' // VD: 22:00
    },
    bankAccount: {
      type: String,
      trim: true,
      default: ''
    },
    bankName: {
      type: String,
      trim: true,
      default: ''
    },

    // ─── Trường hỗ trợ tính năng Quên mật khẩu ──────────────────────────────
    // Token đã được băm (hash) bằng sha256, lưu để đối chiếu với token nhận từ URL
    resetPasswordToken: String,
    // Thời điểm hết hạn của token (tính theo milliseconds)
    resetPasswordExpire: Date
  },
  {
    // Tự động thêm 2 trường `createdAt` và `updatedAt`
    timestamps: true
  }
);

// ─── Hooks (Middleware) ───────────────────────────────────────────────────────

/**
 * Hook `pre('save')`: Tự động băm mật khẩu trước khi ghi vào MongoDB.
 *
 * Lưu ý quan trọng (Mongoose v9):
 *   - Phiên bản Mongoose v9 không hỗ trợ tham số `next()` trong `async` middleware.
 *   - Thay vì gọi `next()`, ta dùng `return` để thoát sớm khi điều kiện không thỏa.
 */
userSchema.pre('save', async function () {
  // Chỉ băm lại nếu trường `password` thực sự thay đổi (tránh băm trùng khi save profile)
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10); // Tạo "muối" bảo mật với 10 vòng
  this.password = await bcrypt.hash(this.password, salt);
});

// ─── Instance Methods ─────────────────────────────────────────────────────────

/**
 * So sánh mật khẩu người dùng nhập với mật khẩu đã băm trong DB.
 *
 * @param {string} enteredPassword - Mật khẩu dạng văn bản thuần (plaintext) từ form đăng nhập.
 * @returns {Promise<boolean>} `true` nếu khớp, `false` nếu sai.
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Tạo Token ngẫu nhiên cho tính năng Quên mật khẩu.
 *
 * Quy trình:
 *   1. Tạo chuỗi ngẫu nhiên 20 bytes (dạng hex) => đây là token được gửi qua Email/URL.
 *   2. Băm (hash) token bằng SHA-256, lưu phiên bản đã băm vào DB để đối chiếu về sau.
 *   3. Đặt thời hạn hết hạn là 10 phút kể từ thời điểm tạo.
 *
 * @returns {string} Token dạng văn bản thuần (chưa băm) để đính kèm vào URL reset.
 */
userSchema.methods.getResetPasswordToken = function () {
  // Bước 1: Tạo token ngẫu nhiên (dạng plaintext để gửi qua email)
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Bước 2: Băm token và lưu phiên bản đã băm vào database
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Bước 3: Token hết hạn sau 10 phút (10 * 60 giây * 1000 ms)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  // Trả về token gốc (chưa băm) để đính vào link gửi email
  return resetToken;
};

// ─── Export Model ─────────────────────────────────────────────────────────────
module.exports = mongoose.model('User', userSchema);
