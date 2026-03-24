/**
 * @file sendEmail.js
 * @description Tiện ích gửi email qua giao thức SMTP sử dụng thư viện Nodemailer.
 *
 * Cấu hình SMTP trong file `.env`:
 *   SMTP_EMAIL    = địa_chỉ_gmail_của_bạn@gmail.com
 *   SMTP_PASSWORD = mật_khẩu_ứng_dụng_16_ký_tự (App Password từ Google Account)
 *   FROM_NAME     = Tên người gửi hiển thị (VD: WebFood Support)
 *   FROM_EMAIL    = địa_chỉ_gmail_của_bạn@gmail.com
 *
 * Lưu ý bảo mật:
 *   - KHÔNG dùng mật khẩu Gmail thông thường, phải tạo "App Password" tại:
 *     https://myaccount.google.com/apppasswords
 *   - KHÔNG commit file `.env` lên Git repository.
 *
 * @author WebFood Team
 * @version 2.0.0
 */

const nodemailer = require('nodemailer');

/**
 * Gửi email thông qua SMTP Gmail.
 *
 * @param {object} options          - Tùy chọn email.
 * @param {string} options.email    - Địa chỉ email người nhận.
 * @param {string} options.subject  - Tiêu đề email.
 * @param {string} options.message  - Nội dung email dạng văn bản thuần (plaintext).
 * @param {string} [options.html]   - (Tuỳ chọn) Nội dung email dạng HTML.
 * @returns {Promise<void>}
 * @throws {Error} Ném lỗi nếu SMTP xác thực thất bại hoặc mất kết nối.
 */
const sendEmail = async (options) => {
  // Bước 1: Tạo transporter kết nối đến máy chủ SMTP của Gmail
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_EMAIL,    // Gmail của hệ thống
      pass: process.env.SMTP_PASSWORD  // App Password từ Google Account
    }
  });

  // Bước 2: Soạn nội dung email
  const mailOptions = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`, // "WebFood <email@gmail.com>"
    to:      options.email,
    subject: options.subject,
    text:    options.message, // Phiên bản văn bản thuần (fallback cho email client cũ)
    html:    options.html     // Phiên bản HTML (nếu có, sẽ ưu tiên hiển thị)
  };

  // Bước 3: Gửi email và ghi log kết quả
  const info = await transporter.sendMail(mailOptions);
  console.log(`📧 Email đã gửi thành công. Message ID: ${info.messageId}`);
};

module.exports = sendEmail;
