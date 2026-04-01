import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, MapPin, Tag, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ActiveOrderBar from '../components/ActiveOrderBar';

const mockBanners = [
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=2000&auto=format&fit=crop'
];

const mockCategories = [
  { id: 1, name: 'Cơm', image: 'https://images.unsplash.com/photo-1623341214825-9f4f963727da?q=80&w=200&auto=format&fit=crop' },
  { id: 2, name: 'Trà sữa', image: 'https://images.unsplash.com/photo-1558853659-7010264104d4?q=80&w=200&auto=format&fit=crop' },
  { id: 3, name: 'Bún / Phở', image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cb438?q=80&w=200&auto=format&fit=crop' },
  { id: 4, name: 'Gà rán', image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=200&auto=format&fit=crop' },
  { id: 5, name: 'Ăn vặt', image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?q=80&w=200&auto=format&fit=crop' },
  { id: 6, name: 'Pizza', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=200&auto=format&fit=crop' },
  { id: 7, name: 'Mì cay', image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?q=80&w=200&auto=format&fit=crop' },
  { id: 8, name: 'Cà phê', image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=200&auto=format&fit=crop' }
];

const mockRestaurants = [
  {
    id: 1,
    name: 'Cơm Tấm Phúc Lộc Thọ - Kha Vạn Cân',
    image: 'https://images.unsplash.com/photo-1543826173-70651703c5a4?q=80&w=800&auto=format&fit=crop',
    rating: 4.8,
    reviews: 1200,
    distance: '1.2 km',
    time: '15 phút',
    tags: ['Freeship', 'Giảm 30K'],
    hasFreeship: true
  },
  {
    id: 2,
    name: 'KFC - Gà Rán & Bơ Gơ - Võ Văn Ngân',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop',
    rating: 4.5,
    reviews: 850,
    distance: '2.5 km',
    time: '25 phút',
    tags: ['Giảm 50%'],
    hasFreeship: false
  },
  {
    id: 3,
    name: 'Phúc Long Coffee & Tea - Vincom Thủ Đức',
    image: 'https://images.unsplash.com/photo-1558853659-7010264104d4?q=80&w=800&auto=format&fit=crop',
    rating: 4.9,
    reviews: 3200,
    distance: '3.0 km',
    time: '30 phút',
    tags: ['Freeship'],
    hasFreeship: true
  },
  {
    id: 4,
    name: 'Bún Bò Huế 31 - Hoàng Diệu 2',
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cb438?q=80&w=800&auto=format&fit=crop',
    rating: 4.3,
    reviews: 450,
    distance: '0.8 km',
    time: '12 phút',
    tags: ['Mua 1 tặng 1'],
    hasFreeship: false
  }
];

const Home = () => {
  const { orderStatusNotification } = useAuth();

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

  return (
    <div className="market-page" style={{ backgroundColor: 'var(--bg-section)', minHeight: '100vh', paddingBottom: '60px' }}>
      {currentStep >= 0 && (
        <section style={{ margin: '14px auto', maxWidth: 1100, padding: '8px 14px', borderRadius: 14, boxShadow: '0 1px 10px rgba(44,62,80,0.12)', backgroundColor: '#ffffff' }}>
          <h3 style={{ marginTop: 0, marginBottom: 10, fontSize: 16, color: '#1f2937' }}>Theo dõi đơn hàng của bạn</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', paddingBottom: 6 }}>
            {orderStatuses.map((step, idx) => {
              const active = idx <= currentStep;
              return (
                <div key={step} style={{ minWidth: 90, textAlign: 'center', position: 'relative', zIndex: 1 }}>
                  <div style={{
                    margin: '0 auto 6px',
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    lineHeight: '24px',
                    color: '#fff',
                    backgroundColor: active ? '#22c55e' : '#cbd5e1',
                    fontSize: 12,
                    fontWeight: 700
                  }}>
                    {idx + 1}
                  </div>
                  <div style={{ fontSize: 11, color: active ? '#0f172a' : '#64748b', fontWeight: active ? 600 : 400 }}>{statusLabels[step]}</div>
                  {idx < orderStatuses.length - 1 && (
                    <div style={{
                      position: 'absolute',
                      top: 12,
                      right: -8,
                      width: 70,
                      height: 2,
                      background: idx < currentStep ? '#22c55e' : '#cbd5e1',
                      zIndex: -1
                    }} />
                  )}
                </div>
              );
            })}
          </div>
          <p style={{ margin: '8px 0 0 0', fontSize: 13, color: '#334155' }}>{statusText}</p>
        </section>
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
            {mockCategories.map((cat) => (
              <Link to={`/menu?category=${cat.id}`} key={cat.id} className="market-cat-item">
                <div className="market-cat-icon">
                  <img src={cat.image} alt={cat.name} />
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

          <div className="restaurant-grid">
            {mockRestaurants.map((res) => (
              <Link to={`/restaurant/${res.id}`} key={res.id} className="restaurant-card">
                <div className="res-img-wrap">
                  <img src={res.image} alt={res.name} className="res-img" />
                  {res.hasFreeship && <span className="res-promo-badge">Freeship Extra</span>}
                </div>
                <div className="res-info">
                  <h3 className="res-name">{res.name}</h3>
                  <div className="res-meta">
                    <div className="res-rating">
                      <Star size={14} fill="#ffc107" />
                      <span>{res.rating}</span>
                    </div>
                    <div className="res-distance">
                      <MapPin size={12} color="var(--text-muted)" style={{ display: 'inline', marginRight: '4px' }} />
                      {res.distance}
                    </div>
                    <div className="res-time">
                      <Clock size={12} color="var(--text-muted)" style={{ display: 'inline', marginRight: '4px' }} />
                      {res.time}
                    </div>
                  </div>
                  <div className="res-tags">
                    {res.tags.map((tag, idx) => (
                      <span key={idx} className={`res-tag ${tag.toLowerCase().includes('freeship') ? 'tag-freeship' : ''}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
