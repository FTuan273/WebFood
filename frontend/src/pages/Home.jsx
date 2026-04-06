import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { Star, Clock, MapPin, Tag, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ActiveOrderBar from '../components/ActiveOrderBar';

const mockBanners = [
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=2000&auto=format&fit=crop'
];

const Home = () => {
  const { orderStatusNotification } = useAuth();
  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Logic theo dõi đơn hàng (HEAD)
  const orderStatuses = ['pending', 'confirmed', 'preparing', 'delivering', 'completed'];
  const statusLabels = {
    pending: 'Chờ nhận',
    confirmed: 'Xác nhận',
    preparing: 'Đang chuẩn bị',
    delivering: 'Đang giao',
    completed: 'Hoàn tất'
  };

  const currentStatus = orderStatusNotification?.status || null;
  const currentStep = orderStatuses.indexOf(currentStatus);

  const statusText = currentStatus
    ? currentStatus === 'delivering'
      ? 'Shipper đang mang món ngon đến với bạn!'
      : currentStatus === 'completed'
        ? 'Đơn hàng đã hoàn tất. Cảm ơn bạn đã đặt hàng!'
        : `Đơn hàng đang ở trạng thái: ${statusLabels[currentStatus] || currentStatus}`
    : '';

  // Logic lấy dữ liệu từ API (feature/bao-merchant)
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const res = await axiosInstance.get('/customer/home');
        if (res.data.success) {
          setCategories(res.data.categories || []);
          setRestaurants(res.data.featuredRestaurants || []);
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  return (
    <div className="market-page" style={{ backgroundColor: 'var(--bg-section)', minHeight: '100vh', paddingBottom: '60px' }}>
      
      {/* HUD Theo dõi đơn hàng (HEAD) */}
      {currentStep >= 0 && (
        <div className="container" style={{ paddingTop: '14px' }}>
          <section style={{ margin: '0 auto', maxWidth: 1100, padding: '16px 20px', borderRadius: 14, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', backgroundColor: '#ffffff' }}>
            <h3 style={{ marginTop: 0, marginBottom: 15, fontSize: 16, color: '#1f2937', fontWeight: 700 }}>Theo dõi đơn hàng của bạn</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflowX: 'auto', paddingBottom: 10 }}>
              {orderStatuses.map((step, idx) => {
                const active = idx <= currentStep;
                return (
                  <div key={step} style={{ minWidth: 90, textAlign: 'center', position: 'relative', zIndex: 1, flex: 1 }}>
                    <div style={{
                      margin: '0 auto 8px',
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      lineHeight: '28px',
                      color: '#fff',
                      backgroundColor: active ? '#22c55e' : '#e2e8f0',
                      fontSize: 12,
                      fontWeight: 700,
                      boxShadow: active ? '0 0 10px rgba(34, 197, 94, 0.3)' : 'none',
                      transition: 'all 0.3s ease'
                    }}>
                      {idx + 1}
                    </div>
                    <div style={{ fontSize: 12, color: active ? '#0f172a' : '#94a3b8', fontWeight: active ? 600 : 400 }}>{statusLabels[step]}</div>
                    {idx < orderStatuses.length - 1 && (
                      <div style={{
                        position: 'absolute',
                        top: 14,
                        right: '-50%',
                        width: '100%',
                        height: 2,
                        background: idx < currentStep ? '#22c55e' : '#e2e8f0',
                        zIndex: -1
                      }} />
                    )}
                  </div>
                );
              })}
            </div>
            <p style={{ margin: '10px 0 0 0', fontSize: 14, color: '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22c55e' }}></span>
              {statusText}
            </p>
          </section>
        </div>
      )}

      {/* 1. Banners Section */}
      <section className="market-banner-section">
        <div className="container">
          <div className="banner-slider">
            {mockBanners.map((img, idx) => (
              <div key={idx} className="banner-item">
                <img src={img} alt="Promo Banner" className="banner-img" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Categories / Icons List */}
      <section className="market-category-section">
        <div className="container">
          <div className="market-cat-grid">
            {categories.map((cat) => (
              <Link to={`/menu?search=${encodeURIComponent(cat.name)}`} key={cat._id} className="market-cat-item">
                <div className="market-cat-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                  {cat.icon || '🍽️'}
                </div>
                <span className="market-cat-name">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ActiveOrderBar />

      {/* 3. Nearby Restaurants */}
      <section className="restaurant-listing-section">
        <div className="container">
          <div className="market-section-title">
            <span>Quán ngon gần bạn</span>
            <Link to="/menu" style={{ fontSize: '14px', color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', fontWeight: 600 }}>
              Xem tất cả <ChevronRight size={16} />
            </Link>
          </div>

          {loading ? (
             <div style={{ textAlign: 'center', padding: '40px' }}>Đang tải danh sách quán...</div>
          ) : (
            <div className="restaurant-grid">
              {restaurants.map((res) => (
                <Link to={`/restaurant/${res._id}`} key={res._id} className="restaurant-card">
                  <div className="res-img-wrap">
                    <img src={res.image || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800'} alt={res.name} className="res-img" />
                    {res.hasFreeship && <span className="res-promo-badge">Freeship Extra</span>}
                  </div>
                  <div className="res-info">
                    <h3 className="res-name">{res.name}</h3>
                    <div className="res-meta">
                      <div className="res-rating">
                        <Star size={14} fill="#ffc107" color="#ffc107" />
                        <span>{res.averageRating || '4.5'}</span>
                      </div>
                      <div className="res-distance">
                        <MapPin size={12} color="var(--text-muted)" style={{ display: 'inline', marginRight: '4px' }} />
                        {res.address || 'Đang cập nhật'}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
};

export default Home;
