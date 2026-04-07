const Product = require('../models/Product');
const Restaurant = require('../models/Restaurant');
const CategoryFood = require('../models/CategoryFood');
const Category = require('../models/Category');
const Review = require('../models/Review');
const Favorite = require('../models/Favorite');
const Voucher = require('../models/Voucher');

exports.getHomeData = async (req, res) => {
  try {
    const categories = await CategoryFood.find({ isActive: true }).lean() || [];
    const filter = { status: 'approved' };
    if (req.query.locationId) filter.locationId = req.query.locationId;

    const featuredRestaurants = await Restaurant.find(filter).limit(8).lean();

    const expandedRestaurants = await Promise.all(featuredRestaurants.map(async (rest) => {
      const products = await Product.find({ restaurantId: rest._id }, '_id');
      const productIds = products.map(p => p._id);
      const reviews = await Review.find({ product: { $in: productIds } }, 'rating');
      let averageRating = 0;
      if (reviews.length > 0) {
        const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
        averageRating = (sum / reviews.length).toFixed(1);
      }
      return { ...rest, averageRating: averageRating > 0 ? averageRating : 'N/A', totalReviews: reviews.length };
    }));

    const Banner = require('../models/Banner');
    const banners = await Banner.find({ isActive: true }).sort('-createdAt').lean();

    res.json({ success: true, categories, banners, featuredRestaurants: expandedRestaurants });
  } catch (error) {
    console.error('Home Data Error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi tải dữ liệu trang chủ' });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const { search, categoryId, minPrice, maxPrice, sort, locationId } = req.query;
    let filter = {};
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (categoryId) filter.categoryId = categoryId;
    if (locationId) {
      const restIds = await Restaurant.find({ locationId, status: 'approved' }).distinct('_id');
      filter.restaurantId = { $in: restIds };
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    let sortObj = {};
    if (sort === 'price-asc') sortObj.price = 1;
    else if (sort === 'price-desc') sortObj.price = -1;
    else if (sort === 'name-asc') sortObj.name = 1;
    else if (sort === 'name-desc') sortObj.name = -1;
    else sortObj.createdAt = -1;

    let productsQuery = Product.find(filter).populate({ path: 'restaurantId', select: 'name address locationId', populate: { path: 'locationId', select: 'name' } });
    if (sortObj) productsQuery = productsQuery.sort(sortObj);
    const products = await productsQuery.lean();

    res.json({ success: true, count: products.length, products });
  } catch (error) {
    console.error('Get Products Error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi tải danh sách sản phẩm' });
  }
};

exports.getProductDetail = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('restaurantId', 'name address phone').lean();
    if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });

    const reviews = await Review.find({ product: req.params.id }).populate('user', 'name').sort({ createdAt: -1 }).lean();
    let avgRating = 0;
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
      avgRating = (sum / reviews.length).toFixed(1);
    }

    res.json({ success: true, product: { ...product, avgRating, totalReviews: reviews.length }, reviews });
  } catch (error) {
    console.error('Get Product Detail Error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi tải chi tiết sản phẩm' });
  }
};

exports.getRestaurantDetail = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).lean();
    if (!restaurant) return res.status(404).json({ success: false, message: 'Không tìm thấy nhà hàng' });

    const products = await Product.find({ restaurantId: restaurant._id, status: 'available' }).populate('categoryId').lean();
    const productIds = products.map(p => p._id);
    const reviews = await Review.find({ product: { $in: productIds } }, 'rating');
    let averageRating = 0;
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
      averageRating = (sum / reviews.length).toFixed(1);
    }

    let categoriesMap = {};
    products.forEach(p => {
      const catId = p.categoryId ? p.categoryId._id.toString() : 'other';
      const catName = p.categoryId ? p.categoryId.name : 'Món khác';
      if (!categoriesMap[catId]) categoriesMap[catId] = { id: catId, name: catName, items: [] };
      categoriesMap[catId].items.push({ id: p._id, name: p.name, desc: p.description, price: p.price, image: p.image, sold: '50+' });
    });

    const categories = Object.values(categoriesMap);
    const menuObj = {};
    categories.forEach(c => { menuObj[c.id] = c.items; });

    const storeInfo = {
      id: restaurant._id, name: restaurant.name,
      banner: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2000&auto=format&fit=crop',
      logo: restaurant.image || 'https://images.unsplash.com/photo-1543826173-70651703c5a4?q=80&w=200&auto=format&fit=crop',
      rating: averageRating > 0 ? averageRating : 'N/A',
      reviews: `${reviews.length} đánh giá`,
      distance: 'Gần đây', time: '15-30 phút',
      categories: categories.map(c => ({ id: c.id, name: c.name })),
      menu: menuObj
    };

    res.json({ success: true, data: storeInfo });
  } catch (error) {
    console.error('getRestaurantDetail Error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi tải chi tiết quán' });
  }
};

exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;
    const userId = req.user._id;

    if (!rating || !comment) return res.status(400).json({ success: false, message: 'Vui lòng cung cấp rating và comment' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });

    const existingReview = await Review.findOne({ user: userId, product: productId });
    if (existingReview) return res.status(400).json({ success: false, message: 'Bạn đã đánh giá sản phẩm này rồi' });

    const review = await Review.create({ user: userId, product: productId, rating: Number(rating), comment });
    res.status(201).json({ success: true, message: 'Đánh giá thành công', review });
  } catch (error) {
    console.error('Add Review Error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi thêm đánh giá' });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod, voucherCode } = req.body;
    const customerId = req.user._id;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Giỏ hàng trống!' });
    }

    // Tính tổng giá trị giỏ hàng
    const rawTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Kiểm tra và áp dụng Voucher nếu có
    let discountAmount = 0;
    let appliedVoucher = null;
    if (voucherCode) {
      const voucher = await Voucher.findOne({ code: voucherCode.toUpperCase(), isActive: true });
      if (voucher && new Date(voucher.expiresAt) >= new Date()) {
        if (rawTotal >= voucher.minOrderValue) {
          if (voucher.discountType === 'PERCENT') {
            discountAmount = (rawTotal * voucher.discountValue) / 100;
            if (voucher.maxDiscount > 0 && discountAmount > voucher.maxDiscount) {
              discountAmount = voucher.maxDiscount;
            }
          } else {
            discountAmount = voucher.discountValue;
          }
          appliedVoucher = voucher._id;
        }
      }
    }

    // Group items by restaurant
    const ordersByRestaurant = {};
    items.forEach(item => {
      const rId = typeof item.restaurantId === 'object' ? item.restaurantId._id : item.restaurantId;
      if (!ordersByRestaurant[rId]) {
        ordersByRestaurant[rId] = { restaurantId: rId, items: [], totalPrice: 0 };
      }
      ordersByRestaurant[rId].items.push({ productId: item.id || item.productId, quantity: item.quantity, price: item.price });
      ordersByRestaurant[rId].totalPrice += item.price * item.quantity;
    });

    const restaurantKeys = Object.keys(ordersByRestaurant);
    const Order = require('../models/Order');
    const createdOrders = [];

    for (let i = 0; i < restaurantKeys.length; i++) {
      const rId = restaurantKeys[i];
      const orderData = ordersByRestaurant[rId];
      const ratio = orderData.totalPrice / rawTotal;
      const restaurantDiscount = i === restaurantKeys.length - 1
        ? discountAmount - createdOrders.reduce((s, o) => s + (o.discountAmount || 0), 0)
        : Math.round(discountAmount * ratio);

      const newOrder = await Order.create({
        customerId,
        restaurantId: orderData.restaurantId,
        items: orderData.items,
        totalPrice: Math.max(0, orderData.totalPrice + 40000 - restaurantDiscount),
        discountAmount: restaurantDiscount,
        voucherId: appliedVoucher,
        deliveryAddress: deliveryAddress || 'Giao tận nơi',
        paymentMethod: paymentMethod || 'CASH'
      });
      createdOrders.push(newOrder);
    }

    try {
      require('../utils/socket').getIO().emit('system_orders_changed');
    } catch(err) { console.error('Socket err on createOrder:', err); }

    res.status(201).json({ success: true, orders: createdOrders, discountAmount, appliedVoucher: appliedVoucher ? voucherCode : null });
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ success: false, message: 'Lỗi tạo đơn hàng. Server xử lý quá tải.' });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const Order = require('../models/Order');
    const customerId = req.user._id;
    const orders = await Order.find({ customerId })
      .populate('restaurantId', 'name image address')
      .populate('items.productId', 'name image')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Get My Orders Error:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy danh sách đơn hàng' });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, notifications });
  } catch (error) {
    console.error('Get Notifications Error:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy thông báo' });
  }
};

