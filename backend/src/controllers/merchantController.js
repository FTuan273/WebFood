const Restaurant = require('../models/Restaurant');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');

// Lấy ID cửa hàng từ header (Mock Auth)
const getMerchantId = async (req) => {
  let id = req.headers['x-merchant-id'];
  if (!id) {
    const defaultRes = await Restaurant.findOne();
    if (defaultRes) id = defaultRes._id;
  }
  return id;
};

// --- QUẢN LÝ CỬA HÀNG ---
exports.getStoreInfo = async (req, res) => {
  try {
    const store = await Restaurant.findById(await getMerchantId(req));
    res.json(store);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateStoreInfo = async (req, res) => {
  try {
    const store = await Restaurant.findByIdAndUpdate(await getMerchantId(req), req.body, { new: true });
    res.json(store);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// --- QUẢN LÝ MENU (THỰC ĐƠN) ---
exports.getMenu = async (req, res) => {
  try {
    const restaurantId = await getMerchantId(req);
    const categories = await Category.find({ restaurantId });
    const products = await Product.find({ restaurantId }).populate('categoryId');
    res.json({ categories, products });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.addCategory = async (req, res) => {
  try {
    const category = await Category.create({ ...req.body, restaurantId: await getMerchantId(req) });
    res.status(201).json(category);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.addProduct = async (req, res) => {
  try {
    const data = { ...req.body, restaurantId: await getMerchantId(req) };
    if (req.file) data.image = `http://localhost:5000/uploads/${req.file.filename}`;
    const product = await Product.create(data);
    res.status(201).json(product);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateProduct = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.image = `http://localhost:5000/uploads/${req.file.filename}`;
    const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json(product);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// --- QUẢN LÝ ĐƠN HÀNG ---
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ restaurantId: await getMerchantId(req) }).sort('-createdAt');
    res.json(orders);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(order);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// --- THỐNG KÊ ---
exports.getDashboard = async (req, res) => {
  try {
    const restaurantId = await getMerchantId(req);
    const orders = await Order.find({ restaurantId });
    const revenue = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.totalPrice, 0);
    const totalOrders = orders.length;
    res.json({ revenue, totalOrders, orders });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
