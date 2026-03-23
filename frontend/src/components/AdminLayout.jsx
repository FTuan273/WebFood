import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Store, LogOut } from 'lucide-react';

const AdminLayout = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f1f2f6', fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', backgroundColor: '#2f3542', color: 'white', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px 20px', fontSize: '1.4rem', fontWeight: 'bold', borderBottom: '1px solid #57606f', textAlign: 'center', letterSpacing: '1px' }}>
          🍔 WebFood
          <div style={{ fontSize: '0.8rem', color: '#ff4757', marginTop: '5px' }}>Super Admin</div>
        </div>
        
        <nav style={{ flex: 1, padding: '20px 0' }}>
          <NavLink to="/admin" end style={navStyle}>
            <LayoutDashboard size={20} /> Tổng Quan
          </NavLink>
          <NavLink to="/admin/users" style={navStyle}>
            <Users size={20} /> Quản lý User
          </NavLink>
          <NavLink to="/admin/restaurants" style={navStyle}>
            <Store size={20} /> Duyệt Quán Ăn
          </NavLink>
        </nav>
        
        <div style={{ padding: '20px', borderTop: '1px solid #57606f', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', color: '#ced6e0', transition: 'color 0.2s' }}>
          <LogOut size={20} /> Đăng xuất
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', minHeight: 'calc(100vh - 60px)', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
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
  color: isActive ? '#ff4757' : '#ced6e0',
  backgroundColor: isActive ? '#1e2025' : 'transparent',
  textDecoration: 'none',
  fontWeight: isActive ? '600' : '500',
  borderRight: isActive ? '4px solid #ff4757' : '4px solid transparent',
  transition: 'all 0.3s ease'
});

export default AdminLayout;
