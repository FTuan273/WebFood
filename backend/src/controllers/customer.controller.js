const Product = require('../models/Product');
const Restaurant = require('../models/Restaurant');
const CategoryFood = require('../models/CategoryFood');
const Review = require('../models/Review');

exports.getHomeData = async (req, res) => {
  try {
    // 1. Lấy danh sách danh mục chung (CategoryFood)
    const categories = await CategoryFood.find({ isActive: true }).lean() || [];
    
    // 2. Lấy danh sách nhà hàng nổi bật (có thể lấy top rating hoặc random)
    const featuredRestaurants = await Restaurant.find({ status: 'approved' })
      .limit(8)
      .lean();

    res.json({
      success: true,
      categories,
      featuredRestaurants
    });
  } catch (error) {
    console.error('Home Data Error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi tải dữ liệu trang chủ' });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const { search, categoryId, minPrice, maxPrice, sort } = req.query;
    
    // Xây dựng query filter
    let filter = {};
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    // Lọc theo khoảng giá
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    // Xây dựng query sort
    let sortObj = {};
    if (sort === 'price-asc') sortObj.price = 1;
    else if (sort === 'price-desc') sortObj.price = -1;
    else if (sort === 'name-asc') sortObj.name = 1;
    else if (sort === 'name-desc') sortObj.name = -1;
    else sortObj.createdAt = -1; // Mặc định mới nhất

    // Nếu có categoryId, ta cần filter qua CategoryFood model hoặc thêm trực tiếp nếu Product có categoryId
    // Tạm giả định ở version này Product có lưu category trực tiếp. Nếu chưa thì sẽ tra cứu.
    let productsQuery = Product.find(filter).populate('restaurantId', 'name address');
    
    if (sortObj) {
        productsQuery = productsQuery.sort(sortObj);
    }

    const products = await productsQuery.populate('restaurantId', 'name').lean();

    // Lọc thủ công dựa theo categoryId - vì cấu trúc Product với Category đôi khi qua CategoryFood.
    // Nếu db hỗ trợ thì ta sẽ tối ưu sau.
    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Get Products Error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi tải danh sách sản phẩm' });
  }
};

exports.getProductDetail = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('restaurantId', 'name address phone')
      .lean();

    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }

    // Lấy kèm danh sách reviews
    const reviews = await Review.find({ product: req.params.id })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .lean();

    // Tính điểm đánh giá trung bình
    let avgRating = 0;
    if (reviews.length > 0) {
        const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
        avgRating = (sum / reviews.length).toFixed(1);
    }

    res.json({
      success: true,
      product: { ...product, avgRating, totalReviews: reviews.length },
      reviews
    });
  } catch (error) {
    console.error('Get Product Detail Error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi tải chi tiết sản phẩm' });
  }
};

exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;
    const userId = req.user._id;

    if (!rating || !comment) {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp rating và comment' });
    }

    // Kiểm tra sản phẩm có tồn tại không
    const product = await Product.findById(productId);
    if (!product) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }

    // Tạo review mới (cho phép đánh giá nhiều lần hoặc chỉ 1 lần tùy logic, ở đây cho phép nều chưa có)
    const existingReview = await Review.findOne({ user: userId, product: productId });
    if (existingReview) {
        return res.status(400).json({ success: false, message: 'Bạn đã đánh giá sản phẩm này rồi' });
    }

    const review = await Review.create({
      user: userId,
      product: productId,
      rating: Number(rating),
      comment
    });

    res.status(201).json({
      success: true,
      message: 'Đánh giá thành công',
      review
    });
  } catch (error) {
    console.error('Add Review Error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi thêm đánh giá' });
  }
};
