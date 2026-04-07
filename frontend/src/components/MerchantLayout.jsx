import React from 'react';
<<<<<<< HEAD
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
=======
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Utensils, Receipt, Store, LogOut } from 'lucide-react';

const MerchantLayout = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f6fa', fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', backgroundColor: '#fff', borderRight: '1px solid #e1e8ed', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px 20px', fontSize: '1.4rem', fontWeight: 'bold', borderBottom: '1px solid #e1e8ed', textAlign: 'center', color: '#2f3542' }}>
          🍔 Cửa Hàng
          <div style={{ fontSize: '0.8rem', color: '#10ac84', marginTop: '5px' }}>Quản trị hệ thống</div>
        </div>
        
        <nav style={{ flex: 1, padding: '20px 0' }}>
          <NavLink to="/merchant" end style={navStyle}>
            <LayoutDashboard size={20} /> Tổng Quan
          </NavLink>
          <NavLink to="/merchant/orders" style={navStyle}>
            <Receipt size={20} /> Đơn Hàng
          </NavLink>
          <NavLink to="/merchant/menu" style={navStyle}>
            <Utensils size={20} /> Thực Đơn
          </NavLink>
          <NavLink to="/merchant/store" style={navStyle}>
            <Store size={20} /> Thiết Lập Quán
          </NavLink>
        </nav>
        
        <div style={{ padding: '20px', borderTop: '1px solid #e1e8ed', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', color: '#57606f', transition: 'color 0.2s' }} onClick={() => window.location.href='/'}>
          <LogOut size={20} /> Đăng xuất
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', minHeight: 'calc(100vh - 60px)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
          <Outlet />
        </div>
>>>>>>> 4bda5ab3159726ea0e764909a552d77f9d3d5df8
      </main>
    </div>
  );
};

const navStyle = ({ isActive }) => ({
<<<<<<< HEAD
  display: 'flex', alignItems: 'center', gap: '12px',
  padding: '14px 22px', textDecoration: 'none', fontSize: '0.9rem',
  color: isActive ? '#e94560' : '#ccc',
  backgroundColor: isActive ? 'rgba(233,69,96,0.1)' : 'transparent',
  borderLeft: isActive ? '3px solid #e94560' : '3px solid transparent',
  fontWeight: isActive ? '600' : '400',
  transition: 'all 0.2s'
=======
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
  padding: '16px 25px',
  color: isActive ? '#10ac84' : '#57606f',
  backgroundColor: isActive ? '#f1fdf9' : 'transparent',
  textDecoration: 'none',
  fontWeight: isActive ? '600' : '500',
  borderRight: isActive ? '4px solid #10ac84' : '4px solid transparent',
  transition: 'all 0.3s ease'
>>>>>>> 4bda5ab3159726ea0e764909a552d77f9d3d5df8
});

export default MerchantLayout;
