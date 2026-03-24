import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Clock, MapPin, Search, Plus, ThumbsUp } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';

// Mock data
const mockRestaurant = {
  id: 1,
  name: 'Cơm Tấm Phúc Lộc Thọ - Kha Vạn Cân',
  banner: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2000&auto=format&fit=crop',
  logo: 'https://images.unsplash.com/photo-1543826173-70651703c5a4?q=80&w=200&auto=format&fit=crop',
  rating: 4.8,
  reviews: '5k+',
  distance: '1.2 km',
  time: '15 phút',
  minOrder: '20,000đ',
  tags: ['Freeship', 'Giảm 30K'],
  categories: [
    { id: 'banchay', name: 'Món Bán Chạy' },
    { id: 'com', name: 'Cơm Tấm' },
    { id: 'them', name: 'Món Thêm' },
    { id: 'nuoc', name: 'Đồ Uống' }
  ],
  menu: {
    'banchay': [
      { id: 101, name: 'Cơm Sườn Bì Chả', desc: 'Cơm sườn nướng than hoa, bì heo thái chỉ, chả trứng béo ngậy.', price: 55000, oldPrice: 65000, image: 'https://images.unsplash.com/photo-1623341214825-9f4f963727da?q=80&w=200', sold: '1k+' },
      { id: 102, name: 'Cơm Sườn Nướng', desc: 'Sườn nướng tảng khổng lồ, ướp vị đậm đà.', price: 45000, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=200', sold: '500+' }
    ],
    'com': [
      { id: 103, name: 'Cơm Gà Xối Mỡ', desc: 'Đùi gà xối mỡ giòn rụm.', price: 50000, image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=200', sold: '200+' }
    ],
    'nuoc': [
      { id: 104, name: 'Trà Đá', desc: '', price: 5000, image: null, sold: '2k+' },
      { id: 105, name: 'Pepsi', desc: '', price: 15000, image: null, sold: '500+' }
    ]
  }
};

const RestaurantDetail = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('banchay');
  const [search, setSearch] = useState('');
  const { addToCart, cart, clearCart } = useCart();

  // Handle cross-restaurant cart conflict
  const handleAddToCart = (item) => {
    // In a real app we'd check if the cart already has items from another restaurant
    const hasOtherRes = cart.items.length > 0 && cart.items[0].restaurantId && cart.items[0].restaurantId !== mockRestaurant.id;
    
    if (hasOtherRes) {
      if(window.confirm('Giỏ hàng đang có món của quán khác. Bạn có muốn xóa để đặt quán này?')) {
        clearCart();
        addToCart({...item, restaurantId: mockRestaurant.id, restaurantName: mockRestaurant.name}, 1);
        toast.success(`Đã thêm ${item.name}`);
      }
    } else {
      addToCart({...item, restaurantId: mockRestaurant.id, restaurantName: mockRestaurant.name}, 1);
      toast.success(`Đã thêm ${item.name}`);
    }
  };

  return (
    <div className="storefront-page" style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', paddingBottom: '60px' }}>
      
      {/* Container chung cho giao diện 2 cột màn hình lớn */}
      <div className="container" style={{ paddingTop: '20px' }}>
        
        {/* Banner & Thông tin quán */}
        <div className="store-header-card" style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <div className="store-banner" style={{ height: '220px', position: 'relative' }}>
            <img src={mockRestaurant.banner} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div className="store-info" style={{ padding: '20px', position: 'relative', display: 'flex', gap: '20px' }}>
            <img src={mockRestaurant.logo} alt="Logo" style={{ width: '80px', height: '80px', borderRadius: '8px', marginTop: '-40px', border: '3px solid white', backgroundColor: 'white', objectFit: 'cover', boxShadow: 'var(--shadow-sm)' }} />
            <div style={{ flexGrow: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                <span style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '2px 6px', fontSize: '11px', fontWeight: 'bold', borderRadius: '3px', textTransform: 'uppercase' }}>Đối Tác</span>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{mockRestaurant.name}</h1>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '15px' }}>Cơm Tấm, Món Việt</p>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', fontSize: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Star size={16} fill="#ffc107" color="#ffc107" />
                  <span style={{ fontWeight: 'bold' }}>{mockRestaurant.rating}</span>
                  <span style={{ color: 'var(--text-muted)' }}>({mockRestaurant.reviews} đánh giá)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)' }}>
                  <MapPin size={16} />
                  <span>{mockRestaurant.distance}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)' }}>
                  <Clock size={16} />
                  <span>{mockRestaurant.time}</span>
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
                {mockRestaurant.categories.map(cat => (
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
              {mockRestaurant.categories.map(cat => {
                const items = mockRestaurant.menu[cat.id];
                if (!items) return null;
                
                // Tiêu đề phân mục
                return (
                  <div key={cat.id} id={`category-${cat.id}`} style={{ marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '15px' }}>{cat.name}</h2>
                    <div className="store-items-grid" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {items.map(item => (
                        <div key={item.id} style={{ display: 'flex', padding: '15px', border: '1px solid var(--border)', borderRadius: '8px', transition: '0.2s', backgroundColor: 'white' }} className="store-item-card">
                          
                          {/* Item Image */}
                          {item.image ? (
                            <img src={item.image} alt={item.name} style={{ width: '100px', height: '100px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0, marginRight: '15px' }} />
                          ) : (
                            <div style={{ width: '100px', height: '100px', borderRadius: '6px', backgroundColor: '#f0f0f0', flexShrink: 0, marginRight: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span style={{ color: '#ccc', fontSize: '12px' }}>Không có ảnh</span>
                            </div>
                          )}

                          {/* Item Info */}
                          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>{item.name}</h4>
                              <button 
                                onClick={() => handleAddToCart(item)}
                                style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                              >
                                <Plus size={18} />
                              </button>
                            </div>
                            
                            <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '5px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {item.desc || 'Món ăn cực ngon, đặc sản của quán.'}
                            </p>
                            
                            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div>
                                <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '16px' }}>
                                  {item.price.toLocaleString()}đ
                                </span>
                                {item.oldPrice && (
                                  <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '13px', marginLeft: '8px' }}>
                                    {item.oldPrice.toLocaleString()}đ
                                  </span>
                                )}
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
