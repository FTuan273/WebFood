import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

const allProducts = [
  { id: 1, name: 'Sườn nướng tảng', price: 250000, category: 'mon-chinh', image: 'https://images.unsplash.com/photo-1544025162-8315ea07f440?w=500&auto=format&fit=crop' },
  { id: 2, name: 'Salad cá hồi', price: 150000, category: 'khai-vi', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500&auto=format&fit=crop' },
  { id: 3, name: 'Súp hải sản bóng cá', price: 95000, category: 'canh-sup', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=500&auto=format&fit=crop' },
  { id: 4, name: 'Bò lúc lắc khoai tây', price: 180000, category: 'mon-chinh', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&auto=format&fit=crop' },
  { id: 5, name: 'Tiramisu', price: 65000, category: 'trang-mieng', image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=500&auto=format&fit=crop' },
  { id: 6, name: 'Nước ép dưa hấu', price: 45000, category: 'do-uong', image: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?w=500&auto=format&fit=crop' },
];

const categories = [
  { id: 'all', name: 'Tất cả món ăn' },
  { id: 'khai-vi', name: 'Khai vị' },
  { id: 'mon-chinh', name: 'Món chính' },
  { id: 'canh-sup', name: 'Canh & Súp' },
  { id: 'trang-mieng', name: 'Tráng miệng' },
  { id: 'do-uong', name: 'Đồ uống' },
];

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  // Filter & Sort Logic
  let filteredProducts = activeCategory === 'all' 
    ? allProducts 
    : allProducts.filter(p => p.category === activeCategory);

  if (sortBy === 'price-asc') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-desc') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'name-asc') {
    filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="menu-page">
      {/* Page Banner */}
      <div className="page-banner">
        <div className="container">
          <h1 className="page-title">Thực đơn nhà hàng</h1>
          <div className="breadcrumb">
            <Link to="/">Trang chủ</Link> <span>/</span> <strong>Thực đơn</strong>
          </div>
        </div>
      </div>

      <div className="container section">
        <div className="menu-layout">
          {/* Sidebar */}
          <aside className="menu-sidebar">
            <div className="sidebar-widget">
              <h3 className="widget-title-dark">Danh mục món ăn</h3>
              <ul className="category-list">
                {categories.map(cat => (
                  <li key={cat.id}>
                    <button 
                      className={`cat-btn ${activeCategory === cat.id ? 'active' : ''}`}
                      onClick={() => setActiveCategory(cat.id)}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="sidebar-widget">
              <h3 className="widget-title-dark">Lọc theo giá</h3>
              <div className="price-filter">
                <label className="filter-checkbox">
                  <input type="checkbox" /> <span>Dưới 100.000đ</span>
                </label>
                <label className="filter-checkbox">
                  <input type="checkbox" /> <span>100.000đ - 300.000đ</span>
                </label>
                <label className="filter-checkbox">
                  <input type="checkbox" /> <span>300.000đ - 500.000đ</span>
                </label>
                <label className="filter-checkbox">
                  <input type="checkbox" /> <span>Trên 500.000đ</span>
                </label>
              </div>
            </div>
            
            <div className="sidebar-banner" style={{ marginTop: '30px' }}>
                <img src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&auto=format&fit=crop" alt="Banner quảng cáo" style={{ width: '100%', borderRadius: '8px' }}/>
            </div>
          </aside>

          {/* Main Content */}
          <main className="menu-content">
            {/* Toolbar */}
            <div className="menu-toolbar">
              <div className="toolbar-left">
                <span>Hiển thị <strong>{filteredProducts.length}</strong> kết quả</span>
              </div>
              <div className="toolbar-right">
                <label>Sắp xếp:</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
                  <option value="default">Mặc định</option>
                  <option value="name-asc">Tên A-Z</option>
                  <option value="name-desc">Tên Z-A</option>
                  <option value="price-asc">Giá tăng dần</option>
                  <option value="price-desc">Giá giảm dần</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            <div className="product-grid menu-product-grid">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="product-card"
                >
                  <div className="product-img-wrapper">
                    <img src={product.image} alt={product.name} className="product-img" />
                    <div className="product-actions-hover">
                      <button className="icon-btn" title="Yêu thích"><Heart size={18} /></button>
                      <button className="icon-btn" title="Thêm vào giỏ">
                        <ShoppingCart size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <div className="product-price-wrap">
                      <span className="product-price">{formatPrice(product.price)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Menu;
