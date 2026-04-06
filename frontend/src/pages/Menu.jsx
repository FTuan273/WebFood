import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Search, Filter } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { getImageUrl } from '../utils/imageUrl';

const categories = [
  { id: 'all', name: 'Tất cả món ăn' },
  { id: 'khai-vi', name: 'Khai vị' },
  { id: 'mon-chinh', name: 'Món chính' },
  { id: 'canh-sup', name: 'Canh & Súp' },
  { id: 'trang-mieng', name: 'Tráng miệng' },
  { id: 'do-uong', name: 'Đồ uống' },
];

const Menu = () => {
  const [searchParams] = useSearchParams();
  const rawSearch = searchParams.get('search') || '';
  
  const [activeCategory, setActiveCategory] = useState(rawSearch ? rawSearch : 'all');
  const [sortBy, setSortBy] = useState('default');
  const [priceRange, setPriceRange] = useState(''); // 'under-100', '100-300', '300-500', 'over-500'

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let params = {};
        
        if (activeCategory !== 'all') {
          params.search = activeCategory; 
        } else if (rawSearch) {
          params.search = rawSearch;
        }

        if (sortBy !== 'default') {
          params.sort = sortBy;
        }

        if (priceRange === 'under-100') {
          params.maxPrice = 100000;
        } else if (priceRange === '100-300') {
          params.minPrice = 100000;
          params.maxPrice = 300000;
        } else if (priceRange === '300-500') {
          params.minPrice = 300000;
          params.maxPrice = 500000;
        } else if (priceRange === 'over-500') {
          params.minPrice = 500000;
        }

        const res = await axiosInstance.get('/customer/products', { params });
        if (res.data.success) {
          setProducts(res.data.products);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [activeCategory, sortBy, priceRange, rawSearch]);

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
                  <input type="radio" name="price" checked={priceRange === ''} onChange={() => setPriceRange('')} /> <span>Tất cả</span>
                </label>
                <label className="filter-checkbox">
                  <input type="radio" name="price" checked={priceRange === 'under-100'} onChange={() => setPriceRange('under-100')} /> <span>Dưới 100.000đ</span>
                </label>
                <label className="filter-checkbox">
                  <input type="radio" name="price" checked={priceRange === '100-300'} onChange={() => setPriceRange('100-300')} /> <span>100.000đ - 300.000đ</span>
                </label>
                <label className="filter-checkbox">
                  <input type="radio" name="price" checked={priceRange === '300-500'} onChange={() => setPriceRange('300-500')} /> <span>300.000đ - 500.000đ</span>
                </label>
                <label className="filter-checkbox">
                  <input type="radio" name="price" checked={priceRange === 'over-500'} onChange={() => setPriceRange('over-500')} /> <span>Trên 500.000đ</span>
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
                <span>Hiển thị <strong>{products.length}</strong> kết quả</span>
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

            <div className="product-grid menu-product-grid">
              {loading ? (
                <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '40px'}}>Đang tải món ăn...</div>
              ) : products.length === 0 ? (
                <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '40px'}}>Không tìm thấy món ăn nào phù hợp</div>
              ) : (
                products.map((product) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="product-card"
                  >
                    <div className="product-img-wrapper">
                      <img src={getImageUrl(product.image)} alt={product.name} className="product-img" />
                      <div className="product-actions-hover">
                        <button className="icon-btn" title="Yêu thích"><Heart size={18} /></button>
                        <button className="icon-btn" title="Thêm vào giỏ">
                          <ShoppingCart size={18} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="product-info">
                      <Link to={`/product/${product._id}`} style={{textDecoration: 'none'}}>
                        <h3 className="product-name" style={{color: 'var(--text-main)', cursor: 'pointer', transition: 'color 0.2s'}} onMouseOver={e=>e.target.style.color='var(--primary)'} onMouseOut={e=>e.target.style.color='var(--text-main)'}>
                          {product.name}
                        </h3>
                      </Link>
                      {product.restaurantId?.name && (
                        <div style={{fontSize: '12px', color: '#7f8c8d', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px'}}>
                          <span style={{width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'inline-block'}}></span>
                          {product.restaurantId.name}
                        </div>
                      )}
                      <div className="product-price-wrap">
                        <span className="product-price">{formatPrice(product.price)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Menu;
