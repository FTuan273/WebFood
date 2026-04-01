import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const statusLabel = {
  pending: 'Chờ nhận',
  confirmed: 'Đã xác nhận',
  preparing: 'Đang chuẩn bị',
  delivering: 'Đang giao',
  completed: 'Hoàn tất',
  cancelled: 'Đã huỷ'
};

const ActiveOrderBar = () => {
  const { user } = useAuth();
  const [currentOrder, setCurrentOrder] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!user || !user._id) {
      return;
    }

    const fetchLatestOrder = async () => {
      try {
        const customerId = user._id;
        const response = await axios.get(`http://localhost:5000/api/orders?customerId=${customerId}`);
        const latest = (response.data || [])[0];
        if (latest) {
          const msg = latest.message || `Đơn hàng #${latest._id?.slice(-6) || '---'}: ${statusLabel[latest.status] || latest.status}`;
          setCurrentOrder({
            orderId: latest._id,
            status: latest.status,
            message: msg
          });
          setVisible(true);
        }
      } catch (error) {
        console.error('ActiveOrderBar fetch latest order failed:', error);
      }
    };

    fetchLatestOrder();

    const socket = io('http://localhost:5000', { transports: ['websocket', 'polling'] });

    socket.on('connect', () => {
      socket.emit('join-customer-room', user._id);
      if (user.lastOrderId) {
        socket.emit('join-order-room', user.lastOrderId);
      }
    });

    socket.on('orderStatusUpdated', (payload) => {
      const msg = payload?.message || `Đơn hàng #${payload?.orderId?.slice(-6) || '---'} đang ${statusLabel[payload?.status] || payload?.status}`;
      setCurrentOrder({
        orderId: payload?.orderId,
        status: payload?.status,
        message: msg
      });
      setVisible(true);
    });

    socket.on('new-order-received', (payload) => {
      const msg = payload?.message || `Bạn vừa có đơn hàng mới (#${payload?.orderId?.slice(-6) || '---'})`;
      setCurrentOrder({
        orderId: payload?.orderId,
        status: 'pending',
        message: msg
      });
      setVisible(true);
    });

    socket.on('connect_error', () => {
      // không hiển thị khi lỗi, chỉ log.
      console.warn('ActiveOrderBar: không thể kết nối realtime.');
    });

    return () => {
      socket.off('orderStatusUpdated');
      socket.off('new-order-received');
      socket.off('connect_error');
      socket.disconnect();
    };
  }, [user]);

  if (!user || !visible || !currentOrder) {
    return null;
  }

  const stepLabel = statusLabel[currentOrder.status] || 'Cập nhật';

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'min(92%, 600px)',
      backgroundColor: '#1e293b',
      color: '#f8fafc',
      borderRadius: 12,
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
      padding: '12px 14px',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      border: '1px solid #334155'
    }}>
      <div>
        <div style={{ fontSize: 13, opacity: 0.85 }}><strong>Order Tracking</strong></div>
        <div style={{ fontSize: 14, marginTop: 4 }}>{currentOrder.message}</div>
        <div style={{ fontSize: 12, marginTop: 4, color: '#a5b4fc' }}>Trạng thái: {stepLabel}</div>
      </div>
      <button
        onClick={() => setVisible(false)}
        style={{
          marginLeft: 12,
          border: 'none',
          backgroundColor: '#334155',
          color: '#e2e8f0',
          padding: '6px 10px',
          borderRadius: 6,
          cursor: 'pointer'
        }}
      >Đóng</button>
    </div>
  );
};

export default ActiveOrderBar;
