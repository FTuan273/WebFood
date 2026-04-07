const Product    = require('../models/Product');
const Restaurant = require('../models/Restaurant');
const Order      = require('../models/Order');
const Notification = require('../models/Notification');
const SystemConfig = require('../models/SystemConfig');

// Helper: lấy quán của merchant hiện tại
const getRestaurant = (userId) => Restaurant.findOne({ ownerId: userId });

// ── Thông tin quán ──────────────────────────────────────────────────────────
exports.getMyRestaurant = async (req, res) => {
  try {
    const r = await getRestaurant(req.user.id);
    if (!r) return res.status(404).json({ success: false, message: 'Bạn chưa có quán' });
    res.json({ success: true, restaurant: r });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateMyRestaurant = async (req, res) => {
  try {
    const { name, address, locationId, description, openingHours, image } = req.body;
    const r = await Restaurant.findOneAndUpdate(
      { ownerId: req.user.id },
      { name, address, locationId, description, openingHours, image },
      { new: true, runValidators: true }
    );
    if (!r) return res.status(404).json({ success: false, message: 'Không tìm thấy quán' });
    res.json({ success: true, restaurant: r });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── Thực đơn ────────────────────────────────────────────────────────────────
exports.getProducts = async (req, res) => {
  try {
    const r = await getRestaurant(req.user.id);
    if (!r) return res.status(404).json({ success: false, message: 'Bạn chưa có quán' });
    const products = await Product.find({ restaurantId: r._id });
    res.json({ success: true, products });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createProduct = async (req, res) => {
  try {
    const r = await getRestaurant(req.user.id);
    if (!r) return res.status(404).json({ success: false, message: 'Bạn chưa có quán' });
    const product = await Product.create({ ...req.body, restaurantId: r._id });
    res.status(201).json({ success: true, product });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateProduct = async (req, res) => {
  try {
    const r = await getRestaurant(req.user.id);
    if (!r) return res.status(404).json({ success: false, message: 'Bạn chưa có quán' });
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, restaurantId: r._id },
      req.body, { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy món ăn' });
    res.json({ success: true, product });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.deleteProduct = async (req, res) => {
  try {
    const r = await getRestaurant(req.user.id);
    if (!r) return res.status(404).json({ success: false, message: 'Bạn chưa có quán' });
    const product = await Product.findOneAndDelete({ _id: req.params.id, restaurantId: r._id });
    if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy món ăn' });
    res.json({ success: true, message: 'Đã xoá món ăn' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── Đơn hàng ────────────────────────────────────────────────────────────────
exports.getOrders = async (req, res) => {
  try {
    const r = await getRestaurant(req.user.id);
    if (!r) return res.status(404).json({ success: false, message: 'Bạn chưa có quán' });
    const orders = await Order.find({ restaurantId: r._id })
      .populate('customerId', 'firstName lastName phoneNumber')
      .populate('items.productId', 'name price')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const r = await getRestaurant(req.user.id);
    if (!r) return res.status(404).json({ success: false, message: 'Bạn chưa có quán' });
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, restaurantId: r._id },
      { status: req.body.status },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });

    // Tạo thông báo cho khách hàng
    let message = '';
    let title = 'Cập nhật đơn hàng';
    switch (req.body.status) {
      case 'confirmed': message = `Đơn hàng #${order._id.toString().slice(-8)} tại ${r.name} đã được xác nhận.`; break;
      case 'preparing': message = `Quán ${r.name} đang chuẩn bị đơn hàng #${order._id.toString().slice(-8)} của bạn.`; break;
      case 'delivering': message = `Đơn hàng #${order._id.toString().slice(-8)} đang được giao tới bạn!`; break;
      case 'completed': message = `Đơn hàng #${order._id.toString().slice(-8)} đã hoàn thành. Chúc bạn ngon miệng!`; break;
      case 'cancelled': message = `Rất tiếc, đơn hàng #${order._id.toString().slice(-8)} tại ${r.name} đã bị hủy.`; break;
      default: message = `Đơn hàng #${order._id.toString().slice(-8)} có trạng thái mới.`;
    }

    if (req.body.status !== 'pending') {
      await Notification.create({
        userId: order.customerId,
        title,
        message,
        type: 'order_status',
        link: '/orders'
      });
    }

    // Phát sóng Socket báo Merchant cập nhật thành công (Admin, Khách cũng sẽ nhận)
    try {
      require('../utils/socket').getIO().emit('system_orders_changed');
    } catch(err) { console.error("Socket err on updateOrderStatus:", err); }

    res.json({ success: true, order });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── Thống kê ────────────────────────────────────────────────────────────────
exports.getStats = async (req, res) => {
  try {
    const r = await getRestaurant(req.user.id);
    if (!r) return res.status(404).json({ success: false, message: 'Bạn chưa có quán' });

    const orders = await Order.find({ restaurantId: r._id });

    const totalOrders   = orders.length;
    const totalRevenue  = orders.filter(o => o.status === 'completed').reduce((s, o) => s + o.totalPrice, 0);
    const pending       = orders.filter(o => o.status === 'pending').length;
    const completed     = orders.filter(o => o.status === 'completed').length;
    const cancelled     = orders.filter(o => o.status === 'cancelled').length;
    const totalProducts = await Product.countDocuments({ restaurantId: r._id });

    // Doanh thu 7 ngày gần nhất
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0,0,0,0);
      const next = new Date(d); next.setDate(next.getDate() + 1);
      const dayOrders = orders.filter(o => o.status === 'completed' && o.createdAt >= d && o.createdAt < next);
      last7.push({
        date: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        revenue: dayOrders.reduce((s, o) => s + o.totalPrice, 0),
        orders: dayOrders.length
      });
    }

    // Tính toán phí thực lãnh sau chiết khấu
    const config = await SystemConfig.findOne({ key: 'global_config' });
    const commissionRate = config ? config.commissionRate : 15;
    const netRevenue = totalRevenue - (totalRevenue * commissionRate / 100);

    res.json({ success: true, stats: { totalOrders, totalRevenue, netRevenue, commissionRate, pending, completed, cancelled, totalProducts, last7 } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── Quản lý đánh giá ──────────────────────────────────────────────────────────
const Review = require('../models/Review');

exports.getReviews = async (req, res) => {
  try {
    const r = await getRestaurant(req.user.id);
    if (!r) return res.status(404).json({ success: false, message: 'Bạn chưa có quán' });

    // Lấy tất cả sản phẩm của quán
    const products = await Product.find({ restaurantId: r._id }, '_id name image').lean();
    const productIds = products.map(p => p._id);

    // Lấy toàn bộ reviews kèm thông tin user và sản phẩm
    const reviews = await Review.find({ product: { $in: productIds } })
      .populate('user', 'name avatar')
      .populate('product', 'name image')
      .sort({ createdAt: -1 })
      .lean();

    // Tính rating trung bình tổng quán
    const avgRating = reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    // Thống kê phân bố sao (1 đến 5)
    const starDistribution = [1, 2, 3, 4, 5].map(star => ({
      star,
      count: reviews.filter(r => r.rating === star).length
    }));

    // Rating trung bình theo từng món
    const productStats = products.map(p => {
      const pReviews = reviews.filter(r => r.product?._id?.toString() === p._id.toString());
      const avg = pReviews.length > 0
        ? (pReviews.reduce((s, r) => s + r.rating, 0) / pReviews.length).toFixed(1)
        : null;
      return { ...p, reviewCount: pReviews.length, avgRating: avg };
    }).filter(p => p.reviewCount > 0);

    res.json({
      success: true,
      avgRating,
      totalReviews: reviews.length,
      starDistribution,
      productStats,
      reviews
    });
  } catch (err) {
    console.error('Get Reviews Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

