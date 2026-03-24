import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
// import { Facebook } from 'lucide-react';
const Facebook = () => null; // Placeholder

const Register = () => {
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    email: '',
    phoneNumber: '',
    password: '',
    role: 'Customer',
    // [THÊM MỚI] Thông tin Merchant
    storeName: '',
    cuisineType: '',
    storeAddress: '',
    storePhone: '',
    openingTime: '',
    closingTime: '',
    bankAccount: '',
    bankName: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Clean code: Chỉ gửi thông tin Merchant nếu role là Merchant
    const dataToSubmit = { ...formData };
    if (formData.role !== 'Merchant') {
      delete dataToSubmit.storeName;
      delete dataToSubmit.cuisineType;
      delete dataToSubmit.storeAddress;
      delete dataToSubmit.storePhone;
      delete dataToSubmit.openingTime;
      delete dataToSubmit.closingTime;
      delete dataToSubmit.bankAccount;
      delete dataToSubmit.bankName;
    }

    const result = await register(dataToSubmit);
    
    if (result.success) {
      toast.success('Đăng ký thành công!');
      navigate('/');
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-breadcrumb-area">
        <div className="container">
          <div className="breadcrumb text-center">
            <Link to="/">Trang chủ</Link> <span>/</span> <strong>Đăng ký tài khoản</strong>
          </div>
        </div>
      </div>

      <div className="auth-container">
        <div className="auth-card" style={{ maxWidth: formData.role === 'Merchant' ? '800px' : '500px' }}>
          <div className="auth-tabs">
            <Link to="/login" className="auth-tab">Đăng nhập</Link>
            <div className="auth-tab active">Đăng ký</div>
          </div>

          <h2 className="auth-title">Đăng ký {formData.role === 'Merchant' ? 'Đối tác' : 'Thành viên'}</h2>
          
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: formData.role === 'Merchant' ? '1fr 1fr' : '1fr', gap: '20px' }}>
              
              {/* CỘT 1: THÔNG TIN CÁ NHÂN */}
              <div className="personal-info-section">
                <h4 style={{ marginBottom: '15px', color: 'var(--primary)', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
                  Thông tin cá nhân
                </h4>
                <div className="auth-form-group">
                  <input type="text" name="lastName" className="auth-form-control" placeholder="Họ của bạn" value={formData.lastName} onChange={handleChange} required />
                </div>
                <div className="auth-form-group">
                  <input type="text" name="firstName" className="auth-form-control" placeholder="Tên của bạn" value={formData.firstName} onChange={handleChange} required />
                </div>
                <div className="auth-form-group">
                  <input type="email" name="email" className="auth-form-control" placeholder="Email đăng nhập" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="auth-form-group">
                  <input type="tel" name="phoneNumber" className="auth-form-control" placeholder="Số điện thoại cá nhân" value={formData.phoneNumber} onChange={handleChange} required />
                </div>
                <div className="auth-form-group">
                  <input type="password" name="password" className="auth-form-control" placeholder="Mật khẩu" value={formData.password} onChange={handleChange} required />
                </div>
                <div className="auth-form-group">
                  <label style={{ fontSize: '13px', display: 'block', marginBottom: '5px', color: '#666' }}>Vai trò đăng ký</label>
                  <select name="role" className="auth-form-control" value={formData.role} onChange={handleChange} style={{ backgroundColor: 'white' }}>
                    <option value="Customer">Khách hàng (Người mua)</option>
                    <option value="Merchant">Chủ quán (Đối tác bán hàng)</option>
                    <option value="Admin">Quản trị viên (Admin)</option>
                  </select>
                </div>
              </div>

              {/* CỘT 2: THÔNG TIN CỬA HÀNG (Chỉ hiện cho Merchant) */}
              {formData.role === 'Merchant' && (
                <div className="merchant-info-section">
                  <h4 style={{ marginBottom: '15px', color: 'var(--primary)', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
                    Hồ sơ Cửa hàng & Tài chính
                  </h4>
                  <div className="auth-form-group">
                    <input type="text" name="storeName" className="auth-form-control" placeholder="Tên quán ăn" value={formData.storeName} onChange={handleChange} required />
                  </div>
                  <div className="auth-form-group">
                    <input type="text" name="cuisineType" className="auth-form-control" placeholder="Loại hình (Cơm, Phở, Trà sữa...)" value={formData.cuisineType} onChange={handleChange} required />
                  </div>
                  <div className="auth-form-group">
                    <input type="text" name="storeAddress" className="auth-form-control" placeholder="Địa chỉ kinh doanh" value={formData.storeAddress} onChange={handleChange} required />
                  </div>
                  <div className="auth-form-group">
                    <input type="tel" name="storePhone" className="auth-form-control" placeholder="SĐT quán chuyên nhận đơn" value={formData.storePhone} onChange={handleChange} required />
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div className="auth-form-group" style={{ flex: 1 }}>
                      <label style={{ fontSize: '12px' }}>Giờ mở cửa</label>
                      <input type="time" name="openingTime" className="auth-form-control" value={formData.openingTime} onChange={handleChange} required />
                    </div>
                    <div className="auth-form-group" style={{ flex: 1 }}>
                      <label style={{ fontSize: '12px' }}>Giờ đóng cửa</label>
                      <input type="time" name="closingTime" className="auth-form-control" value={formData.closingTime} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="auth-form-group">
                    <input type="text" name="bankName" className="auth-form-control" placeholder="Tên Ngân hàng (Để nhận doanh thu)" value={formData.bankName} onChange={handleChange} required />
                  </div>
                  <div className="auth-form-group">
                    <input type="text" name="bankAccount" className="auth-form-control" placeholder="Số tài khoản Ngân hàng" value={formData.bankAccount} onChange={handleChange} required />
                  </div>
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary btn-auth-submit" disabled={loading} style={{ marginTop: '10px' }}>
              {loading ? 'ĐANG KHỞI TẠO...' : 'HOÀN TẤT ĐĂNG KÝ'}
            </button>
          </form>

          <div className="social-login">
            <div className="social-title">
              <span>Hoặc đăng nhập bằng</span>
            </div>
            <div className="social-btns">
              <button className="btn-social btn-fb">
                <Facebook size={18} /> Facebook
              </button>
              <button className="btn-social btn-google">
                <img src="https://www.google.com/favicon.ico" width="16" height="16" alt="G" /> Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
