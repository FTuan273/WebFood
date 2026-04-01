const Order = require('../models/Order');

exports.getOrders = async (req, res) => {
  try {
    const { merchantId, customerId, status } = req.query;
    const query = {};

    if (merchantId) {
      query.restaurantId = merchantId;
    }
    if (customerId) {
      query.customerId = customerId;
    }
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    return res.status(200).json(orders);
  } catch (error) {
    console.error('Lỗi lấy đơn:', error);
    return res.status(500).json({ message: 'Lỗi lấy đơn hàng' });
  }
};

exports.getRevenueStats = async (req, res) => {
  try {
    const { merchantId, from, to } = req.query;
    if (!merchantId) {
      return res.status(400).json({ message: 'merchantId là bắt buộc' });
    }

    const match = {
      restaurantId: merchantId,
      status: 'completed'
    };

    if (from || to) {
      match.createdAt = {};
      if (from) match.createdAt.$gte = new Date(from);
      if (to) match.createdAt.$lte = new Date(to);
    }

    const revenueData = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt',
              timezone: 'Asia/Ho_Chi_Minh'
            }
          },
          totalRevenue: { $sum: '$totalPrice' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    return res.status(200).json(revenueData.map(item => ({
      date: item._id,
      totalRevenue: item.totalRevenue,
      orderCount: item.orderCount
    })));
  } catch (error) {
    console.error('Lỗi lấy thống kê doanh thu:', error);
    return res.status(500).json({ message: 'Lỗi lấy thống kê doanh thu' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatus = ['pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled'];
    if (!validStatus.includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    // Gửi tín hiệu Realtime cho khách hàng (room customer/user và order)
    if (req.io) {
      const payload = {
        orderId: updatedOrder._id,
        status: updatedOrder.status,
        message: `Đơn hàng của bạn hiện đang: ${status}`
      };

      if (updatedOrder.customerId) {
        req.io.to(`customer_${updatedOrder.customerId}`).emit('orderStatusUpdated', payload);
      }

      req.io.to(`order_${updatedOrder._id}`).emit('orderStatusUpdated', payload);
    }

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Lỗi update trạng thái:', error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};