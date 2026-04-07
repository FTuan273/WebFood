const User = require('../models/user.model');
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const CategoryFood = require('../models/CategoryFood');
const SystemConfig = require('../models/SystemConfig');
const Voucher = require('../models/Voucher');
const socketIO = require('../utils/socket');

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

    user.status = user.status === 'locked' ? 'active' : 'locked';
    await user.save();
    res.json({ success: true, message: `User status changed to ${user.status}`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const validRoles = ['Customer', 'Merchant', 'Admin'];
    if (!validRoles.includes(role)) return res.status(400).json({ success: false });
    
    await User.findByIdAndUpdate(id, { role });
    res.json({ success: true, message: 'Role updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// 3. Xét duyệt Quán ăn
exports.getPendingRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ status: 'pending' }).populate('ownerId', 'firstName lastName email phoneNumber');
    res.json({ success: true, restaurants });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Lấy danh sách Quán ăn đang hoạt động (Hoặc bị khóa)
exports.getActiveRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ status: { $in: ['approved', 'locked'] } }).populate('ownerId', 'firstName lastName email phoneNumber');
    
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

exports.getRestaurantRevenue = async (req, res) => {
  try {
    const { id } = req.params;
    
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) return res.status(404).json({ success: false, message: 'Không tìm thấy nhà hàng' });

    const orders = await Order.find({ restaurantId: id, status: 'completed' })
      .sort({ createdAt: -1 })
      .populate('customerId', 'firstName lastName phoneNumber')
      .lean();

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const recentOrders = orders.slice(0, 5);

    res.json({ 
      success: true, 
      data: { 
        restaurantName: restaurant.name,
        totalOrders, 
        totalRevenue, 
        recentOrders 
      } 
    });
  } catch (error) {
    console.error('Revenue Error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi tính doanh thu' });
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

// ─────────────────────────────────────────────────────────────────────────────
// 5. Quản lý Địa điểm (Location)
// ─────────────────────────────────────────────────────────────────────────────
const Location = require('../models/Location');

exports.getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find().sort({ createdAt: -1 }).lean();
    
    // Đếm số lượng nhà hàng ở mỗi địa điểm
    const expandedLocations = await Promise.all(locations.map(async (loc) => {
      const restaurantCount = await Restaurant.countDocuments({ locationId: loc._id });
      return { ...loc, restaurantCount };
    }));
    
    res.json({ success: true, locations: expandedLocations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

exports.createLocation = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'Tên địa điểm không được để trống' });
    const existing = await Location.findOne({ name: name.trim() });
    if (existing) return res.status(409).json({ success: false, message: 'Địa điểm đã tồn tại' });
    
    const location = await Location.create({ name: name.trim(), description });
    res.status(201).json({ success: true, message: 'Thêm địa điểm thành công', location });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const location = await Location.findByIdAndUpdate(
      id,
      { name: name?.trim(), description },
      { new: true, runValidators: true }
    );
    if (!location) return res.status(404).json({ success: false, message: 'Không tìm thấy địa điểm' });
    res.json({ success: true, message: 'Cập nhật thành công', location });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

exports.toggleLocationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const location = await Location.findById(id);
    if (!location) return res.status(404).json({ success: false, message: 'Không tìm thấy địa điểm' });
    location.isActive = !location.isActive;
    await location.save();
    res.json({ success: true, message: `Địa điểm đã ${location.isActive ? 'kích hoạt' : 'vô hiệu hóa'}`, location });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

