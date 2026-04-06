import React, { useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import { Store, UtensilsCrossed, CheckCircle, Clock } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../context/AuthContext';

const MerchantDashboard = () => {
  const socketRef = useRef(null);
  const { user } = useAuth();
  
  // State from HEAD (Realtime & Orders)
  const [orders, setOrders] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [latestOrderNotification, setLatestOrderNotification] = useState(null);
  const [merchantId, setMerchantId] = useState(() => {
    return localStorage.getItem('merchantId') || user?.restaurantId || user?._id || 'MERCHANT_123';
  });

  // State from feature/bao-merchant (Restaurant info)
  const [restaurant, setRestaurant] = useState(null);
  const [productCount, setProductCount] = useState(0);

  // Sync merchantId when user context changes
  useEffect(() => {
    const foundMerchantId = localStorage.getItem('merchantId') || user?.restaurantId || user?._id || 'MERCHANT_123';
    setMerchantId(foundMerchantId);
    localStorage.setItem('merchantId', foundMerchantId);
  }, [user]);

  // --- Logic Statistics & Revenue (HEAD) ---
  const normalizeRevenueData = useCallback((rawData, fromDate, toDate) => {
    const mapByDate = rawData.reduce((acc, item) => {
      acc[item.date] = item.totalRevenue;
      return acc;
    }, {});

    const days = [];
    const current = new Date(fromDate);
    while (current <= toDate) {
      const key = current.toISOString().slice(0, 10);
      days.push({
        date: key,
        totalRevenue: mapByDate[key] || 0
      });
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, []);

  const fetchRevenueStats = useCallback(async () => {
    if (!merchantId) return;
    setRevenueLoading(true);
    try {
      const to = new Date();
      const from = new Date();
      from.setDate(to.getDate() - 6); // Last 7 days

      const response = await axiosInstance.get(`/orders/revenue`, {
        params: {
          merchantId,
          from: from.toISOString(),
          to: to.toISOString()
        }
      });
      setRevenueData(normalizeRevenueData(response.data, from, to));
    } catch (error) {
      console.error('Lỗi lấy thống kê doanh thu:', error);
      toast.error('Không thể tải biểu đồ doanh thu hiện tại.');
      setRevenueData([]);
    } finally {
      setRevenueLoading(false);
    }
  }, [merchantId, normalizeRevenueData]);

  const fetchOrders = useCallback(async () => {
    if (!merchantId) return;
    try {
      const response = await axiosInstance.get(`/orders?merchantId=${merchantId}`);
      setOrders(response.data);
    } catch (error) {
      console.error("Lỗi lấy danh sách đơn:", error);
      toast.error('Không thể tải danh sách đơn hàng, vui lòng làm mới trang.');
    }
  }, [merchantId]);

  // --- Logic Fetch Restaurant Info (feature/bao-merchant) ---
  useEffect(() => {
    axiosInstance.get('/merchant/restaurant')
      .then(res => setRestaurant(res.data.restaurant))
      .catch(() => {});
    
    axiosInstance.get('/merchant/products')
      .then(res => setProductCount(res.data.products.length))
      .catch(() => {});
  }, []);

  // --- Logic Realtime (HEAD) ---
  useEffect(() => {
    if (!merchantId) return;

    const socket = io('http://localhost:5000', { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected to server:', socket.id);
      socket.emit('join-merchant-room', merchantId);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connect_error:', err);
      toast.error('Không thể kết nối realtime. Vui lòng thử lại.');
    });

    socket.on('new-order-received', (data) => {
      console.log('Nhận đơn mới:', data);
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(() => console.log('Trình duyệt chặn tự động phát nhạc'));

      const sender = data.customerName || 'khách hàng';
      const amountValue = data.amount ? Number(data.amount) : null;
      const amountText = amountValue ? `${amountValue.toLocaleString()}đ` : 'chưa rõ';
      const orderId = data.orderId ? `#${data.orderId.slice(-6)}` : 'Chưa có mã';

      toast.info(`Đơn mới ${orderId} từ ${sender} - ${amountText}`);

      setLatestOrderNotification({
        orderId,
        customerName: sender,
        amountText,
        message: data.message || `Có đơn hàng mới từ ${sender}`,
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date()
      });

      fetchOrders();
      fetchRevenueStats();
    });

    fetchOrders();
    fetchRevenueStats();

    return () => {
      socket.off('new-order-received');
      socket.off('connect_error');
      socket.off('connect');
      socket.emit('leave-merchant-room', merchantId);
      socket.disconnect();
    };
  }, [merchantId, fetchOrders, fetchRevenueStats]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await axiosInstance.put(`/orders/${orderId}/status`, {
        status: newStatus
      });
      if (response.status === 200) {
        toast.success(`Trạng thái: ${newStatus}`);
        fetchOrders();
        fetchRevenueStats();
      }
    } catch (error) {
      console.error('Lỗi update status:', error);
      toast.error("Lỗi cập nhật trạng thái");
    }
  };

  const getStatusText = (status) => {
    const map = {
      'pending': 'Chờ nhận',
      'confirmed': 'Đã xác nhận',
      'preparing': 'Đang chuẩn bị',
      'delivering': 'Đang giao',
      'completed': 'Hoàn tất',
      'cancelled': 'Đã huỷ'
    };
    return map[status] || status;
  };

  const statusLabel = { 
    pending: '⏳ Chờ duyệt', 
    approved: '✅ Đã duyệt', 
    rejected: '❌ Bị từ chối', 
    locked: '🔒 Bị khoá' 
  };

  const maxRevenue = revenueData.reduce((max, item) => Math.max(max, item.totalRevenue), 0);

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '8px', color: '#1a1a2e' }}>
        Xin chào, {user?.firstName} 👋
      </h2>
      <p style={{ color: '#888', marginBottom: '28px' }}>Tổng quan hoạt động quán của bạn</p>

      {/* Stat Cards (feature/bao-merchant) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <StatCard label="Tên quán" value={restaurant?.name || '—'} icon={<Store size={26} />} color="linear-gradient(135deg,#e94560,#f0a500)" />
        <StatCard label="Số món" value={productCount} icon={<UtensilsCrossed size={26} />} color="linear-gradient(135deg,#0f3460,#533483)" />
        <StatCard label="Trạng thái quán" value={statusLabel[restaurant?.status] || '—'} icon={<CheckCircle size={26} />} color="linear-gradient(135deg,#16213e,#0f3460)" />
      </div>

      {/* Biểu đồ doanh thu (HEAD) */}
      <section style={{ background: 'white', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '16px', color: '#1a1a2e', fontWeight: 600 }}>📊 Biểu đồ doanh thu 7 ngày</h3>
        {revenueLoading ? (
          <p>Đang tải thống kê...</p>
        ) : revenueData.length === 0 ? (
          <p>Chưa có dữ liệu doanh thu</p>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 220, padding: '8px 0' }}>
            {revenueData.map((item) => {
              const barHeight = maxRevenue > 0 ? (item.totalRevenue / maxRevenue) * 170 : 0;
              return (
                <div key={item.date} style={{ textAlign: 'center', flex: 1 }}>
                  <div
                    title={`${item.date}: ${item.totalRevenue.toLocaleString()}đ`}
                    style={{
                      height: barHeight,
                      background: 'linear-gradient(to top, #3f51b5, #5c6bc0)',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.3s ease'
                    }}
                  />
                  <div style={{ marginTop: 8, fontSize: 12 }}>{item.date.slice(5)}</div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Thông báo đơn hàng mới (HEAD) */}
      {latestOrderNotification && (
        <div style={{ border: '2px solid #ff9800', background: '#fff8e1', padding: '16px', marginBottom: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>🔔</span>
            <span style={{ fontWeight: 700, color: '#e65100' }}>Thông báo đơn mới</span>
          </div>
          <p style={{ margin: '4px 0' }}><strong>Mã đơn:</strong> {latestOrderNotification.orderId}</p>
          <p style={{ margin: '4px 0' }}><strong>Khách hàng:</strong> {latestOrderNotification.customerName}</p>
          <p style={{ margin: '4px 0' }}><strong>Tổng tiền:</strong> {latestOrderNotification.amountText}</p>
          <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>Thời gian: {latestOrderNotification.timestamp.toLocaleString()}</p>
        </div>
      )}

      {/* Quản lý đơn hàng (HEAD) */}
      <section style={{ background: 'white', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '16px', color: '#1a1a2e', fontWeight: 600 }}>📦 Đơn hàng đang xử lý</h3>
        <div className="order-list">
          {orders.length === 0 ? (
            <p style={{ color: '#888' }}>Chưa có đơn hàng nào.</p>
          ) : (
            orders.map((order) => (
              <div key={order._id} style={{ border: '1px solid #f0f0f0', padding: '20px', marginBottom: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: '0 0 8px 0', fontWeight: 600 }}>Mã đơn: #{order._id.slice(-6)}</p>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem' }}><strong>Khách hàng:</strong> {order.customerName || 'N/A'}</p>
                  <p style={{ margin: '0', fontSize: '0.9rem' }}>
                    <strong>Trạng thái:</strong> 
                    <span style={{ color: order.status === 'completed' ? '#28a745' : '#ff9800', marginLeft: '6px', fontWeight: 600 }}>
                      {getStatusText(order.status)}
                    </span>
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {order.status === 'pending' && (
                    <button 
                      onClick={() => handleUpdateStatus(order._id, 'preparing')} 
                      style={{ background: '#007bff', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      Chấp nhận đơn
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button 
                      onClick={() => handleUpdateStatus(order._id, 'delivering')} 
                      style={{ background: '#ffc107', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      Đang giao
                    </button>
                  )}
                  {order.status === 'delivering' && (
                    <button 
                      onClick={() => handleUpdateStatus(order._id, 'completed')} 
                      style={{ background: '#28a745', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      Hoàn tất
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Thông tin quán (feature/bao-merchant) */}
      {restaurant && (
        <div style={{ background: 'white', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h3 style={{ marginBottom: '16px', color: '#1a1a2e', fontWeight: 600 }}>📋 Thông tin quán</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
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
            </tbody>
          </table>
        </div>
      )}

      {!restaurant && (
        <div style={{ background: '#fff8e1', border: '1px solid #ffe082', borderRadius: '12px', padding: '20px', color: '#e65100', marginTop: '20px' }}>
          ⚠️ Quán của bạn chưa được tạo hoặc chưa được Admin phê duyệt.
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, icon, color }) => (
  <div style={{ background: color, borderRadius: '14px', padding: '22px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
    <div>
      <div style={{ fontSize: '0.8rem', opacity: 0.85, marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{value}</div>
    </div>
    <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '50%' }}>{icon}</div>
  </div>
);

export default MerchantDashboard;
