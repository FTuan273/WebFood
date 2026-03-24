import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Search, ShoppingCart, User, MapPin, ChevronDown } from 'lucide-react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const { cartCount, openSidebar } = useCart();
  const navigate = useNavigate();

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

              <div className="location-selector" title="Chọn địa chỉ giao hàng">
                <MapPin size={18} color="var(--primary)" />
                <div className="location-text">
                  <span className="loc-label">Giao đến:</span>
                  <span className="loc-address">Thu Duc Campus, HUTECH...</span>
                </div>
                <ChevronDown size={14} color="var(--text-muted)" />
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
              <button className="market-cart-btn" onClick={openSidebar}>
                <ShoppingCart size={24} />
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </button>

              {user ? (
                <Link to="/profile" className="user-profile-btn">
                  {/* [THÊM MỚI] Kiểm tra profilePicture để hiển thị Avatar */}
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt="Avatar" className="user-avatar-sm" style={{ objectFit: 'cover' }} />
                  ) : (
                    <div className="user-avatar-sm">{user.lastName?.charAt(0) || user.firstName?.charAt(0) || 'U'}</div>
                  )}
                  <span className="user-name">{user.firstName}</span>
                </Link>
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
