import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../utils/axiosInstance';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axiosInstance.post('/auth/forgot-password', { email });
      if (data.success) {
        toast.info(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-breadcrumb-area">
        <div className="container">
          <div className="breadcrumb text-center">
            <Link to="/">Trang chủ</Link> <span>/</span> <strong>Quên mật khẩu</strong>
          </div>
        </div>
      </div>

      <div className="auth-container">
        <div className="auth-card">
          <h2 className="auth-title">Khôi phục mật khẩu</h2>
          <p style={{ textAlign: 'center', fontSize: '14px', marginBottom: '20px', color: 'var(--text-muted)' }}>
            Nhập email của bạn và chúng tôi sẽ gửi đường dẫn khôi phục mật khẩu.
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className="auth-form-group">
              <input 
                type="email" 
                className="auth-form-control"
                placeholder="Email của bạn" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>

            <button type="submit" className="btn btn-primary btn-auth-submit" disabled={loading}>
              {loading ? 'Đang gửi...' : 'GỬI YÊU CẦU'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <Link to="/login" style={{ fontSize: '14px', color: 'var(--text-muted)', textDecoration: 'underline' }}>
                Quay lại đăng nhập
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
