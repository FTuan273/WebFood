const User = require('../models/user.model');
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');
const CategoryFood = require('../models/CategoryFood');

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

// Lấy danh sách Quán ăn đang hoạt động (Hoặc bị khóa)
exports.getActiveRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ status: { $in: ['approved', 'locked'] } }).populate('ownerId', 'name email phone');
    
    // Đếm số đơn hàng và mock rating
    const expandedRestaurants = await Promise.all(restaurants.map(async (rest) => {
      const totalCompletedOrders = await Order.countDocuments({ restaurantId: rest._id, status: 'completed' });
      
      // Chỗ này giả lập rating ngẫu nhiên từ 4.0 -> 5.0 tạm thời, về sau có Review model sẽ tính thật.
      const mockRating = (Math.random() * (5.0 - 4.0) + 4.0).toFixed(1);
      
      return {
        ...rest._doc,
        totalCompletedOrders,
        averageRating: Number(mockRating)
      };
    }));

    res.json({ success: true, restaurants: expandedRestaurants });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.updateRestaurantStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectReason } = req.body; // 'approved' || 'rejected' || 'locked'
    
    const validStatuses = ['approved', 'rejected', 'locked', 'pending'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    if (status === 'rejected' && rejectReason) {
      console.log(`[Email Mock] Từ chối nhà hàng ${id}. Lý do: ${rejectReason}`);
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

// ─────────────────────────────────────────────────────────────────────────────
// 4. Quản lý Danh mục Chung (CategoryFood) - Chỉ dành cho Super Admin
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/admin/categories — Lấy tất cả danh mục
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await CategoryFood.find().sort({ createdAt: -1 });
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// POST /api/admin/categories — Tạo danh mục mới
exports.createCategory = async (req, res) => {
  try {
    const { name, icon, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Tên danh mục không được để trống' });
    }
    const existing = await CategoryFood.findOne({ name: name.trim() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Danh mục đã tồn tại' });
    }
    const category = await CategoryFood.create({ name: name.trim(), icon, description });
    res.status(201).json({ success: true, message: 'Tạo danh mục thành công', category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// PUT /api/admin/categories/:id — Cập nhật danh mục
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, description } = req.body;
    const category = await CategoryFood.findByIdAndUpdate(
      id,
      { name: name?.trim(), icon, description },
      { new: true, runValidators: true }
    );
    if (!category) return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    res.json({ success: true, message: 'Cập nhật thành công', category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// PUT /api/admin/categories/:id/toggle — Bật/Tắt trạng thái
exports.toggleCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await CategoryFood.findById(id);
    if (!category) return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    category.isActive = !category.isActive;
    await category.save();
    res.json({ success: true, message: `Danh mục đã ${category.isActive ? 'kích hoạt' : 'vô hiệu hóa'}`, category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// DELETE /api/admin/categories/:id — Xóa danh mục
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await CategoryFood.findByIdAndDelete(id);
    if (!category) return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    res.json({ success: true, message: 'Đã xóa danh mục' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
