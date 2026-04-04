const Product    = require('../models/Product');
const Restaurant = require('../models/Restaurant');
const Order      = require('../models/Order');

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
    const { name, address, description, openingHours, image } = req.body;
    const r = await Restaurant.findOneAndUpdate(
      { ownerId: req.user.id },
      { name, address, description, openingHours, image },
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

    res.json({ success: true, stats: { totalOrders, totalRevenue, pending, completed, cancelled, totalProducts, last7 } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
