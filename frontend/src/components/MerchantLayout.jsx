import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { UtensilsCrossed, LayoutDashboard, LogOut, ClipboardList, Store, BarChart2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MerchantLayout = () => {
  const { logout } = useAuth();
  const navigate    = useNavigate();

  const handleLogout = () => { logout(); window.location.href = '/login'; };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa', fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar */}
      <aside style={{ width: '230px', backgroundColor: '#1a1a2e', color: 'white', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #2d2d44', textAlign: 'center' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>🍜 WebFood</div>
          <div style={{ fontSize: '0.75rem', color: '#e94560', marginTop: '4px', letterSpacing: '1px' }}>MERCHANT</div>
        </div>

        <nav style={{ flex: 1, padding: '16px 0' }}>
          <NavLink to="/merchant" end style={navStyle}><LayoutDashboard size={18} /> Tổng quan</NavLink>
          <NavLink to="/merchant/orders"   style={navStyle}><ClipboardList size={18} /> Đơn hàng</NavLink>
          <NavLink to="/merchant/products" style={navStyle}><UtensilsCrossed size={18} /> Thực đơn</NavLink>
          <NavLink to="/merchant/store"    style={navStyle}><Store size={18} /> Thông tin quán</NavLink>
          <NavLink to="/merchant/stats"    style={navStyle}><BarChart2 size={18} /> Thống kê</NavLink>
        </nav>

        <div onClick={handleLogout} style={{ padding: '20px', borderTop: '1px solid #2d2d44', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', color: '#aaa', fontSize: '0.9rem' }}>
          <LogOut size={18} /> Đăng xuất
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
};

const navStyle = ({ isActive }) => ({
  display: 'flex', alignItems: 'center', gap: '12px',
  padding: '14px 22px', textDecoration: 'none', fontSize: '0.9rem',
  color: isActive ? '#e94560' : '#ccc',
  backgroundColor: isActive ? 'rgba(233,69,96,0.1)' : 'transparent',
  borderLeft: isActive ? '3px solid #e94560' : '3px solid transparent',
  fontWeight: isActive ? '600' : '400',
  transition: 'all 0.2s'
});

export default MerchantLayout;
