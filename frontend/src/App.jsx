/**
 * @file App.jsx
 * @description Root Component - Đã tích hợp MerchantDashboard Realtime + MerchantLayout.
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
import MoMoReturn from './pages/MoMoReturn';
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

import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Restaurants from './pages/Restaurants';
import Categories from './pages/Categories';
import CustomerOrderListener from './components/CustomerOrderListener';

import MerchantLayout from './components/MerchantLayout';
import MerchantDashboard from './pages/MerchantDashboard';
import MerchantProducts from './pages/MerchantProducts';
import MerchantOrders   from './pages/MerchantOrders';
import MerchantStore    from './pages/MerchantStore';
import MerchantStats    from './pages/MerchantStats';

import './index.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          {/* Component lắng nghe realtime dành cho khách hàng */}
          <CustomerOrderListener />

          {/* Cấu trúc Layout chính: Header - Main - Footer */}
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <CartSidebar />
            
            <main style={{ flex: '1 0 auto' }}>
              <Routes>
                
                {/* ── Luồng Mua sắm (Shopping Flow) ────────────────────────────── */}
                <Route path="/" element={<NoMinglingGuard><Home /></NoMinglingGuard>} />
                <Route path="/menu" element={<NoMinglingGuard><Menu /></NoMinglingGuard>} />
                <Route path="/product/:id" element={<NoMinglingGuard><ProductDetail /></NoMinglingGuard>} />
                <Route path="/restaurant/:id" element={<NoMinglingGuard><RestaurantDetail /></NoMinglingGuard>} />
                <Route path="/checkout" element={<NoMinglingGuard><Checkout /></NoMinglingGuard>} />
                <Route path="/payment/momo/return" element={<MoMoReturn />} />
                
                {/* ── Luồng Xác thực (Auth Flow) ────────────────────────────────── */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                
                {/* ── Luồng Quản trị (Admin) ────────────────────────────────────── */}
                <Route path="/admin" element={
                  <RoleRoute allowedRoles={['Admin']}>
                    <AdminLayout />
                  </RoleRoute>
                }>
                  <Route index element={<Dashboard />} />
                  <Route path="users" element={<Users />} />
                  <Route path="restaurants" element={<Restaurants />} />
                  <Route path="categories" element={<Categories />} />
                </Route>

                {/* ── Luồng Chủ quán (Merchant) ─────────────────────────────────── */}
                <Route path="/merchant" element={
                  <RoleRoute allowedRoles={['Merchant']}>
                    <MerchantLayout />
                  </RoleRoute>
                }>
                  <Route index element={<MerchantDashboard />} />
                  <Route path="orders"   element={<MerchantOrders />} />
                  <Route path="products" element={<MerchantProducts />} />
                  <Route path="store"    element={<MerchantStore />} />
                  <Route path="stats"    element={<MerchantStats />} />
                </Route>

                {/* ── Trang Hồ sơ cá nhân ───────────────────────────────────────── */}
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Xử lý Route không tồn tại */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>

            <Footer />
          </div>

          <ToastContainer 
            position="bottom-right" 
            theme="colored" 
            autoClose={3000} 
            hideProgressBar={false}
            newestOnTop={true}
            pauseOnFocusLoss={true}
            draggable={true}
            pauseOnHover={true}
            closeOnClick={true}
          />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;