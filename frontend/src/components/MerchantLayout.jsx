import React from 'react';
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
      </main>
    </div>
  );
};

const navStyle = ({ isActive }) => ({
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
});

export default MerchantLayout;
