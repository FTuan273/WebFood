import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoriteContext';
import { Star, MapPin, Search, Home as HomeIcon, ShoppingBag, Heart, Award, ArrowRight, Truck, Tag } from 'lucide-react';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [banners, setBanners] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentLocName, setCurrentLocName] = useState('Toàn Quốc');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNav, setActiveNav] = useState('home');
  const { favoriteRestaurantIds, toggleFavoriteRestaurant } = useFavorites();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const locId = localStorage.getItem('userLocationId') || '';
        const res = await axios.get(`http://localhost:5000/api/customer/home${locId ? `?locationId=${locId}` : ''}`);
        if (res.data.success) {
          setCategories(res.data.categories || []);
          setRestaurants(res.data.featuredRestaurants || []);
          if (res.data.banners && res.data.banners.length > 0) {
            setBanners(res.data.banners);
          } else {
            // Hình mặc định nếu không có banner
            setBanners([{ title: 'Trải Nghiệm Món Ngon', imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=2074&auto=format&fit=crop' }]);
          }
        }
        if (locId) {
          const locRes = await axios.get('http://localhost:5000/api/customer/locations');
          if (locRes.data.success) {
            const found = locRes.data.locations.find(l => l._id === locId);
            if (found) setCurrentLocName(found.name);
          }
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/menu?search=' + encodeURIComponent(searchQuery));
    }
  };

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000); // 5s một lần
    return () => clearInterval(interval);
  }, [banners.length]);

  const sideNavItems = [
    { id: 'home', icon: <HomeIcon size={20} />, label: 'Home', to: '/' },
    { id: 'orders', icon: <ShoppingBag size={20} />, label: 'Orders', to: '/orders' },
    { id: 'favorites', icon: <Heart size={20} />, label: 'Favorites', to: '/favorites' },
  ];

  return (
    <div className="new-home-wrapper">

      {/* ── SIDEBAR ICON TRÁI ── */}
      <aside className="home-icon-sidebar">
        {sideNavItems.map(item => (
          <Link
            to={item.to}
            key={item.id}
            className={`sidebar-nav-item ${activeNav === item.id ? 'active' : ''}`}
            onClick={() => setActiveNav(item.id)}
            title={item.label}
          >
            {item.icon}
            <span className="sidebar-nav-label">{item.label}</span>
          </Link>
        ))}
      </aside>

      {/* ── NỘI DUNG CHÍNH ── */}
      <main className="new-home-main">

        {/* 1. HERO BANNER */}
        <section className="hero-banner-section">
          <div className="hero-banner-bg">
            {banners.map((banner, index) => (
              <img
                key={index}
                src={banner.imageUrl}
                alt={banner.title}
                className="hero-bg-img"
                style={{
                  position: 'absolute',
                  top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover',
                  opacity: index === currentBannerIndex ? 1 : 0,
                  zIndex: index === currentBannerIndex ? 2 : 1,
                  transition: 'opacity 0.8s ease-in-out',
                  cursor: banner.link ? 'pointer' : 'default'
                }}
                onClick={() => { if(banner.link) navigate(banner.link); }}
              />
            ))}
            <div className="hero-overlay" style={{ pointerEvents: 'none', zIndex: 3 }} />
            
            {/* Carousel Dots */}
            {banners.length > 1 && (
              <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: 4 }}>
                {banners.map((_, idx) => (
                  <div
                    key={idx}
                    onClick={() => setCurrentBannerIndex(idx)}
                    style={{
                      width: '10px', height: '10px', borderRadius: '50%',
                      backgroundColor: idx === currentBannerIndex ? '#EE4D2D' : 'rgba(255,255,255,0.5)',
                      cursor: 'pointer', transition: 'background-color 0.3s'
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="hero-content">
            <p className="hero-curation-label">Shopee Grab</p>


            <form onSubmit={handleSearch} className="hero-search-form">
              <MapPin size={18} color="#EE4D2D" style={{ flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Tìm kiếm món ăn, quán ăn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="hero-search-input"
              />
              <button type="submit" className="hero-search-btn">Tìm Món</button>
            </form>

            <div className="hero-tags">
              <Link to="/menu" className="hero-tag active-tag">Tất cả</Link>
              {categories.slice(0, 5).map(cat => (
                <Link to={`/menu?search=${encodeURIComponent(cat.name)}`} key={cat._id} className="hero-tag">
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 2. NEARBY CURATIONS */}
        <section className="nearby-section">
          <div className="nearby-header">
            <div>
              <h2 className="nearby-title">Quán Ăn Gần Bạn</h2>
              <p className="nearby-subtitle">Những quán ăn nổi bật trong khu vực {currentLocName}</p>
            </div>
            <Link to="/menu" className="view-all-link">
              Xem tất cả <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="restaurant-skeleton-grid">
              {[1, 2, 3].map(i => <div key={i} className="skeleton-card" />)}
            </div>
          ) : restaurants.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🍽️</div>
              <h3>Chưa có quán ăn nào</h3>
              <p>Khu vực <b>{currentLocName}</b> chưa có quán ăn. Hãy chọn khu vực khác.</p>
            </div>
          ) : (
            <div className="curations-grid">
              {restaurants.map((res, idx) => (
                <Link to={`/restaurant/${res._id}`} key={res._id} className="curation-card">
                  <div className="curation-img-wrap" style={{ position: 'relative' }}>
                    <img
                      src={res.image || 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&q=80'}
                      alt={res.name}
                      className="curation-img"
                    />
                    {idx === 0 && <span className="curation-badge badge-free">FREE DELIVERY</span>}
                    {idx === 1 && <span className="curation-badge badge-editor">EDITOR'S CHOICE</span>}
                    {idx === 2 && <span className="curation-badge badge-free">FREE DELIVERY</span>}
                    <button 
                      onClick={(e) => toggleFavoriteRestaurant(res._id, e)} 
                      style={{ position: 'absolute', top: '10px', right: '10px', background: 'white', border: 'none', borderRadius: '50%', padding: '6px', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                      title="Yêu thích quán này"
                    >
                      <Heart size={18} fill={favoriteRestaurantIds.has(res._id) ? '#EE4D2D' : 'none'} color={favoriteRestaurantIds.has(res._id) ? '#EE4D2D' : '#888'} />
                    </button>
                  </div>
                  <div className="curation-info">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 className="curation-name">{res.name}</h3>
                      <span className="curation-rating">
                        <Star size={12} fill="#ffc107" color="#ffc107" /> {res.averageRating || '4.5'}
                      </span>
                    </div>
                    <p className="curation-address">
                      <MapPin size={12} style={{ flexShrink: 0 }} />
                      {res.address || 'Đang cập nhật địa chỉ'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* 3. FEATURE SPLIT SECTION */}
        <section className="feature-split-section">
          <div className="feature-img-side">
            <img
              src="https://images.unsplash.com/photo-1611599537845-1c7aca0091c0?q=80&w=1974&auto=format&fit=crop"
              alt="Chef cooking"
              className="feature-img"
            />
            <div className="feature-quote-box">
              <p>"Chúng tôi không chỉ giao đồ ăn.<br />Chúng tôi giao trải nghiệm."</p>
              <span>Lựa chọn các quán ăn đạt chuẩn</span>
            </div>
          </div>
          <div className="feature-text-side">
            <p className="feature-eyebrow">Về Chúng Tôi</p>
            <p className="feature-desc">
              Đội ngũ biên tập ẩm thực của chúng tôi lựa chọn kỹ lưỡng từng nhà hàng đối tác
              để đảm bảo bàn ăn của bạn trở thành một điểm đến. Từ ẩm thực đường phố thủ công
              đến các món ăn fine-dining, hãy khám phá những câu chuyện đằng sau hương vị.
            </p>
            <Link to="/menu" className="feature-cta-btn">
              Khám Phá Ngay <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* 4. FOOTER */}

      </main>

    </div>
  );
};

export default Home;
