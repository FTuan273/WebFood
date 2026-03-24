// [THÊM MỚI] Component Trang cá nhân
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { User, LogOut, Check } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile, logout } = useAuth();
  
  // Lấy dữ liệu profile từ context
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phoneNumber: user?.phoneNumber || '',
    address: user?.address || '',
    profilePicture: user?.profilePicture || '',
    // [THÊM MỚI] Thông tin Merchant
    storeName: user?.storeName || '',
    cuisineType: user?.cuisineType || '',
    storeAddress: user?.storeAddress || '',
    storePhone: user?.storePhone || '',
    openingTime: user?.openingTime || '',
    closingTime: user?.closingTime || '',
    bankAccount: user?.bankAccount || '',
    bankName: user?.bankName || '',
    // Field ảo để handle nâng cấp
    role: user?.role || 'Customer'
  });
  const [loading, setLoading] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false); // [THÊM MỚI] Trạng thái đang chuyển đổi sang Merchant

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Nếu đang nhấn Upgrade, gán role mới để gửi lên backend
    const dataToSubmit = { ...formData };
    if (isUpgrading) {
      dataToSubmit.role = 'Merchant';
    }

    const result = await updateProfile(dataToSubmit);
    setLoading(false);
    
    if (result.success) {
      toast.success(isUpgrading ? 'Chúc mừng! Bạn đã trở thành Đối tác của FoodOnline.' : 'Cập nhật thông tin thành công!');
      setIsUpgrading(false);
      // Nếu là nâng cấp, có thể cần redirect hoặc reload nhẹ để UI cập nhật role mới
      if (isUpgrading) {
        setTimeout(() => window.location.reload(), 1500);
      }
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 0', minHeight: '60vh' }}>
      <div style={{ maxWidth: (user?.role === 'Merchant' || isUpgrading) ? '900px' : '600px', margin: '0 auto', backgroundColor: 'white', borderRadius: '12px', padding: '30px', boxShadow: 'var(--shadow-sm)', transition: '0.3s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', borderBottom: '1px solid var(--border)', paddingBottom: '20px' }}>
          {user?.profilePicture ? (
            <img src={user.profilePicture} alt="Avatar" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }} />
          ) : (
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
              {user?.firstName?.charAt(0) || 'U'}
            </div>
          )}
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 5px 0' }}>
              {isUpgrading ? 'Nâng cấp Đối tác' : (user?.role === 'Merchant' ? 'Hồ sơ Đối tác' : 'Hồ sơ Cá nhân')}
            </h1>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>
              {isUpgrading ? 'Vui lòng cung cấp thông tin quán ăn của bạn' : 'Quản lý thông tin xác thực và cửa hàng của bạn'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: (user?.role === 'Merchant' || isUpgrading) ? '1fr 1fr' : '1fr', gap: '40px' }}>
            
            {/* CỘT 1: THÔNG TIN CÁ NHÂN */}
            <div>
              <h4 style={{ marginBottom: '20px', color: 'var(--primary)', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>1. Thông tin tài khoản</h4>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Vai trò</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{ flex: 1, padding: '10px 15px', backgroundColor: '#f9f9f9', borderRadius: '6px', color: '#444', fontWeight: 600, border: '1px solid #eee' }}>
                    {isUpgrading ? 'Đang chuyển: Merchant' : user?.role}
                  </div>
                  
                  {/* LUỒNG NÂNG CẤP DÀNH CHO CUSTOMER */}
                  {user?.role === 'Customer' && !isUpgrading && !user?.isMerchantPending && (
                    <button 
                      type="button" 
                      onClick={() => setIsUpgrading(true)}
                      style={{ padding: '10px 15px', backgroundColor: '#fff7e6', color: '#fa8c16', border: '1px solid #ffd591', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}
                    >
                      Đăng ký làm đối tác
                    </button>
                  )}
                  {user?.role === 'Customer' && user?.isMerchantPending && (
                    <span style={{ padding: '10px 15px', color: '#fa8c16', backgroundColor: '#fff7e6', border: '1px solid #ffd591', borderRadius: '6px', fontSize: '13px', fontWeight: 600 }}>
                      ⏳ Đang chờ duyệt
                    </span>
                  )}
                  {isUpgrading && (
                    <button 
                      type="button" 
                      onClick={() => setIsUpgrading(false)}
                      style={{ padding: '10px 15px', backgroundColor: '#f5f5f5', color: '#666', border: '1px solid #ccc', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}
                    >
                      Hủy bỏ
                    </button>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Email (Khóa)</label>
                <div style={{ padding: '10px 15px', backgroundColor: '#f9f9f9', borderRadius: '6px', color: '#999', border: '1px solid #eee' }}>
                  {user?.email}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Họ</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} style={{ width: '100%', padding: '10px 15px', border: '1px solid var(--border)', borderRadius: '6px', outlineColor: 'var(--primary)' }} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Tên</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} style={{ width: '100%', padding: '10px 15px', border: '1px solid var(--border)', borderRadius: '6px', outlineColor: 'var(--primary)' }} required />
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Số điện thoại cá nhân</label>
                <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} style={{ width: '100%', padding: '10px 15px', border: '1px solid var(--border)', borderRadius: '6px', outlineColor: 'var(--primary)' }} required />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Địa chỉ liên hệ</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} style={{ width: '100%', padding: '10px 15px', border: '1px solid var(--border)', borderRadius: '6px', outlineColor: 'var(--primary)' }} />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>URL Ảnh đại diện</label>
                <input type="text" name="profilePicture" value={formData.profilePicture} onChange={handleChange} placeholder="https://..." style={{ width: '100%', padding: '10px 15px', border: '1px solid var(--border)', borderRadius: '6px', outlineColor: 'var(--primary)' }} />
              </div>
            </div>

            {/* CỘT 2: THÔNG TIN CỬA HÀNG (Hiện khi là Merchant HOẶC đang Upgrade) */}
            {(user?.role === 'Merchant' || isUpgrading) && (
              <div style={{ animation: isUpgrading ? 'fadeInRight 0.5s ease' : 'none' }}>
                <h4 style={{ marginBottom: '20px', color: 'var(--primary)', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>2. Hồ sơ Cửa hàng & Đối tác</h4>
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Tên quán ăn</label>
                  <input type="text" name="storeName" value={formData.storeName} onChange={handleChange} style={{ width: '100%', padding: '10px 15px', border: '1px solid var(--border)', borderRadius: '6px', outlineColor: 'var(--primary)' }} required />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Loại hình ẩm thực</label>
                  <input type="text" name="cuisineType" value={formData.cuisineType} onChange={handleChange} placeholder="VD: Cơm, Phở, Đồ ăn vặt..." style={{ width: '100%', padding: '10px 15px', border: '1px solid var(--border)', borderRadius: '6px', outlineColor: 'var(--primary)' }} required />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Địa chỉ quán ăn</label>
                  <input type="text" name="storeAddress" value={formData.storeAddress} onChange={handleChange} style={{ width: '100%', padding: '10px 15px', border: '1px solid var(--border)', borderRadius: '6px', outlineColor: 'var(--primary)' }} required />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Số điện thoại quán (Hotline)</label>
                  <input type="tel" name="storePhone" value={formData.storePhone} onChange={handleChange} style={{ width: '100%', padding: '10px 15px', border: '1px solid var(--border)', borderRadius: '6px', outlineColor: 'var(--primary)' }} required />
                </div>

                <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Giờ mở cửa</label>
                    <input type="time" name="openingTime" value={formData.openingTime} onChange={handleChange} style={{ width: '100%', padding: '10px 15px', border: '1px solid var(--border)', borderRadius: '6px', outlineColor: 'var(--primary)' }} required />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Giờ đóng cửa</label>
                    <input type="time" name="closingTime" value={formData.closingTime} onChange={handleChange} style={{ width: '100%', padding: '10px 15px', border: '1px solid var(--border)', borderRadius: '6px', outlineColor: 'var(--primary)' }} required />
                  </div>
                </div>

                <h4 style={{ marginBottom: '20px', marginTop: '30px', color: 'var(--primary)', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>3. Thông tin thanh toán</h4>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Ngân hàng</label>
                    <input type="text" name="bankName" value={formData.bankName} onChange={handleChange} placeholder="VD: Vietcombank" style={{ width: '100%', padding: '10px 15px', border: '1px solid var(--border)', borderRadius: '6px', outlineColor: 'var(--primary)' }} required />
                  </div>
                  <div style={{ flex: 2 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Số tài khoản</label>
                    <input type="text" name="bankAccount" value={formData.bankAccount} onChange={handleChange} style={{ width: '100%', padding: '10px 15px', border: '1px solid var(--border)', borderRadius: '6px', outlineColor: 'var(--primary)' }} required />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '15px', marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '12px', backgroundColor: isUpgrading ? '#fa8c16' : 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Check size={18} /> {loading ? 'ĐANG XỬ LÝ...' : (isUpgrading ? 'XÁC NHẬN ĐĂNG KÝ ĐỐI TÁC' : 'CẬP NHẬT HỒ SƠ')}
            </button>
            <button type="button" onClick={() => { logout(); window.location.href='/'; }} style={{ padding: '12px 20px', backgroundColor: '#fff', border: '1px solid #ff4d4f', color: '#ff4d4f', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' }}>
              <LogOut size={18} /> Đăng xuất
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
