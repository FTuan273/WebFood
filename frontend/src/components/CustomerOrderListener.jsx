import React, { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const CustomerOrderListener = () => {
  const { user, setOrderStatusNotification } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user || !user._id) {
      return;
    }

    const socket = io('http://localhost:5000', {
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Customer realtime connected:', socket.id);

      // Khách hàng vào phòng theo userId để nhận cập nhật status
      socket.emit('join-customer-room', user._id);

      // Nếu userId hiện đang theo dõi một orderId cụ thể, có thể phát thêm room order
      if (user.lastOrderId) {
        socket.emit('join-order-room', user.lastOrderId);
      }
    });

    socket.on('connect_error', (err) => {
      console.error('Customer socket connect_error:', err);
      toast.error('Không thể kết nối server realtime cho trạng thái đơn hàng.');
    });

    // Nhận sự kiện order status update
    socket.on('orderStatusUpdated', (payload) => {
      console.log('orderStatusUpdated:', payload);

      const status = payload?.status;
      const message = payload?.message || 'Trạng thái đơn hàng đã được cập nhật.';

      let toastContent = '🛎️ ' + message;
      if (status === 'pending') {
        toastContent = '🕒 Đơn hàng đang chờ xử lý.';
        toast.info(toastContent);
      } else if (status === 'confirmed') {
        toastContent = '✅ Đơn hàng đã được xác nhận.';
        toast.success(toastContent);
      } else if (status === 'preparing') {
        toastContent = '👨‍🍳 Đơn hàng đang được chuẩn bị.';
        toast.info(toastContent);
      } else if (status === 'delivering') {
        toastContent = '🚚 Shipper đang mang món ăn đến bạn!';
        toast.info(toastContent);
      } else if (status === 'completed') {
        toastContent = '🎉 Đơn hàng đã giao thành công. Chúc ngon miệng!';
        toast.success(toastContent);
      } else if (status === 'cancelled') {
        toastContent = '❌ Đơn hàng đã bị hủy.';
        toast.error(toastContent);
      } else {
        toast.info(`🛎️ ${message}`);
      }

      if (setOrderStatusNotification) {
        setOrderStatusNotification({
          orderId: payload?.orderId || '',
          status: status || '',
          message: toastContent,
          updatedAt: new Date().toISOString(),
        });
      }
    });

    // Nếu merchant cũng dùng chung app, chọn lắng nghe luôn new-order-received ở client này là OK (tùy lựa chọn)
    socket.on('new-order-received', (data) => {
      // Chỉ bật log để tránh làm phiền UX khi khách hàng không phải chủ quán
      console.debug('Khách cũng nhận event new-order-received (merchant):', data);
    });

    return () => {
      socket.off('orderStatusUpdated');
      socket.off('new-order-received');
      socket.off('connect_error');
      socket.off('connect');
      socket.emit && socket.emit('leave-merchant-room', user._id);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, setOrderStatusNotification]);

  return null;
};

export default CustomerOrderListener;