exports.markNotificationsRead = async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { $set: { isRead: true } });
    res.json({ success: true });
  } catch (error) {
    console.error('Mark Notifications Read Error:', error);
    res.status(500).json({ success: false, message: 'Lỗi đánh dấu đã đọc' });
  }
};

// ── YÊU THÍCH (FAVORITES) ───────────────────────────────────────────────────

exports.getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.user._id }).lean();
    const restIds = favorites.filter(f => f.type === 'restaurant').map(f => f.targetId);
    const prodIds = favorites.filter(f => f.type === 'product').map(f => f.targetId);

    const [restaurants, products] = await Promise.all([
      Restaurant.find({ _id: { $in: restIds } }).lean(),
      Product.find({ _id: { $in: prodIds } }).populate('restaurantId', 'name').lean()
    ]);

    res.json({ success: true, restaurants, products, favoriteIds: favorites.map(f => f.targetId.toString()) });
  } catch (error) {
    console.error('Get Favorites Error:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy danh sách yêu thích' });
  }
};

exports.addFavorite = async (req, res) => {
  try {
    const { targetId, type } = req.body;
    const existing = await Favorite.findOne({ userId: req.user._id, targetId });
    if (existing) return res.json({ success: true, message: 'Đã yêu thích' });
    await Favorite.create({ userId: req.user._id, targetId, type });
    res.json({ success: true, message: 'Đã thêm vào yêu thích' });
  } catch (error) {
    console.error('Add Favorite Error:', error);
    res.status(500).json({ success: false, message: 'Lỗi thêm yêu thích' });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    await Favorite.deleteOne({ userId: req.user._id, targetId: req.params.targetId });
    res.json({ success: true, message: 'Đã bỏ yêu thích' });
  } catch (error) {
    console.error('Remove Favorite Error:', error);
    res.status(500).json({ success: false, message: 'Lỗi xóa yêu thích' });
  }
};

const Location = require('../models/Location');
exports.getLocations = async (req, res) => {
  try {
    const locations = await Location.find({ isActive: true }).lean();
    const expandedLocations = await Promise.all(locations.map(async (loc) => {
      const restaurantCount = await Restaurant.countDocuments({ locationId: loc._id, status: 'approved' });
      return { ...loc, restaurantCount };
    }));
    res.json({ success: true, locations: expandedLocations });
  } catch (error) {
    console.error('Get Locations Error:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy danh sách Tỉnh thành' });
  }
};

// ── VOUCHER ────────────────────────────────────────────────────────────────────
exports.applyVoucher = async (req, res) => {
  try {
    const { code, orderTotal } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Vui lòng nhập mã voucher' });

    const voucher = await Voucher.findOne({ code: code.toUpperCase(), isActive: true });
    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Mã voucher không tồn tại hoặc đã hết hiệu lực' });
    }
    if (new Date(voucher.expiresAt) < new Date()) {
      return res.status(400).json({ success: false, message: 'Voucher đã hết hạn sử dụng' });
    }
    if (orderTotal < voucher.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Đơn hàng tối thiểu để dùng voucher này là ${voucher.minOrderValue.toLocaleString('vi-VN')}đ`
      });
    }

    let discountAmount = 0;
    if (voucher.discountType === 'PERCENT') {
      discountAmount = (orderTotal * voucher.discountValue) / 100;
      if (voucher.maxDiscount > 0 && discountAmount > voucher.maxDiscount) {
        discountAmount = voucher.maxDiscount;
      }
    } else {
      discountAmount = Math.min(voucher.discountValue, orderTotal);
    }

    res.json({
      success: true,
      message: `Áp dụng thành công! Bạn được giảm ${discountAmount.toLocaleString('vi-VN')}đ`,
      voucher: {
        code: voucher.code,
        description: voucher.description,
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
      },
      discountAmount
    });
  } catch (error) {
    console.error('Apply Voucher Error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi kiểm tra voucher' });
  }
};
