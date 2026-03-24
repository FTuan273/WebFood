const User = require('../models/user.model');
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');

// 1. Thống kê tổng quan
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRestaurants = await Restaurant.countDocuments();
    const totalOrders = await Order.countDocuments();
    
    // Đếm Quán ăn theo trạng thái
    const pendingRestaurants = await Restaurant.countDocuments({ status: 'pending' });
    const approvedRestaurants = await Restaurant.countDocuments({ status: 'approved' });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalRestaurants: {
          total: totalRestaurants,
          pending: pendingRestaurants,
          approved: approvedRestaurants
        },
        totalOrders
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// 2. Quản lý User
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.status = user.status === 'active' ? 'locked' : 'active';
    await user.save();
    res.json({ success: true, message: `User status changed to ${user.status}`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// 3. Xét duyệt Quán ăn
exports.getPendingRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ status: 'pending' }).populate('ownerId', 'name email phone');
    res.json({ success: true, restaurants });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.updateRestaurantStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' || 'rejected' || 'locked'
    
    const validStatuses = ['approved', 'rejected', 'locked', 'pending'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const restaurant = await Restaurant.findByIdAndUpdate(id, { status }, { new: true });
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
    
    // Đồng bộ chức năng Role trên User
    const User = require('../models/user.model');
    if (status === 'approved') {
      await User.findByIdAndUpdate(restaurant.ownerId, { role: 'Merchant', isMerchantPending: false });
    } else if (status === 'rejected') {
      await User.findByIdAndUpdate(restaurant.ownerId, { isMerchantPending: false });
    }
    
    res.json({ success: true, message: `Restaurant ${status} successfully`, restaurant });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
