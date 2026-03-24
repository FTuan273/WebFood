import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Heart, Share2, Plus, Minus, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';

// Mock data (thực tế sẽ gọi API dựa vào id)
const product = {
  id: 1,
  name: 'Sườn nướng tảng khổng lồ rưới xốt BBQ',
  price: 250000,
  oldPrice: 300000,
  sku: 'SP001',
  vendor: 'Dola Chef',
  status: 'In stock',
  image: 'https://images.unsplash.com/photo-1544025162-8315ea07f440?w=800&auto=format&fit=crop',
  gallery: [
    'https://images.unsplash.com/photo-1544025162-8315ea07f440?w=200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&auto=format&fit=crop',
  ],
  description: 'Món sườn nướng tảng được tẩm ướp với gia vị độc quyền, nướng chậm trên than hồng giúp thịt mềm tan, mọng nước. Rưới thêm xốt BBQ đậm đà, ăn kèm salad và khoai tây chiên giòn.',
};

const ProductDetail = () => {
  const { id } = useParams(); // dùng để gọi API lấy product thật
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('desc');

  const handleQuantityChange = (type) => {
    if (type === 'increase') setQuantity(q => q + 1);
    if (type === 'decrease' && quantity > 1) setQuantity(q => q - 1);
  };

  const handleAddToCart = () => {
    toast.success(`Đã thêm ${quantity} phần ${product.name} vào giỏ hàng!`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

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
              <img src={product.image} alt={product.name} />
            </div>
            <div className="thumbnail-list">
              {product.gallery.map((img, idx) => (
                <div key={idx} className="thumbnail active">
                  <img src={img} alt="thumbnail" />
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="product-info-wrap">
            <h1 className="detail-title">{product.name}</h1>
            
            <div className="product-meta">
              <span>Thương hiệu: <strong style={{color: 'var(--primary)'}}>{product.vendor}</strong></span>
              <span className="divider">|</span>
              <span>Mã SP: <strong>{product.sku}</strong></span>
              <span className="divider">|</span>
              <span>Tình trạng: <strong style={{color: '#28a745'}}>{product.status}</strong></span>
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
              Mô tả chi tiết
            </button>
            <button 
              className={`tab-btn ${activeTab === 'policy' ? 'active' : ''}`}
              onClick={() => setActiveTab('policy')}
            >
              Chính sách giao hàng
            </button>
          </div>
          <div className="tab-content">
            {activeTab === 'desc' && (
              <div className="content-pane">
                <p>{product.description}</p>
                <p>Món ăn phù hợp cho gia đình, tiệc tùng. Rất ngon khi uống kèm rượu vang đỏ.</p>
                <img src={product.image} alt="Chi tiết" style={{width: '100%', maxWidth: '600px', display: 'block', margin: '20px auto', borderRadius: '8px'}} />
              </div>
            )}
            {activeTab === 'policy' && (
              <div className="content-pane">
                <ul>
                  <li>Giao hàng miễn phí cho đơn hàng trên 500.000đ trong bán kính 5km.</li>
                  <li>Sản phẩm luôn được đóng hộp cẩn thận, giữ nhiệt để đảm bảo hương vị.</li>
                  <li>Nếu sản phẩm có vấn đề, vui lòng liên hệ hotline trong vòng 30 phút kể từ lúc nhận hàng.</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