exports.deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;
    // Kiểm tra xem có quán nào dùng địa điểm này hay không
    const count = await Restaurant.countDocuments({ locationId: id });
    if (count > 0) return res.status(400).json({ success: false, message: 'Không thể xóa vì đang có quán ăn thuộc địa điểm này' });
    
    const location = await Location.findByIdAndDelete(id);
    if (!location) return res.status(404).json({ success: false, message: 'Không tìm thấy địa điểm' });
    res.json({ success: true, message: 'Đã xóa địa điểm' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. Quản lý Banners
// ─────────────────────────────────────────────────────────────────────────────
const Banner = require('../models/Banner');

exports.getBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.json({ success: true, banners });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.createBanner = async (req, res) => {
  try {
    const { title, link } = req.body;
    let imageUrl = req.body.imageUrl;

    if (req.file) {
      imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    if (!title || !imageUrl) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tên và URL ảnh tải lên' });
    }

    const banner = await Banner.create({ title, imageUrl, link });
    res.status(201).json({ success: true, banner });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.toggleBannerStatus = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ success: false, message: 'Không tìm thấy banner' });

    banner.isActive = !banner.isActive;
    await banner.save();
    res.json({ success: true, banner });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xóa banner' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. Tài chính & Hoa hồng (Platform Analytics)
// ─────────────────────────────────────────────────────────────────────────────
exports.getSystemConfig = async (req, res) => {
  try {
    let config = await SystemConfig.findOne({ key: 'global_config' });
    if (!config) {
      config = await SystemConfig.create({ key: 'global_config', commissionRate: 15 });
    }
    res.json({ success: true, config });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.updateSystemConfig = async (req, res) => {
  try {
    const { commissionRate } = req.body;
    let config = await SystemConfig.findOne({ key: 'global_config' });
    if (!config) {
      config = await SystemConfig.create({ key: 'global_config', commissionRate });
    } else {
      config.commissionRate = commissionRate;
      await config.save();
    }
    res.json({ success: true, message: 'Cập nhật cấu hình thành công', config });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.getPlatformFinances = async (req, res) => {
  try {
    let config = await SystemConfig.findOne({ key: 'global_config' });
    const commissionRate = config ? config.commissionRate : 15;

    const completedOrders = await Order.find({ status: 'completed' }).populate('restaurantId');

    let totalGrossRevenue = 0;
    const restaurantStats = {};

    completedOrders.forEach(order => {
      const amount = order.totalPrice;
      totalGrossRevenue += amount;

      if (!order.restaurantId) return; // Bỏ qua nếu dữ liệu lỗi
      const restId = order.restaurantId._id.toString();
      
      if (!restaurantStats[restId]) {
        restaurantStats[restId] = {
          restaurant: order.restaurantId,
          totalRevenue: 0,
          totalOrders: 0
        };
      }
      restaurantStats[restId].totalRevenue += amount;
      restaurantStats[restId].totalOrders += 1;
    });

    const totalNetProfit = (totalGrossRevenue * commissionRate) / 100;
    const totalVendorPayout = totalGrossRevenue - totalNetProfit;

    const debts = Object.values(restaurantStats).map(stat => {
      const platformFee = (stat.totalRevenue * commissionRate) / 100;
      const vendorPayout = stat.totalRevenue - platformFee;
      return {
        restaurantId: stat.restaurant._id,
        restaurantName: stat.restaurant.name,
        totalOrders: stat.totalOrders,
        grossRevenue: stat.totalRevenue,
        platformFee,
        netPayout: vendorPayout
      };
    });

    debts.sort((a, b) => b.grossRevenue - a.grossRevenue);

    res.json({
      success: true,
      commissionRate,
      overview: {
        totalGrossRevenue,
        totalNetProfit,
        totalVendorPayout
      },
      debts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi khi thống kê nền tảng' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 8. Quản Lý Đơn Hàng Tổng (Master Orders Control)
// ─────────────────────────────────────────────────────────────────────────────
exports.getAllSystemOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customerId', 'firstName lastName phone email')
      .populate('restaurantId', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách đơn hàng' });
  }
};

exports.forceCancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancelReason } = req.body;
    const order = await Order.findById(id).populate('restaurantId', 'name');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    if (order.status === 'completed' || order.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Chỉ có thể hủy đơn hàng đang chạy' });
    }

    // 1. Cập nhật trạng thái
    order.status = 'cancelled';
    await order.save();

    // 2. Gửi thông báo tạ lỗi cho User
    const restaurantName = order.restaurantId ? order.restaurantId.name : 'Quán ăn';
    const reasonText = cancelReason ? ` Nguyên nhân Hủy: "${cancelReason}".` : '';
    
    await Notification.create({
      userId: order.customerId,
      title: 'Đơn hàng bị Hệ thống Hủy',
      message: `Quản trị viên hệ thống đã hủy đơn hàng mã #${order._id.toString().slice(-8)} tại ${restaurantName} để bảo vệ hệ thống / hoàn tiền (nếu có).${reasonText} Xin lỗi vì sự bất tiện này!`,
      type: 'order_status',
      link: '/orders'
    });

    // Phát sóng sự kiện WebSocket cho toàn mạng lưới tải lại danh sách đơn hàng
    try {
      socketIO.getIO().emit('system_orders_changed');
    } catch (err) { console.error("Socket error on forceCancel:", err); }

    res.json({ success: true, message: 'Hủy ép buộc thành công. Khách hàng đã được báo.', order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server khi hủy đơn' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 9. Quản Lý Voucher (Platform Vouchers)
// ─────────────────────────────────────────────────────────────────────────────
exports.getAllVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find().sort({ createdAt: -1 });
    res.json({ success: true, vouchers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.createVoucher = async (req, res) => {
  try {
    const data = req.body;
    // Check missing fields
    if (!data.code || !data.discountValue || !data.expiresAt) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ các trường bắt buộc' });
    }

    const existingId = await Voucher.findOne({ code: data.code.toUpperCase() });
    if (existingId) {
      return res.status(400).json({ success: false, message: 'Mã Voucher đã tồn tại' });
    }

    const newVoucher = await Voucher.create(data);
    res.status(201).json({ success: true, message: 'Tạo Voucher thành công', voucher: newVoucher });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

exports.updateVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    if (data.code) data.code = data.code.toUpperCase();

    const voucher = await Voucher.findByIdAndUpdate(id, data, { new: true });
    if (!voucher) return res.status(404).json({ success: false, message: 'Voucher không tồn tại' });

    res.json({ success: true, message: 'Cập nhật Voucher thành công', voucher });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.deleteVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    await Voucher.findByIdAndDelete(id);
    res.json({ success: true, message: 'Xoá Voucher thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.publishVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const voucher = await Voucher.findById(id);

    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher không tồn tại' });
    }

    if (!voucher.isActive || new Date(voucher.expiresAt) < new Date()) {
      return res.status(400).json({ success: false, message: 'Voucher không khả dụng hoặc đã hết hạn' });
    }

    // Gửi sự kiện Socket.IO tới toàn bộ user (thông báo Pop-up)
    try {
      socketIO.getIO().emit('new_voucher', {
        id: voucher._id,
        code: voucher.code,
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
        description: voucher.description,
        timestamp: new Date()
      });
    } catch (err) {
      console.error("Socket error on publish voucher:", err);
    }

    res.json({ success: true, message: 'Đã phát hành Voucher và thông báo tới toàn bộ người dùng đang online!', voucher });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server khi phát hành voucher' });
  }
};
