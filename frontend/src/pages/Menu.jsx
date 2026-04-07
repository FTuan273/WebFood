import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Heart, Search, Filter } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { getImageUrl } from '../utils/imageUrl';
import { useFavorites } from '../context/FavoriteContext';

const Menu = () => {
  const [searchParams] = useSearchParams();
  const rawSearch = searchParams.get('search') || '';

  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [priceRange, setPriceRange] = useState(''); // 'under-100', '100-300', '300-500', 'over-500'

  const [categories, setCategories] = useState([{ id: 'all', name: 'Tất cả món ăn' }]);
  const [products, setProducts] = useState([]);
  const { favoriteProductIds, toggleFavoriteProduct } = useFavorites();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/admin/categories');
        if (res.data && res.data.success) {
          const activeCats = res.data.categories.filter(c => c.isActive).map(c => ({ id: c._id, name: c.name }));
          setCategories([{ id: 'all', name: 'Tất cả món ăn' }, ...activeCats]);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let params = {};

        if (activeCategory !== 'all') {
          params.categoryId = activeCategory;
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

        const locId = localStorage.getItem('userLocationId');
        if (locId) {
          params.locationId = locId;
        }

        const res = await axios.get('http://localhost:5000/api/customer/products', { params });
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
          <h1 className="page-title">Thực đơn của các nhà hàng</h1>
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
              <img src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&auto=format&fit=crop" alt="Banner quảng cáo" style={{ width: '100%', borderRadius: '8px' }} />
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
              {products.map((product) => (
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
                      <button 
                        className="icon-btn" 
                        title="Yêu thích" 
                        onClick={(e) => toggleFavoriteProduct(product._id, e)}
                        style={{ border: 'none', cursor: 'pointer' }}
                      >
                        <Heart size={18} fill={favoriteProductIds.has(product._id) ? '#EE4D2D' : 'none'} color={favoriteProductIds.has(product._id) ? '#EE4D2D' : 'currentColor'} />
                      </button>
                      <Link to={`/product/${product._id}`} className="icon-btn" title="Thêm vào giỏ" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'inherit' }}>
                        <ShoppingCart size={18} />
                      </Link>
                    </div>
                  </div>

                  <div className="product-info">
                    <Link to={`/product/${product._id}`} style={{ textDecoration: 'none' }}>
                      <h3 className="product-name" style={{ color: 'var(--text-main)', cursor: 'pointer', transition: 'color 0.2s', margin: '4px 0' }} onMouseOver={e => e.target.style.color = 'var(--primary)'} onMouseOut={e => e.target.style.color = 'var(--text-main)'}>
                        {product.name}
                      </h3>
                    </Link>
                    {product.restaurantId?.name && (
                      <div style={{ fontSize: '12px', color: '#7f8c8d', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <span style={{ minWidth: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'inline-block' }}></span>
                        {product.restaurantId.name} {product.restaurantId.locationId?.name ? `, ${product.restaurantId.locationId.name}` : ''}
                      </div>
                    )}
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
