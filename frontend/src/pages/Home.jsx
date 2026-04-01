import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Star, Clock, MapPin, Tag, ChevronRight } from 'lucide-react';

const mockBanners = [
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=2000&auto=format&fit=crop'
];

// Removed mock categories, we rely on API data

// End of mock data

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/customer/home');
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
                <Link to={`/menu`} key={res._id} className="restaurant-card">
                  <div className="res-img-wrap">
                    <img src={res.image || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800'} alt={res.name} className="res-img" />
                    {res.hasFreeship && <span className="res-promo-badge">Freeship Extra</span>}
                  </div>
                  <div className="res-info">
                    <h3 className="res-name">{res.name}</h3>
                    <div className="res-meta">
                      <div className="res-rating">
                        <Star size={14} fill="#ffc107" />
                        <span>{res.averageRating || 'N/A'}</span>
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
