/**
 * @file Login.jsx
 * @description Trang Đăng nhập tài khoản.
 * 
 * Tính năng:
 *   - Form nhập Email và Mật khẩu.
 *   - Xử lý Đăng nhập thông qua AuthContext.
 *   - Điều hướng (Redirect) thông minh dựa trên Vai trò (Role):
 *     + Admin -> /admin/dashboard
 *     + Merchant -> /merchant/dashboard
 *     + Customer -> /
 *   - Hiển thị thông báo Toast thành công/thất bại.
 *
 * @author WebFood Team
 * @version 2.0.0
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  // ─── States & Hooks ────────────────────────────────────────────────────────
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate  = useNavigate();

  /**
   * Xử lý gửi Form đăng nhập.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Gọi hàm login từ AuthContext
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      toast.success('Đăng nhập thành công! Chào mừng bạn quay lại.');
      
      // Lấy thông tin user vừa đăng nhập để điều hướng
      const loggedUser = JSON.parse(localStorage.getItem('user'));
      
      // ĐIỀU HƯỚNG THÔNG MINH THEO ROLE:
      if (loggedUser?.role === 'Admin') {
        toast.info('Hệ thống nhận diện quyền Quản trị (Admin).', { autoClose: 3000 });
        navigate('/admin/dashboard');
      } 
      else if (loggedUser?.role === 'Merchant') {
        toast.info('Hệ thống nhận diện quyền Chủ quán (Merchant).', { autoClose: 3000 });
        navigate('/merchant/dashboard');
      } 
      else {
        // Mặc định cho Khách hàng (Customer)
        navigate('/');
      }
    } else {
      // Hiển thị lỗi từ Server (Email sai, Pass sai, v.v.)
      toast.error(result.message);
    }
  };

  return (
    <div className="auth-page-wrapper">
      {/* Thanh điều hướng nhanh (Breadcrumb) */}
      <div className="auth-breadcrumb-area">
        <div className="container">
          <div className="breadcrumb text-center">
            <Link to="/">Trang chủ</Link> <span>/</span> <strong>Đăng nhập tài khoản</strong>
          </div>
        </div>
      </div>
      
      <div className="auth-container">
        <div className="auth-card">
          {/* Tabs chuyển đổi giữa Đăng nhập và Đăng ký */}
          <div className="auth-tabs">
            <div className="auth-tab active">Đăng nhập</div>
            <Link to="/register" className="auth-tab">Đăng ký</Link>
          </div>

          <h2 className="auth-title">Chào mừng trở lại</h2>
          <p className="auth-subtitle text-center" style={{marginBottom: '20px', color: '#666'}}>
            Vui lòng nhập thông tin để tiếp tục
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className="auth-form-group">
              <label style={{fontSize: '14px', marginBottom: '5px', display: 'block'}}>Địa chỉ Email</label>
              <input 
                type="email" 
                className="auth-form-control"
                placeholder="email@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            
            <div className="auth-form-group">
              <label style={{fontSize: '14px', marginBottom: '5px', display: 'block'}}>Mật khẩu</label>
              <input 
                type="password" 
                className="auth-form-control"
                placeholder="********" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>

            <button type="submit" className="btn btn-primary btn-auth-submit" disabled={loading}>
              {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG NHẬP NGAY'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <Link to="/forgot-password" style={{ fontSize: '14px', color: 'var(--text-muted)', textDecoration: 'none' }}>
                Bạn quên mật khẩu? <strong>Khôi phục tại đây</strong>
              </Link>
            </div>
          </form>

          {/* Các phương thức đăng nhập MXH (Placeholder) */}
          <div className="social-login">
            <div className="social-title">
              <span>Hoặc đăng nhập nhanh bằng</span>
            </div>
            <div className="social-btns">
              <button className="btn-social btn-fb">Facebook</button>
              <button className="btn-social btn-google">Google</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
