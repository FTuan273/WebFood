import React from 'react';
import { ShoppingCart, Heart } from 'lucide-react';
import { toast } from 'react-toastify';

const featuredProducts = [
  { id: 1, name: 'Sườn nướng tảng', price: '250.000₫', oldPrice: '300.000₫', image: 'https://images.unsplash.com/photo-1544025162-8315ea07f440?w=500&auto=format&fit=crop', isNew: true },
  { id: 2, name: 'Salad cá hồi', price: '150.000₫', oldPrice: '', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500&auto=format&fit=crop', isNew: false },
  { id: 3, name: 'Súp hải sản bóng cá', price: '95.000₫', oldPrice: '120.000₫', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=500&auto=format&fit=crop', isNew: false },
  { id: 4, name: 'Bò lúc lắc khoai tây', price: '180.000₫', oldPrice: '', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&auto=format&fit=crop', badge: '-10%' },
];

const FeaturedProducts = () => {
  const addToCart = (productName) => {
    toast.success(`Đã thêm ${productName} vào giỏ hàng!`);
  };

  return (
    <section className="section">
      <div className="container">
        <div className="text-center">
          <span className="sub-title">Thực đơn</span>
          <h2 className="section-title">Món ăn nổi bật</h2>
        </div>

        <div className="product-grid">
          {featuredProducts.map((product) => (
            <div key={product.id} className="product-card">
              {product.isNew && <span className="product-badge badge-new">New</span>}
              {product.badge && <span className="product-badge badge-sale">{product.badge}</span>}
              
              <div className="product-img-wrapper">
                <img src={product.image} alt={product.name} className="product-img" />
                <div className="product-actions-hover">
                  <button className="icon-btn" title="Yêu thích"><Heart size={18} /></button>
                  <button className="icon-btn" onClick={() => addToCart(product.name)} title="Thêm vào giỏ">
                    <ShoppingCart size={18} />
                  </button>
                </div>
              </div>
              
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <div className="product-price-wrap">
                  <span className="product-price">{product.price}</span>
                  {product.oldPrice && <span className="product-old-price">{product.oldPrice}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center" style={{ marginTop: '40px' }}>
          <a href="/menu" className="btn btn-primary">Xem tất cả thưc đơn</a>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
