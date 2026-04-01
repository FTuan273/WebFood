/**
 * @file index.js
 * @description Điểm khởi động chính của Backend Server tích hợp Socket.io Realtime.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http'); // Thêm module http
const { Server } = require('socket.io'); // Thêm Socket.io

// ─── Khởi tạo ứng dụng Express & HTTP Server ──────────────────────────────────
const app = express();
const server = http.createServer(app); // Bọc app vào http server
const PORT = parseInt(process.env.PORT || '5000', 10);

// ─── Cấu hình Socket.io ──────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Địa chỉ Frontend Vite của bạn
    methods: ["GET", "POST"]
  }
});

// ─── Logic Realtime (Luồng Đơn hàng) ─────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`⚡ Người dùng mới kết nối: ${socket.id}`);

  // 1. Chủ quán tham gia vào phòng riêng dựa trên merchantId
  socket.on('join-merchant-room', (merchantId) => {
    socket.join(merchantId);
    console.log(`🏠 Chủ quán ${merchantId} đã vào phòng nhận đơn.`);
  });

  // 1b. Khách hàng vào phòng theo customerId
  socket.on('join-customer-room', (customerId) => {
    socket.join(`customer_${customerId}`);
    console.log(`👤 Khách hàng ${customerId} đã vào phòng nhận cập nhật đơn.`);
  });

  // 1c. Khách hàng vào phòng theo orderId
  socket.on('join-order-room', (orderId) => {
    socket.join(`order_${orderId}`);
    console.log(`📦 Khách hàng/Tracking đã vào phòng order ${orderId}.`);
  });

  // 2. Lắng nghe sự kiện Merchant vào/ra phòng
  socket.on('leave-merchant-room', (merchantId) => {
    socket.leave(merchantId);
    console.log(`🏚️ Chủ quán ${merchantId} đã rời phòng nhận đơn.`);
  });

  // 3. Lắng nghe sự kiện khách đặt hàng thành công
  socket.on('place-order', (orderData) => {
    const { merchantId, customerName, totalAmount, orderId } = orderData;
    
    // 4. Gửi thông báo đến đúng chủ quán
    io.to(merchantId).emit('new-order-received', {
      message: `🔔 Có đơn hàng mới từ ${customerName || 'khách hàng'}: ${totalAmount?.toLocaleString()}đ`,
      customerName,
      orderId,
      amount: totalAmount,
      timestamp: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log('❌ Một người dùng đã ngắt kết nối');
  });
});

// ─── Middleware toàn cục ─────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Kết nối MongoDB ─────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/webappfood';

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('✅ Kết nối MongoDB thành công'))
  .catch((err) => console.error('❌ Kết nối MongoDB thất bại:', err.message));

// ─── Mount Routes ─────────────────────────────────────────────────────────────
// Phải đặt TRƯỚC khi mount các Route
app.use((req, res, next) => {
  req.io = io; 
  next();
});
app.use('/api/auth', require('./routes/auth.routes'));

const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'WebFood API đang hoạt động',
    db_status: mongoose.connection.readyState === 1 ? 'Đã kết nối' : 'Mất kết nối'
  });
});

const orderRoutes = require('./routes/orderRoutes'); 
app.use('/api/orders', orderRoutes);

// ─── Khởi động Server (Sử dụng server.listen thay vì app.listen) ──────────────
server.listen(PORT, () => {
  console.log(`🚀 Server Realtime đang chạy tại: http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Cổng ${PORT} đã được sử dụng. Hãy dừng tiến trình khác hoặc thay PORT trong .env.`);
    process.exit(1);
  } else {
    console.error('❌ Lỗi server:', err);
    process.exit(1);
  }
});

