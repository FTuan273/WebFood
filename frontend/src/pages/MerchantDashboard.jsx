import React, { useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const MerchantDashboard = () => {
  const socketRef = useRef(null);
  const [orders, setOrders] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [latestOrderNotification, setLatestOrderNotification] = useState(null);
  const { user } = useAuth();
  const [merchantId, setMerchantId] = useState(() => {
    return localStorage.getItem('merchantId') || 'MERCHANT_123';
  });

  useEffect(() => {
    // Nếu đã có merchantId từ đặt hàng (checkout) thì dùng, nếu không thì lấy từ user/UID
    const foundMerchantId = localStorage.getItem('merchantId') || user?.restaurantId || user?._id || 'MERCHANT_123';
    setMerchantId(foundMerchantId);
    localStorage.setItem('merchantId', foundMerchantId);
  }, [user]);

  // Hàm lấy danh sách đơn hàng từ Database
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
      from.setDate(to.getDate() - 6); // 7 ngày gần nhất

      const response = await axios.get(`http://localhost:5000/api/orders/revenue`, {
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
      const response = await axios.get(`http://localhost:5000/api/orders?merchantId=${merchantId}`);
      setOrders(response.data);
    } catch (error) {
      console.error("Lỗi lấy danh sách đơn:", error);
      toast.error('Không thể tải danh sách đơn hàng, vui lòng làm mới trang.');
    }
  }, [merchantId]);

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

    // Lắng nghe đơn hàng mới (Realtime)
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
      const response = await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, {
        status: newStatus
      });

      if (response.status === 200) {
        toast.success(`Trạng thái: ${newStatus}`);
        fetchOrders(); // Cập nhật lại danh sách sau khi đổi trạng thái
        fetchRevenueStats();
      }
    } catch (error) {
      console.error('Lỗi update status:', error);
      toast.error("Lỗi cập nhật trạng thái");
    }
  };

  // Hàm helper để hiển thị tên trạng thái tiếng Việt
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

  const maxRevenue = revenueData.reduce((max, item) => Math.max(max, item.totalRevenue), 0);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Quán của Bảo - Quản lý đơn hàng</h1>

      <section style={{ border: '1px solid #ddd', borderRadius: 10, padding: 16, marginBottom: 20 }}>
        <h2 style={{ marginTop: 0 }}>Biểu đồ doanh thu 7 ngày</h2>
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
                      background: '#3f51b5',
                      borderRadius: 4,
                      transition: 'height 0.2s ease'
                    }}
                  />
                  <div style={{ marginTop: 8, fontSize: 12 }}>{item.date.slice(5)}</div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {latestOrderNotification && (
        <div style={{ border: '2px solid #ff9800', background: '#fff8e1', padding: '12px', marginBottom: '16px', borderRadius: '8px' }}>
          <p style={{ margin: 0, fontWeight: 700 }}>🔔 Thông báo đơn mới</p>
          <p style={{ margin: '8px 0' }}>{latestOrderNotification.message}</p>
          <p style={{ margin: '4px 0' }}><strong>Mã đơn:</strong> {latestOrderNotification.orderId}</p>
          <p style={{ margin: '4px 0' }}><strong>Khách hàng:</strong> {latestOrderNotification.customerName}</p>
          <p style={{ margin: '4px 0' }}><strong>Tổng tiền:</strong> {latestOrderNotification.amountText}</p>
          <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>Thời gian: {latestOrderNotification.timestamp.toLocaleString()}</p>
        </div>
      )}

      <div className="order-list">
        {orders.map((order) => (
        <div key={order._id} style={{ border: '1px solid #ccc', padding: '15px', margin: '10px 0', borderRadius: '8px' }}>
          <p><strong>Mã đơn:</strong> {order._id.slice(-6)}</p>
          <p><strong>Khách hàng:</strong> {order.customerName || 'Quốc Việt'}</p>
          <p><strong>Trạng thái hiện tại:</strong> 
            <span style={{ color: order.status === 'completed' ? 'green' : 'orange' }}>
              {getStatusText(order.status)}
            </span>
          </p>

          {/* Các nút bấm thay đổi trạng thái */}
          <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
            {order.status === 'pending' && (
              <button onClick={() => handleUpdateStatus(order._id, 'preparing')} style={{ background: '#007bff', color: '#fff' }}>
                Chấp nhận đơn / Chuẩn bị
              </button>
            )}
            {order.status === 'preparing' && (
              <button onClick={() => handleUpdateStatus(order._id, 'delivering')} style={{ background: '#ffc107' }}>
                Đang giao
              </button>
            )}
            {order.status === 'delivering' && (
              <button onClick={() => handleUpdateStatus(order._id, 'completed')} style={{ background: '#28a745', color: '#fff' }}>
                Hoàn tất
              </button>
            )}
          </div>
        </div>
      ))}
      </div>
    </div>
  );
};

export default MerchantDashboard;