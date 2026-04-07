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

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { FavoriteProvider } from './context/FavoriteContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { io } from 'socket.io-client';

// ─── Import Pages ────────────────────────────────────────────────────────────
import Home from './pages/Home';
import Menu from './pages/Menu';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Checkout from './pages/Checkout';
import MoMoReturn from './pages/MoMoReturn';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import RestaurantDetail from './pages/RestaurantDetail';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';

// ─── Import Components & Guards ──────────────────────────────────────────────
import Header from './components/Header';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import NoMinglingGuard from './components/NoMinglingGuard';

import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Restaurants from './pages/Restaurants';
import Categories from './pages/Categories';
import AdminLocations from './pages/AdminLocations';
import AdminBanners from './pages/AdminBanners';
import AdminFinances from './pages/AdminFinances';
import AdminOrders from './pages/AdminOrders';
import AdminVouchers from './pages/AdminVouchers';

import MerchantLayout from './components/MerchantLayout';
import MerchantDashboard from './pages/MerchantDashboard';
import MerchantProducts from './pages/MerchantProducts';
import MerchantOrders from './pages/MerchantOrders';
import MerchantStore from './pages/MerchantStore';
import MerchantStats from './pages/MerchantStats';
import MerchantReviews from './pages/MerchantReviews';

import './index.css';

function App() {
  useEffect(() => {
    const socket = io('http://localhost:5000');
    
    socket.on('new_voucher', (data) => {
      // Play alert sound
      const audio = new Audio('https://actions.google.com/sounds/v1/alarms/checking_chime.ogg');
      audio.play().catch(err => console.log('Audio play blocked:', err));
      
      // WOW Notification
      toast(
        <div style={{ textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '8px', fontWeight: 'bold', color: '#ff4757', textShadow: '0 0 10px rgba(255, 71, 87, 0.4)' }}>
            🔥 DEALS MỚI HOT 🔥
          </div>
          <div style={{ marginBottom: '15px', color: '#ced6e0' }}>{data.description}</div>
          <div style={{ 
            backgroundColor: '#ff4757', color: 'white', padding: '10px 20px', 
            borderRadius: '8px', fontSize: '1.8rem', fontWeight: '900', letterSpacing: '2px', 
            border: '2px dashed #f1f2f6', display: 'inline-block' 
          }}>
            {data.code}
          </div>
          <div style={{ marginTop: '12px', fontSize: '0.85rem', color: '#747d8c' }}>Hãy sử dụng ngay trước khi hết hạn!</div>
        </div>, 
        {
          position: "top-center",
          autoClose: 12000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          style: { 
            backgroundColor: '#2f3542', 
            borderRadius: '16px', 
            padding: '20px',
            border: '2px solid #ff4757', 
            boxShadow: '0 10px 25px rgba(255, 71, 87, 0.4)' 
          }
        }
      );
    });

    return () => socket.disconnect();
  }, []);

  return (
    <AuthProvider>
      <FavoriteProvider>
        <CartProvider>
          <OrderProvider>
            <Router>
            {/* Cấu trúc Layout chính: Header - Main - Footer */}
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Header />

              <main style={{ flex: '1 0 auto' }}>
                <Routes>

                  {/* ── Luồng Mua sắm (Shopping Flow) ────────────────────────────── */}
                  <Route path="/" element={<NoMinglingGuard><Home /></NoMinglingGuard>} />
                  <Route path="/menu" element={<NoMinglingGuard><Menu /></NoMinglingGuard>} />
                  <Route path="/product/:id" element={<NoMinglingGuard><ProductDetail /></NoMinglingGuard>} />
                  <Route path="/restaurant/:id" element={<NoMinglingGuard><RestaurantDetail /></NoMinglingGuard>} />
                  <Route path="/cart" element={<NoMinglingGuard><Cart /></NoMinglingGuard>} />
                  <Route path="/orders" element={
                    <ProtectedRoute>
                      <NoMinglingGuard><Orders /></NoMinglingGuard>
                    </ProtectedRoute>
                  } />
                  <Route path="/favorites" element={
                    <ProtectedRoute>
                      <NoMinglingGuard><Favorites /></NoMinglingGuard>
                    </ProtectedRoute>
                  } />
                  <Route path="/checkout" element={<NoMinglingGuard><Checkout /></NoMinglingGuard>} />
                  <Route path="/payment/momo/return" element={<MoMoReturn />} />

                  {/* ── Luồng Xác thực (Auth Flow) ────────────────────────────────── */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />

                  {/* ── Luồng Quản trị/Phân quyền (Management Flow) ─────────────── */}
                  <Route path="/admin" element={
                    <RoleRoute allowedRoles={['Admin']}>
                      <AdminLayout />
                    </RoleRoute>
                  }>
                    <Route index element={<Dashboard />} />
                    <Route path="users" element={<Users />} />
                    <Route path="restaurants" element={<Restaurants />} />
                    <Route path="categories" element={<Categories />} />
                    <Route path="locations" element={<AdminLocations />} />
                    <Route path="banners" element={<AdminBanners />} />
                    <Route path="finances" element={<AdminFinances />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="vouchers" element={<AdminVouchers />} />
                  </Route>
                  <Route path="/merchant" element={
                    <RoleRoute allowedRoles={['Merchant']}>
                      <MerchantLayout />
                    </RoleRoute>
                  }>
                    <Route index element={<MerchantDashboard />} />
                    <Route path="orders" element={<MerchantOrders />} />
                    <Route path="products" element={<MerchantProducts />} />
                    <Route path="store" element={<MerchantStore />} />
                    <Route path="stats" element={<MerchantStats />} />
                    <Route path="reviews" element={<MerchantReviews />} />
                  </Route>

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
          </OrderProvider>
        </CartProvider>
      </FavoriteProvider>
    </AuthProvider>
  );
}

export default App;
