import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Store, ShoppingBag, Clock, CheckCircle } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/api/admin/stats')
      .then(res => {
        setStats(res.data.stats);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>Đang tải dữ liệu...</div>;
  if (!stats) return <div style={{ padding: '20px' }}>Không thể kết nối Backend. Hãy chắc chắn Backend đang chạy cổng 5000.</div>;

  return (
    <div>
      <h2 style={{ fontSize: '2rem', marginBottom: '30px', color: '#2f3542' }}>Tổng Quan Hệ Thống</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', marginBottom: '40px' }}>
        <StatCard title="Tổng Người Dùng" value={stats.totalUsers} icon={<Users size={30} />} color="linear-gradient(135deg, #6c5ce7, #a29bfe)" />
        <StatCard title="Tổng Cửa Hàng" value={stats.totalRestaurants.total} icon={<Store size={30} />} color="linear-gradient(135deg, #0984e3, #74b9ff)" />
        <StatCard title="Tổng Đơn Hàng" value={stats.totalOrders} icon={<ShoppingBag size={30} />} color="linear-gradient(135deg, #00b894, #55efc4)" />
      </div>

      <div style={{ display: 'flex', gap: '25px' }}>
        <div style={{ flex: 1, backgroundColor: '#fff', borderRadius: '15px', padding: '25px', boxShadow: '0 8px 30px rgba(0,0,0,0.05)', border: '1px solid #f1f2f6' }}>
          <h3 style={{ marginBottom: '20px', color: '#2f3542', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Store size={22} color="#ff4757" />
            Tình trạng Quán ăn (Dành cho Merchant)
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '3.5rem', fontWeight: 'bold', color: '#f39c12' }}>{stats.totalRestaurants.pending}</div>
              <div style={{ color: '#7f8c8d', display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center' }}>
                <Clock size={16} /> Đang chờ duyệt
              </div>
            </div>
            <div>
              <div style={{ fontSize: '3.5rem', fontWeight: 'bold', color: '#2ed573' }}>{stats.totalRestaurants.approved}</div>
              <div style={{ color: '#7f8c8d', display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center' }}>
                <CheckCircle size={16} /> Đã phê duyệt
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div style={{ 
    background: color, 
    borderRadius: '16px', 
    padding: '25px', 
    color: 'white', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s ease',
    cursor: 'pointer'
  }}
  onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
  onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
  >
    <div>
      <div style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '10px' }}>{title}</div>
      <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{value}</div>
    </div>
    <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '15px', borderRadius: '50%' }}>
      {icon}
    </div>
  </div>
);

export default Dashboard;
