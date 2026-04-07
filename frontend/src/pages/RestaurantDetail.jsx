import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Clock, MapPin, Search, Plus, ThumbsUp, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { getImageUrl } from '../utils/imageUrl';
import { useFavorites } from '../context/FavoriteContext';

const RestaurantDetail = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('');
  const [search, setSearch] = useState('');
  const { addToCart, cart, clearCart } = useCart();
  const { favoriteRestaurantIds, toggleFavoriteRestaurant, favoriteProductIds, toggleFavoriteProduct } = useFavorites();
  
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurantDetail = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/customer/restaurants/${id}`);
        if (res.data.success) {
          setRestaurant(res.data.data);
          if (res.data.data.categories && res.data.data.categories.length > 0) {
            setActiveTab(res.data.data.categories[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching restaurant detail:', error);
        toast.error('Không thể tải thông tin nhà hàng');
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurantDetail();
  }, [id]);

  // Handle cross-restaurant cart conflict
  const handleAddToCart = (item) => {
    const hasOtherRes = cart.items.length > 0 && cart.items[0].restaurantId && cart.items[0].restaurantId !== restaurant.id;
    
    if (hasOtherRes) {
      if(window.confirm('Giỏ hàng đang có món của quán khác. Bạn có muốn xóa để đặt quán này?')) {
        clearCart();
        addToCart({...item, restaurantId: restaurant.id, restaurantName: restaurant.name}, 1);
        toast.success(`Đã thêm ${item.name}`);
      }
    } else {
      addToCart({...item, restaurantId: restaurant.id, restaurantName: restaurant.name}, 1);
      toast.success(`Đã thêm ${item.name}`);
    }
  };

  if (loading) return <div style={{padding: '50px', textAlign: 'center'}}>Đang tải nhà hàng...</div>;
  if (!restaurant) return <div style={{padding: '50px', textAlign: 'center'}}>Không tìm thấy nhà hàng!</div>;

  return (
    <div className="storefront-page" style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', paddingBottom: '60px' }}>
      
      {/* Container chung cho giao diện 2 cột màn hình lớn */}
      <div className="container" style={{ paddingTop: '20px' }}>
        
        {/* Banner & Thông tin quán */}
        <div className="store-header-card" style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <div className="store-banner" style={{ height: '220px', position: 'relative' }}>
            <img src={restaurant.banner} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div className="store-info" style={{ padding: '20px', position: 'relative', display: 'flex', gap: '20px' }}>
            <img src={getImageUrl(restaurant.logo)} alt="Logo" style={{ width: '80px', height: '80px', borderRadius: '8px', marginTop: '-40px', border: '3px solid white', backgroundColor: 'white', objectFit: 'cover', boxShadow: 'var(--shadow-sm)' }} />
            <div style={{ flexGrow: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                <span style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '2px 6px', fontSize: '11px', fontWeight: 'bold', borderRadius: '3px', textTransform: 'uppercase' }}>Đối Tác</span>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{restaurant.name}</h1>
                <button 
                  onClick={(e) => toggleFavoriteRestaurant(restaurant.id, e)} 
                  style={{ background: 'none', border: '1px solid #eee', borderRadius: '50%', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto' }}
                  title="Yêu thích quán này"
                >
                  <Heart size={20} fill={favoriteRestaurantIds.has(restaurant.id) ? '#EE4D2D' : 'none'} color={favoriteRestaurantIds.has(restaurant.id) ? '#EE4D2D' : '#888'} />
                </button>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '15px' }}>Đồ Ăn, Nước Uống</p>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', fontSize: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Star size={16} fill="#ffc107" color="#ffc107" />
                  <span style={{ fontWeight: 'bold' }}>{restaurant.rating}</span>
                  <span style={{ color: 'var(--text-muted)' }}>({restaurant.reviews})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)' }}>
                  <MapPin size={16} />
                  <span>{restaurant.distance}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)' }}>
                  <Clock size={16} />
                  <span>{restaurant.time}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Khung chức năng: Sidebar Menu & Món ăn */}
        <div className="store-body" style={{ display: 'flex', gap: '20px' }}>
          
          {/* Cột trái: Phân loại */}
          <div className="store-sidebar" style={{ width: '250px', flexShrink: 0 }}>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '15px', position: 'sticky', top: '90px', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '15px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Thực đơn</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {restaurant.categories && restaurant.categories.map(cat => (
                  <li key={cat.id} style={{ marginBottom: '5px' }}>
                    <button 
                      onClick={() => setActiveTab(cat.id)}
                      style={{ 
                        width: '100%', textAlign: 'left', padding: '10px', 
                        backgroundColor: activeTab === cat.id ? '#fff3f0' : 'transparent',
                        color: activeTab === cat.id ? 'var(--primary)' : 'var(--text-main)',
                        border: 'none', borderRadius: '6px', cursor: 'pointer',
                        fontWeight: activeTab === cat.id ? 600 : 400,
                        borderLeft: activeTab === cat.id ? '3px solid var(--primary)' : '3px solid transparent'
                      }}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
                {!restaurant.categories || restaurant.categories.length === 0 ? (
                  <li style={{color: '#999', fontSize: '14px', fontStyle: 'italic'}}>Quán chưa có món</li>
                ) : null}
              </ul>
            </div>
          </div>

          {/* Cột phải: Danh sách món */}
          <div className="store-menu-content" style={{ flexGrow: 1 }}>
            
            {/* Thanh tìm kiếm món */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '15px', marginBottom: '20px', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center' }}>
              <Search size={20} color="var(--text-muted)" style={{ marginRight: '10px' }} />
              <input 
                type="text" 
                placeholder="Tìm món ăn trong quán..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ border: 'none', outline: 'none', width: '100%', fontSize: '15px', fontFamily: 'var(--font-main)' }}
              />
            </div>

            {/* Render Danh sách món */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
              {restaurant.categories && restaurant.categories.map(cat => {
                let items = restaurant.menu[cat.id] || [];
                
                if (search) {
                  items = items.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));
                }

                if (items.length === 0) return null;
                
                // Tiêu đề phân mục
                return (
                  <div key={cat.id} id={`category-${cat.id}`} style={{ marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '15px' }}>{cat.name}</h2>
                    <div className="store-items-grid" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {items.map(item => (
                        <div key={item.id} style={{ display: 'flex', padding: '15px', border: '1px solid var(--border)', borderRadius: '8px', transition: '0.2s', backgroundColor: 'white' }} className="store-item-card">
                          
                          {/* Item Image */}
                          <Link to={`/product/${item.id}`}>
                            {item.image ? (
                              <img src={getImageUrl(item.image)} alt={item.name} style={{ width: '100px', height: '100px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0, marginRight: '15px', cursor: 'pointer' }} />
                            ) : (
                              <div style={{ width: '100px', height: '100px', borderRadius: '6px', backgroundColor: '#f0f0f0', flexShrink: 0, marginRight: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <span style={{ color: '#ccc', fontSize: '12px' }}>Không có ảnh</span>
                              </div>
                            )}
                          </Link>

                          {/* Item Info */}
                          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Link to={`/product/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600, cursor: 'pointer' }} onMouseOver={e => e.target.style.color='var(--primary)'} onMouseOut={e => e.target.style.color='inherit'}>
                                  {item.name}
                                </h4>
                              </Link>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button 
                                  onClick={(e) => toggleFavoriteProduct(item.id, e)}
                                  style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#fff', border: '1px solid #ddd', color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                >
                                  <Heart size={16} fill={favoriteProductIds.has(item.id) ? '#EE4D2D' : 'none'} color={favoriteProductIds.has(item.id) ? '#EE4D2D' : 'currentColor'} />
                                </button>
                                <button 
                                  onClick={() => handleAddToCart(item)}
                                  style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                                >
                                  <Plus size={18} />
                                </button>
                              </div>
                            </div>
                            
                            <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '5px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {item.desc || 'Món ăn cực ngon, đặc sản của quán.'}
                            </p>
                            
                            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div>
                                <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '16px' }}>
                                  {item.price.toLocaleString()}đ
                                </span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '12px' }}>
                                <ThumbsUp size={12} /> {item.sold} Đã bán
                              </div>
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default RestaurantDetail;
