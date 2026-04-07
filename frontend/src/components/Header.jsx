import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { Search, ShoppingCart, User, MapPin, ChevronDown, Bell } from 'lucide-react';
import axios from 'axios';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const { cartCount } = useCart();
  const { notifications, unreadCount, markAllAsRead } = useOrders() || { notifications: [], unreadCount: 0, markAllAsRead: () => {} };
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(localStorage.getItem('userLocationId') || '');
  const [showLocMenu, setShowLocMenu] = useState(false);

  // Click ra ngoài để đóng menu Location
  useEffect(() => {
    const handleClickOutside = (event) => {
       if (showLocMenu && !event.target.closest('.location-selector')) {
          setShowLocMenu(false);
       }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showLocMenu]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/customer/locations')
      .then(res => {
        if (res.data.success) setLocations(res.data.locations);
      })
      .catch(err => console.log('Không lấy được location', err));
  }, []);

  const handleLocationChange = (e) => {
    const locId = e.target.value;
    setSelectedLocation(locId);
    if (locId) {
      localStorage.setItem('userLocationId', locId);
    } else {
      localStorage.removeItem('userLocationId');
    }
    // Reload lại ứng dụng để fetch lại data trang chủ theo Tỉnh
    window.location.reload();
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Logic tìm kiếm món ăn / quán ăn sẽ được xử lý ở đây
      console.log('Searching for:', searchQuery);
      navigate('/menu?search=' + encodeURIComponent(searchQuery));
    }
  };

  return (
    <>
      <header className={`market-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <div className="header-inner">

            <div className="header-left">
              <Link to="/" className="logo">
                <span className="logo-main" style={{ display: 'flex', alignItems: 'center' }}>
                  Shopee<span style={{ color: 'var(--text-main)' }}>GRAB</span>
                </span>
              </Link>

              <div className="location-selector" title="Chọn địa chỉ giao hàng" style={{ position: 'relative' }}>
                <MapPin size={18} color="var(--primary)" />
                <div className="location-text" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', cursor: 'pointer' }} onClick={() => setShowLocMenu(!showLocMenu)}>
                  <span className="loc-label" style={{ fontSize: '11px', color: '#888' }}>Giao đến:</span>
                  <div style={{ fontWeight: 600, color: '#1a1a2e', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
                    {selectedLocation ? (locations.find(l=>l._id === selectedLocation)?.name || 'Khu vực') : 'Tất cả khu vực'}
                    <ChevronDown size={14} color="var(--text-muted)" style={{marginLeft: 4, transition: 'transform 0.2s', transform: showLocMenu ? 'rotate(180deg)' : 'rotate(0)'}}/>
                  </div>
                </div>

                {/* Custom Menu */}
                {showLocMenu && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, background: 'white', minWidth: '320px', boxShadow: '0 10px 40px rgba(0,0,0,0.12)', borderRadius: '12px', zIndex: 1000, marginTop: '12px', maxHeight: '400px', overflowY: 'auto', border: '1px solid #f0f0f0' }}>
                    <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', borderBottom: '1px solid #f5f5f5', background: selectedLocation === '' ? '#fef2f2' : 'white' }} 
                         onClick={() => { handleLocationChange({ target: { value: '' } }); setShowLocMenu(false); }}
                         onMouseEnter={e => e.currentTarget.style.background = '#fcfcfc'}
                         onMouseLeave={e => e.currentTarget.style.background = selectedLocation === '' ? '#fef2f2' : 'white'}
                    >
                      <span style={{ fontWeight: selectedLocation === '' ? 600 : 400, color: selectedLocation === '' ? 'var(--primary)' : '#1a1a2e' }}>Tất cả khu vực</span>
                    </div>
                    {locations.map(loc => (
                      <div key={loc._id} 
                           style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', borderBottom: '1px solid #f5f5f5', background: selectedLocation === loc._id ? '#fef2f2' : 'white' }}
                           onClick={() => { handleLocationChange({ target: { value: loc._id } }); setShowLocMenu(false); }}
                           onMouseEnter={e => e.currentTarget.style.background = selectedLocation === loc._id ? '#fef2f2' : '#fcfcfc'}
                           onMouseLeave={e => e.currentTarget.style.background = selectedLocation === loc._id ? '#fef2f2' : 'white'}
                      >
                         <span style={{ fontWeight: selectedLocation === loc._id ? 600 : 400, color: selectedLocation === loc._id ? 'var(--primary)' : '#1a1a2e' }}>{loc.name}</span>
                         <span style={{ fontSize: '0.85rem', color: '#999' }}>{loc.restaurantCount} địa điểm</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="header-center">
              <form className="search-bar" onSubmit={handleSearch}>
                <Search size={18} color="var(--text-muted)" className="search-icon" />
                <input
                  type="text"
                  placeholder="Tìm kiếm món ăn, quán ăn..."
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="search-btn">Tìm kiếm</button>
              </form>
            </div>

            <div className="header-right">
              <Link to="/cart" className="market-cart-btn" style={{ textDecoration: 'none' }}>
                <ShoppingCart size={24} />
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </Link>

              {user ? (
                <>
                  <div className="notif-dropdown-wrapper">
                    <button 
                      className="market-cart-btn" 
                      style={{ border: 'none', background: 'none', marginLeft: '5px', position: 'relative', cursor: 'pointer' }} 
                      title="Thông báo"
                      onClick={() => {
                        const menu = document.getElementById('notifMenu');
                        if (menu.style.display === 'none') {
                           menu.style.display = 'block';
                           // Đánh dấu đã đọc ngay khi mở chuông (Theo yêu cầu)
                           if (unreadCount > 0) markAllAsRead();
                        } else {
                           menu.style.display = 'none';
                        }
                      }}
                    >
                      <Bell size={24} color="var(--text-main)" />
                      {unreadCount > 0 && <span className="cart-badge" style={{ backgroundColor: '#ff4d4f' }}>{unreadCount}</span>}
                    </button>

                    {/* Danh sách Dropdown xổ ra */}
                    <div id="notifMenu" className="notif-dropdown-menu" style={{ display: 'none' }}>
                      <div className="notif-header">
                        <span>Thông báo mới</span>
                      </div>
                      <div className="notif-list">
                        {(!notifications || notifications.length === 0) ? (
                          <div className="notif-empty">Bạn không có thông báo nào</div>
                        ) : (
                          notifications.map(n => (
                            <Link 
                              key={n._id} 
                              to={n.link || '/orders'} 
                              className={`notif-item ${!n.isRead ? 'unread' : ''}`}
                              onClick={() => document.getElementById('notifMenu').style.display = 'none'}
                            >
                              <div className="notif-title">{n.title}</div>
                              <div className="notif-message">{n.message}</div>
                              <div className="notif-time">{new Date(n.createdAt).toLocaleString('vi-VN')}</div>
                            </Link>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <Link to="/profile" className="user-profile-btn" style={{ marginLeft: '10px' }}>
                  {/* [THÊM MỚI] Kiểm tra profilePicture để hiển thị Avatar */}
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt="Avatar" className="user-avatar-sm" style={{ objectFit: 'cover' }} />
                  ) : (
                    <div className="user-avatar-sm">{user.lastName?.charAt(0) || user.firstName?.charAt(0) || 'U'}</div>
                  )}
                  <span className="user-name">{user.firstName}</span>
                </Link>
                </>
              ) : (
                <Link to="/login" className="btn btn-outline" style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid var(--primary)', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
                  Đăng nhập
                </Link>
              )}
            </div>

          </div>
        </div>
      </header>
      <div className="header-spacer"></div>
    </>
  );
};

export default Header;
