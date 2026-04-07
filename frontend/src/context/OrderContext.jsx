import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'react-toastify';

const OrderContext = createContext();

export const useOrders = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
  const { user } = useAuth();
  
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const prevNotifIds = useRef(new Set());
  const isFirstLoad = useRef(true);

  const markAllAsRead = async () => {
    try {
      await axiosInstance.post('/customer/notifications/read');
      // Cập nhật state local ngay lập tức
      setNotifications(prev => prev.map(n => ({...n, isRead: true})));
    } catch (err) {
      console.error('Lỗi khi đánh dấu đã đọc:', err);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'Customer') return;

    const fetchBackgroundData = async () => {
      try {
        const [ordersRes, notifRes] = await Promise.all([
          axiosInstance.get('/customer/orders'),
          axiosInstance.get('/customer/notifications')
        ]);

        if (ordersRes.data.success) {
          setOrders(ordersRes.data.orders);
        }
        
        if (notifRes.data.success) {
          const currentNotifs = notifRes.data.notifications;
          setNotifications(currentNotifs);
          
          if (isFirstLoad.current) {
            // Lần đầu tải, chỉ lưu ID không hiện toast popup
            currentNotifs.forEach(n => prevNotifIds.current.add(n._id));
            isFirstLoad.current = false;
          } else {
            // Lần tiếp theo, kiểm tra xem có thông báo MỚI KHÔNG
            currentNotifs.forEach(n => {
              if (!n.isRead && !prevNotifIds.current.has(n._id)) {
                // Có 1 thông báo mới xuất hiện! Bắn toast notification
                if (n.message.toLowerCase().includes('hủy')) {
                   toast.error(n.message);
                } else if (n.message.toLowerCase().includes('hoàn thành')) {
                   toast.success(n.message);
                } else {
                   toast.info(n.message);
                }
                prevNotifIds.current.add(n._id);
              }
            });
          }
        }
      } catch (err) {
        console.error('Order/Notif Context Poll Error', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBackgroundData();
    const intervalId = setInterval(fetchBackgroundData, 3000);
    return () => clearInterval(intervalId);

  }, [user]);

  return (
    <OrderContext.Provider value={{ orders, notifications, unreadCount, markAllAsRead, loading }}>
      {children}
    </OrderContext.Provider>
  );
};
