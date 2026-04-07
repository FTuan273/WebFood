import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, MapPin, Utensils, Store, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoriteContext';
import axiosInstance from '../utils/axiosInstance';

const Favorites = () => {
  const { token } = useAuth();
  const [tab, setTab] = useState('restaurants');
  const [restaurants, setRestaurants] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toggleFavoriteRestaurant, toggleFavoriteProduct } = useFavorites();

  const fetchFavorites = async () => {
    try {
      const res = await axiosInstance.get('/customer/favorites');
      if (res.data.success) {
        setRestaurants(res.data.restaurants || []);
        setProducts(res.data.products || []);
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFavorites(); }, []);

  const removeFavoriteItem = async (targetId, type) => {
    try {
      if (type === 'restaurant') {
        await toggleFavoriteRestaurant(targetId);
        setRestaurants(prev => prev.filter(r => r._id !== targetId));
      } else {
        await toggleFavoriteProduct(targetId);
        setProducts(prev => prev.filter(p => p._id !== targetId));
      }
    } catch (err) {
      console.error('Error removing favorite:', err);
    }
  };

  const renderStars = (rating) => {
    return [1, 2, 3, 4, 5].map(s => (
      <Star key={s} size={13} fill={s <= rating ? '#ffc107' : 'none'} color={s <= rating ? '#ffc107' : '#ddd'} />
    ));
  };

  return (
    <div style={{ backgroundColor: '#FEF6F3', minHeight: 'calc(100vh - 80px)', padding: '40px 0' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: '42px', height: '42px', background: '#EE4D2D', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Heart size={22} fill="white" color="white" />
            </div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: '#1a1a1a' }}>Yêu Thích</h1>
          </div>
          <p style={{ margin: 0, color: '#999', fontSize: '0.95rem' }}>
            {restaurants.length} nhà hàng · {products.length} món ăn đã lưu
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '2px solid #f0e8e4', marginBottom: '28px', gap: '8px' }}>
          <button
            onClick={() => setTab('restaurants')}
            style={{
              padding: '12px 24px', border: 'none', background: 'none', cursor: 'pointer',
              fontWeight: tab === 'restaurants' ? 700 : 500,
              color: tab === 'restaurants' ? '#EE4D2D' : '#888',
              borderBottom: tab === 'restaurants' ? '3px solid #EE4D2D' : '3px solid transparent',
              marginBottom: '-2px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <Store size={18} /> Nhà hàng
            <span style={{ background: tab === 'restaurants' ? '#EE4D2D' : '#f0e8e4', color: tab === 'restaurants' ? 'white' : '#888', borderRadius: '10px', padding: '2px 8px', fontSize: '0.8rem' }}>
              {restaurants.length}
            </span>
          </button>
          <button
            onClick={() => setTab('products')}
            style={{
              padding: '12px 24px', border: 'none', background: 'none', cursor: 'pointer',
              fontWeight: tab === 'products' ? 700 : 500,
              color: tab === 'products' ? '#EE4D2D' : '#888',
              borderBottom: tab === 'products' ? '3px solid #EE4D2D' : '3px solid transparent',
              marginBottom: '-2px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <Utensils size={18} /> Món ăn
            <span style={{ background: tab === 'products' ? '#EE4D2D' : '#f0e8e4', color: tab === 'products' ? 'white' : '#888', borderRadius: '10px', padding: '2px 8px', fontSize: '0.8rem' }}>
              {products.length}
            </span>
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {[1,2,3,4].map(i => <div key={i} style={{ height: '120px', background: '#f5ede9', borderRadius: '12px', animation: 'shimmer 1.4s infinite' }} />)}
          </div>
        ) : tab === 'restaurants' ? (
          restaurants.length === 0 ? (
            <EmptyState icon={<Store size={40} />} title="Chưa có nhà hàng yêu thích" desc="Hãy ghé thăm trang nhà hàng và nhấn ❤️ để lưu lại!" link="/menu" linkText="Khám phá nhà hàng" />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '18px' }}>
              {restaurants.map(r => (
                <div key={r._id} className="fav-card">
                  <Link to={`/restaurant/${r._id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', gap: '14px', flex: 1 }}>
                    <img
                      src={r.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&q=80'}
                      alt={r.name}
                      style={{ width: '90px', height: '70px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 5px', fontSize: '1rem', fontWeight: 700, color: '#1a1a1a' }}>{r.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                        {renderStars(r.averageRating || 4)}
                        <span style={{ fontSize: '0.82rem', color: '#666', marginLeft: '4px' }}>{r.averageRating || 'N/A'}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#aaa', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} />{r.address || 'Đang cập nhật'}
                      </p>
                    </div>
                  </Link>
                  <button onClick={() => removeFavoriteItem(r._id, 'restaurant')} className="fav-remove-btn" title="Bỏ yêu thích">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )
        ) : (
          products.length === 0 ? (
            <EmptyState icon={<Utensils size={40} />} title="Chưa có món ăn yêu thích" desc="Hãy tìm kiếm món ăn và nhấn ❤️ để lưu lại!" link="/menu" linkText="Khám phá món ăn" />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '18px' }}>
              {products.map(p => (
                <div key={p._id} className="fav-card">
                  <Link to={`/product/${p._id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', gap: '14px', flex: 1 }}>
                    <img
                      src={p.image || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&q=80'}
                      alt={p.name}
                      style={{ width: '90px', height: '70px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 5px', fontSize: '1rem', fontWeight: 700, color: '#1a1a1a' }}>{p.name}</h3>
                      <p style={{ margin: '0 0 4px', fontSize: '0.82rem', color: '#EE4D2D', fontWeight: 600 }}>
                        {p.price?.toLocaleString('vi-VN')}₫
                      </p>
                      {p.restaurantId && (
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#aaa', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Store size={12} /> {p.restaurantId.name}
                        </p>
                      )}
                    </div>
                  </Link>
                  <button onClick={() => removeFavoriteItem(p._id, 'product')} className="fav-remove-btn" title="Bỏ yêu thích">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

const EmptyState = ({ icon, title, desc, link, linkText }) => (
  <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: '16px', border: '1px dashed #f0d8d0' }}>
    <div style={{ width: '72px', height: '72px', background: '#fff0ec', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#EE4D2D' }}>
      {icon}
    </div>
    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#333', margin: '0 0 10px' }}>{title}</h3>
    <p style={{ color: '#aaa', margin: '0 0 24px' }}>{desc}</p>
    <Link to={link} style={{ background: '#EE4D2D', color: 'white', padding: '12px 28px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700 }}>{linkText}</Link>
  </div>
);

export default Favorites;
