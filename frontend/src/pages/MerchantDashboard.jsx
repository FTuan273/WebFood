import React, { useEffect, useState } from 'react';
import { Store, UtensilsCrossed, CheckCircle, Clock } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../context/AuthContext';

const MerchantDashboard = () => {
  const { user }                    = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    axiosInstance.get('/merchant/restaurant').then(res => setRestaurant(res.data.restaurant)).catch(() => {});
    axiosInstance.get('/merchant/products').then(res => setProductCount(res.data.products.length)).catch(() => {});
  }, []);

  const statusLabel = { pending: '⏳ Chờ duyệt', approved: '✅ Đã duyệt', rejected: '❌ Bị từ chối', locked: '🔒 Bị khoá' };

  return (
    <div>
      <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '8px', color: '#1a1a2e' }}>
        Xin chào, {user?.firstName} 👋
      </h2>
      <p style={{ color: '#888', marginBottom: '28px' }}>Tổng quan hoạt động quán của bạn</p>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <StatCard label="Tên quán" value={restaurant?.name || '—'} icon={<Store size={26} />} color="linear-gradient(135deg,#e94560,#f0a500)" />
        <StatCard label="Số món" value={productCount} icon={<UtensilsCrossed size={26} />} color="linear-gradient(135deg,#0f3460,#533483)" />
        <StatCard label="Trạng thái quán" value={statusLabel[restaurant?.status] || '—'} icon={<CheckCircle size={26} />} color="linear-gradient(135deg,#16213e,#0f3460)" />
      </div>

      {/* Restaurant Info */}
      {restaurant && (
        <div style={{ background: 'white', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h3 style={{ marginBottom: '16px', color: '#1a1a2e', fontWeight: 600 }}>📋 Thông tin quán</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            {[
              ['Tên quán', restaurant.name],
              ['Địa chỉ', restaurant.address],
              ['Giờ mở cửa', restaurant.openingHours],
              ['Mô tả', restaurant.description || '(Chưa có)'],
            ].map(([label, value]) => (
              <tr key={label} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '12px 8px', color: '#888', width: '140px', fontSize: '0.9rem' }}>{label}</td>
                <td style={{ padding: '12px 8px', color: '#333', fontWeight: 500 }}>{value}</td>
              </tr>
            ))}
          </table>
        </div>
      )}

      {!restaurant && (
        <div style={{ background: '#fff8e1', border: '1px solid #ffe082', borderRadius: '12px', padding: '20px', color: '#e65100' }}>
          ⚠️ Quán của bạn chưa được tạo hoặc chưa được Admin phê duyệt.
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, icon, color }) => (
  <div style={{ background: color, borderRadius: '14px', padding: '22px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <div>
      <div style={{ fontSize: '0.8rem', opacity: 0.85, marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{value}</div>
    </div>
    <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '50%' }}>{icon}</div>
  </div>
);

export default MerchantDashboard;
