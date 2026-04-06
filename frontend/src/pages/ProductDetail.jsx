import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Heart, Share2, Plus, Minus, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { getImageUrl } from '../utils/imageUrl';

// Function to format price
const formatPrice = (price) => {
  if (!price) return '';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('desc');
  
  // Review Form States
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    fetchProductDetail();
  }, [id]);

  const fetchProductDetail = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/customer/products/${id}`);
      if (res.data.success) {
        setProduct(res.data.product);
        setReviews(res.data.reviews || []);
      }
    } catch (error) {
      console.error('Error fetching product detail:', error);
      toast.error('Không thể tải thông tin món ăn');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (type) => {
    if (type === 'increase') setQuantity(q => q + 1);
    if (type === 'decrease' && quantity > 1) setQuantity(q => q - 1);
  };

  const handleAddToCart = () => {
    if (!product) return;
    toast.success(`Đã thêm ${quantity} phần ${product.name} vào giỏ hàng!`);
    // NOTE: Call cart context API here
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Vui lòng nhập nội dung đánh giá!');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Vui lòng đăng nhập để đánh giá món ăn!');
      return;
    }

    setReviewLoading(true);
    try {
      const res = await axios.post(`http://localhost:5000/api/customer/products/${id}/reviews`, {
        rating,
        comment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success('Đánh giá thành công!');
        setComment('');
        fetchProductDetail(); // Reload reviews
      }
    } catch (error) {
      console.error('Error posting review:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return <div style={{textAlign: 'center', padding: '100px 0'}}>Đang tải dữ liệu...</div>;
  }

  if (!product) {
    return <div style={{textAlign: 'center', padding: '100px 0'}}>Sản phẩm không tồn tại.</div>;
  }

  return (
    <div className="product-detail-page">
      {/* Breadcrumb */}
      <div className="container" style={{ padding: '20px 15px' }}>
        <div className="breadcrumb">
          <Link to="/">Trang chủ</Link> <span>/</span> 
          <Link to="/menu">Thực đơn</Link> <span>/</span> 
          <strong>{product.name}</strong>
        </div>
      </div>

      <div className="container">
        <div className="product-detail-layout">
          {/* Images */}
          <div className="product-gallery">
            <div className="main-image">
              <img src={getImageUrl(product.image)} alt={product.name} />
            </div>
          </div>

          {/* Info */}
          <div className="product-info-wrap">
            <h1 className="detail-title">{product.name} {id ? `(#${id})` : ''}</h1>
            
            <div className="product-meta">
              <span>Quán: <strong style={{color: 'var(--primary)'}}>{product.restaurantId?.name || 'Đang cập nhật'}</strong></span>
              <span className="divider">|</span>
              <span>Đánh giá: <strong>{product.avgRating ? `${product.avgRating} ⭐ (${product.totalReviews} lượt)` : 'Chưa có'}</strong></span>
              <span className="divider">|</span>
              <span>Tình trạng: <strong style={{color: product.status === 'available' ? '#28a745' : '#dc3545'}}>{product.status === 'available' ? 'Còn món' : 'Hết món'}</strong></span>
            </div>

            <div className="detail-price-box">
              <span className="current-price">{formatPrice(product.price)}</span>
              {product.oldPrice && <span className="old-price">{formatPrice(product.oldPrice)}</span>}
            </div>

            <p className="detail-short-desc">
              {product.description}
            </p>

            <div className="purchase-actions">
              <div className="quantity-selector">
                <button onClick={() => handleQuantityChange('decrease')}><Minus size={16}/></button>
                <input type="number" value={quantity} readOnly />
                <button onClick={() => handleQuantityChange('increase')}><Plus size={16}/></button>
              </div>
              
              <button 
                className="btn btn-primary btn-add-cart" 
                onClick={handleAddToCart}
              >
                THÊM VÀO GIỎ HÀNG
              </button>
            </div>

            <button className="btn btn-book-table" style={{ width: '100%', padding: '15px' }}>
              ĐẶT BÀN TẠI ĐÂY
            </button>

            <div className="extra-actions">
              <button className="text-btn"><Heart size={18}/> Thêm vào yêu thích</button>
              <button className="text-btn"><Share2 size={18}/> Chia sẻ</button>
            </div>
            
            <div className="trust-badges">
              <div className="badge-item">
                <CheckCircle size={20} color="var(--primary)"/> <span>Giao hàng cực nhanh</span>
              </div>
              <div className="badge-item">
                <CheckCircle size={20} color="var(--primary)"/> <span>Đảm bảo chất lượng 100%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="product-tabs-section">
          <div className="tabs-header">
            <button 
              className={`tab-btn ${activeTab === 'desc' ? 'active' : ''}`}
              onClick={() => setActiveTab('desc')}
            >
              Mô tả món
            </button>
            <button 
              className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Đánh giá ({reviews.length})
            </button>
          </div>
          <div className="tab-content">
            {activeTab === 'desc' && (
              <div className="content-pane">
                <p>{product.description || 'Chưa có mô tả cho món ăn này.'}</p>
                <img src={product.image || 'https://images.unsplash.com/photo-1544025162-8315ea07f440?w=800'} alt="Chi tiết" style={{width: '100%', maxWidth: '600px', display: 'block', margin: '20px auto', borderRadius: '8px'}} />
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="content-pane">
                {/* Form đánh giá */}
                <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Viết đánh giá của bạn</h3>
                  <form onSubmit={handleSubmitReview}>
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Chấm điểm:</label>
                      <select 
                        value={rating} 
                        onChange={(e) => setRating(Number(e.target.value))}
                        style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ced4da' }}
                      >
                        <option value={5}>5 Sao - Rất ngon</option>
                        <option value={4}>4 Sao - Khá ngon</option>
                        <option value={3}>3 Sao - Tạm được</option>
                        <option value={2}>2 Sao - Không ngon</option>
                        <option value={1}>1 Sao - Tệ</option>
                      </select>
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Nhận xét:</label>
                      <textarea 
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Món ăn này như thế nào..."
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ced4da', minHeight: '80px', fontFamily: 'inherit' }}
                        required
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="btn btn-primary" 
                      disabled={reviewLoading}
                      style={{ padding: '10px 20px' }}
                    >
                      {reviewLoading ? 'ĐANG GỬI...' : 'GỬI ĐÁNH GIÁ'}
                    </button>
                  </form>
                </div>

                {/* Danh sách reviews */}
                <div>
                  <h3 style={{ borderBottom: '1px solid #dee2e6', paddingBottom: '10px', marginBottom: '20px' }}>Khách hàng nhận xét ({reviews.length})</h3>
                  {reviews.length === 0 ? (
                    <p style={{ color: '#6c757d' }}>Chưa có đánh giá nào cho món ăn này. Hãy là người đầu tiên!</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {reviews.map((rev) => (
                        <div key={rev._id} style={{ display: 'flex', gap: '15px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#495057' }}>
                            {rev.user?.name ? rev.user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <strong style={{ fontSize: '15px' }}>{rev.user?.name || 'Khách hàng'}</strong>
                              <span style={{ fontSize: '12px', color: '#6c757d' }}>{new Date(rev.createdAt).toLocaleDateString('vi-VN')}</span>
                            </div>
                            <div style={{ color: '#ffc107', marginBottom: '8px', fontSize: '14px' }}>
                              {Array(rev.rating).fill('⭐').join('')}
                            </div>
                            <p style={{ margin: 0, color: '#343a40', fontSize: '14px', lineHeight: '1.5' }}>{rev.comment}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
