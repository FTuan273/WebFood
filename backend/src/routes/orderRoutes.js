const express = require('express');
const router = express.Router();
const Order = require('../models/Order'); // Đảm bảo đường dẫn tới Model Order là chính xác
const { getOrders, getRevenueStats, updateOrderStatus } = require('../controllers/orderController');

// 1. Route lấy danh sách đơn hàng (Dùng cho chủ quán / khách hàng / admin)
router.get('/', getOrders);

// Route thống kê doanh thu (day-based) cho merchant
router.get('/revenue', getRevenueStats);

// 2. Route tạo đơn hàng mới (Dùng cho chức năng Đặt hàng)
router.post('/', async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    const savedOrder = await newOrder.save();

    // Hét lên cho chủ quán (nổ rầm rầm) theo room merchant
    if (req.io && savedOrder.restaurantId) {
      req.io.to(savedOrder.restaurantId).emit('new-order-received', {
        message: `🔔 Đơn mới từ ${savedOrder.customerName || 'khách hàng'} - ${savedOrder.totalPrice?.toLocaleString()}đ`,
        orderId: savedOrder._id,
        merchantId: savedOrder.restaurantId,
        totalAmount: savedOrder.totalPrice,
        customerName: savedOrder.customerName,
        timestamp: new Date()
      });
    }

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("Lỗi khi lưu đơn hàng:", error);
    if (error.name === 'ValidationError') {
      const errors = Object.keys(error.errors).reduce((acc, key) => {
        acc[key] = error.errors[key].message;
        return acc;
      }, {});
      return res.status(400).json({
        message: 'Dữ liệu đơn hàng không hợp lệ',
        details: errors
      });
    }
    res.status(400).json({ message: error.message || 'Lỗi khi lưu đơn.' });
  }
});

// 3. Route cập nhật trạng thái (Dùng cho chủ quán)
router.put('/:id/status', updateOrderStatus);

module.exports = router;