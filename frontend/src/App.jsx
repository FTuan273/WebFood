/**
 * @file App.jsx
 * @description Root Component - Cấu trúc định tuyến (Routing) và bao bọc Provider cho ứng dụng.
 * 
 * Các tính năng chính:
 *   - Quản lý định tuyến bằng React Router.
 *   - Tích hợp AuthProvider (Xác thực) và CartProvider (Giỏ hàng).
 *   - Áp dụng Middleware/Guard cho các Route (ProtectedRoute, RoleRoute, NoMinglingGuard).
 *   - Định nghĩa các trang Placeholder cho Dashboard Admin/Merchant.
 *
 * @author WebFood Team
 * @version 2.0.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ─── Import Pages ────────────────────────────────────────────────────────────
import Home from './pages/Home';
import Menu from './pages/Menu';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import RestaurantDetail from './pages/RestaurantDetail';
import Profile from './pages/Profile';

// ─── Import Components & Guards ──────────────────────────────────────────────
import Header from './components/Header';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import NoMinglingGuard from './components/NoMinglingGuard';

import './index.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          {/* Cấu trúc Layout chính: Header - Main - Footer */}
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <CartSidebar />
            
            <main style={{ flex: '1 0 auto' }}>
              <Routes>
                
                {/* ── Luồng Mua sắm (Shopping Flow) ──────────────────────────────
                    Chỉ dành cho Customer và khách vãng lai.
                    Admin/Merchant sẽ bị NoMinglingGuard đẩy ra Dashboard.
                */}
                <Route path="/" element={<NoMinglingGuard><Home /></NoMinglingGuard>} />
                <Route path="/menu" element={<NoMinglingGuard><Menu /></NoMinglingGuard>} />
                <Route path="/product/:id" element={<NoMinglingGuard><ProductDetail /></NoMinglingGuard>} />
                <Route path="/restaurant/:id" element={<NoMinglingGuard><RestaurantDetail /></NoMinglingGuard>} />
                <Route path="/checkout" element={<NoMinglingGuard><Checkout /></NoMinglingGuard>} />
                
                {/* ── Luồng Xác thực (Auth Flow) ────────────────────────────────── */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                
                {/* ── Luồng Quản trị/Phân quyền (Management Flow) ─────────────── */}
                <Route path="/admin/dashboard" element={
                  <RoleRoute allowedRoles={['Admin']}>
                    <div className="dashboard-placeholder">
                      <h1>Khu vực Quản trị Admin</h1>
                      <p>Tính năng quản lý hệ thống tổng thể đang hoàn thiện.</p>
                    </div>
                  </RoleRoute>
                } />
                <Route path="/merchant/dashboard" element={
                  <RoleRoute allowedRoles={['Merchant']}>
                    <div className="dashboard-placeholder">
                      <h1>Khu vực Chủ quán (Merchant)</h1>
                      <p>Hệ thống quản lý đơn hàng và món ăn cho đối tác.</p>
                    </div>
                  </RoleRoute>
                } />

                {/* ── Trang Hồ sơ cá nhân (Yêu cầu Đăng nhập) ───────────────────── */}
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Xử lý Route không tồn tại -> Quay về trang chủ */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>

            <Footer />
          </div>

          {/* Cấu hình hiển thị thông báo Popup toàn ứng dụng */}
          <ToastContainer 
            position="bottom-right" 
            theme="colored" 
            autoClose={3000} 
            hideProgressBar={false}
          />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
