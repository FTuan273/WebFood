// [THÊM MỚI] Giao diện Đặt lại Mật khẩu thông qua mã bí mật từ Email
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../context/AuthContext';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error('Mật khẩu nhập lại không khớp!');
    }
    
    setLoading(true);
    try {
      // Gọi API reset password trên BE
      const { data } = await axiosInstance.put(`/auth/resetpassword/${token}`, { password });
      
      if (data.success) {
        toast.success('Đổi mật khẩu thành công! Bạn đã được đăng nhập.');
        // Lưu trữ phiên đăng nhập mới theo Controller
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Trở về trang chủ và Reload để Context cập nhật (Cách nhanh nhất cho Auth Reset)
        window.location.href = '/';
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Link khôi phục không hợp lệ hoặc đã hết hạn!');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-breadcrumb-area">
        <div className="container">
          <div className="breadcrumb text-center">
            <Link to="/">Trang chủ</Link> <span>/</span> <strong>Đặt mật khẩu mới</strong>
          </div>
        </div>
      </div>

      <div className="auth-container">
        <div className="auth-card">
          <h2 className="auth-title">Đổi mật khẩu</h2>
          <p style={{ textAlign: 'center', fontSize: '14px', marginBottom: '30px', color: 'var(--text-muted)' }}>
            Vui lòng tạo mật khẩu mới (ít nhất 6 ký tự) để tiếp tục mua sắm.
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className="auth-form-group">
              <input 
                type="password" 
                className="auth-form-control"
                placeholder="Mật khẩu mới" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                minLength="6"
              />
            </div>

            <div className="auth-form-group">
              <input 
                type="password" 
                className="auth-form-control"
                placeholder="Nhập lại mật khẩu mới" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required 
                minLength="6"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-auth-submit" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'XÁC NHẬN'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
