/**
 * @file index.js
 * @description Điểm khởi động chính của Backend Server.
 *   - Kết nối cơ sở dữ liệu MongoDB qua Mongoose.
 *   - Đăng ký các Middleware toàn cục (CORS, JSON Parser).
 *   - Mount tất cả các Route API.
 *
 * @author WebFood Team
 * @version 2.0.0
 */

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const mongoose = require('mongoose');

// ─── Khởi tạo ứng dụng Express ───────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware toàn cục ─────────────────────────────────────────────────────
// Cho phép tất cả các Origin gọi API (trong môi trường Dev)
app.use(cors());

// Tự động parse body JSON và URL-encoded từ request
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Kết nối MongoDB ─────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/webappfood';

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('✅ Kết nối MongoDB thành công'))
  .catch((err) => console.error('❌ Kết nối MongoDB thất bại:', err.message));

// ─── Mount Routes ─────────────────────────────────────────────────────────────
// Tất cả các route liên quan đến xác thực người dùng
app.use('/api/auth', require('./routes/auth.routes'));

// ─── Route kiểm tra sức khỏe Server (Health Check) ──────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: 'WebFood API đang hoạt động',
    db_status: mongoose.connection.readyState === 1 ? 'Đã kết nối' : 'Mất kết nối'
  });
});

// ─── Khởi động Server ────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
});
