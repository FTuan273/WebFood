import React, { useEffect, useState } from 'react';
import { ShoppingBag, TrendingUp, UtensilsCrossed, CheckCircle, XCircle, Clock } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';

const MerchantStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get('/merchant/stats')
      .then(res => setStats(res.data.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 20, color: '#888' }}>Đang tải...</div>;
  if (!stats)  return <div style={{ padding: 20, color: '#e74c3c' }}>Không thể tải thống kê</div>;

  // Tìm max doanh thu để vẽ bar chart tỉ lệ
  const maxRevenue = Math.max(...stats.last7.map(d => d.revenue), 1);

  return (
    <div>
      <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1a1a2e', marginBottom: 8 }}>Thống kê</h2>
      <p style={{ color: '#888', marginBottom: 28 }}>Tổng quan hoạt động quán của bạn</p>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <Card label="Doanh thu"          value={stats.totalRevenue.toLocaleString('vi-VN') + '₫'} icon={<TrendingUp size={24}/>}    color="linear-gradient(135deg,#e94560,#c0392b)" />
        <Card label="Tổng đơn"           value={stats.totalOrders}   icon={<ShoppingBag size={24}/>}   color="linear-gradient(135deg,#0f3460,#533483)" />
        <Card label="Đã hoàn thành"      value={stats.completed}     icon={<CheckCircle size={24}/>}   color="linear-gradient(135deg,#16a085,#1abc9c)" />
        <Card label="Chờ xác nhận"       value={stats.pending}       icon={<Clock size={24}/>}         color="linear-gradient(135deg,#f39c12,#e67e22)" />
        <Card label="Đã huỷ"             value={stats.cancelled}     icon={<XCircle size={24}/>}       color="linear-gradient(135deg,#7f8c8d,#95a5a6)" />
        <Card label="Số món trong menu"  value={stats.totalProducts} icon={<UtensilsCrossed size={24}/>} color="linear-gradient(135deg,#8e44ad,#9b59b6)" />
      </div>

      {/* Bar chart doanh thu 7 ngày */}
      <div style={{ background: 'white', borderRadius: 14, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <h3 style={{ margin: '0 0 20px', color: '#1a1a2e', fontWeight: 700 }}>📊 Doanh thu 7 ngày gần nhất</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 180 }}>
          {stats.last7.map((day, i) => {
            const pct = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                {/* Tooltip doanh thu */}
                {day.revenue > 0 && (
                  <div style={{ fontSize: '0.7rem', color: '#888', marginBottom: 4, textAlign: 'center' }}>
                    {(day.revenue / 1000).toFixed(0)}k
                  </div>
                )}
                {/* Bar */}
                <div style={{
                  width: '100%', borderRadius: '6px 6px 0 0',
                  height: `${Math.max(pct, 2)}%`,
                  background: day.revenue > 0 ? 'linear-gradient(180deg,#e94560,#c0392b)' : '#f0f0f0',
                  transition: 'height 0.5s ease'
                }} />
                <div style={{ fontSize: '0.72rem', color: '#888', marginTop: 6, textAlign: 'center' }}>{day.date}</div>
                <div style={{ fontSize: '0.7rem', color: '#aaa' }}>{day.orders} đơn</div>
              </div>
            );
          })}
        </div>

        {stats.last7.every(d => d.revenue === 0) && (
          <div style={{ textAlign: 'center', color: '#bbb', marginTop: 16, fontSize: '0.9rem' }}>
            Chưa có đơn hoàn thành nào trong 7 ngày qua
          </div>
        )}
      </div>
    </div>
  );
};

const Card = ({ label, value, icon, color }) => (
  <div style={{ background: color, borderRadius: 14, padding: '18px 20px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <div>
      <div style={{ fontSize: '0.8rem', opacity: 0.85, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{value}</div>
    </div>
    <div style={{ background: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: '50%' }}>{icon}</div>
  </div>
);

export default MerchantStats;
