/**
 * @file AuthContext.jsx
 * @description Quản lý trạng thái xác thực (Authentication State) toàn cục cho ứng dụng.
 * 
 * Sử dụng React Context API để cung cấp các thông tin và hàm xử lý:
 *   - `user`: Thông tin người dùng hiện tại (null nếu chưa đăng nhập).
 *   - `login`: Hàm xử lý đăng nhập.
 *   - `register`: Hàm đăng ký tài khoản mới.
 *   - `updateProfile`: Hàm cập nhật thông tin cá nhân.
 *   - `logout`: Đăng xuất và xóa cache.
 *   - `loading`: Trạng thái đang kiểm tra phiên làm việc.
 *
 * Lưu trữ: Token và thông tin User được lưu tại localStorage để duy trì phiên khi F5.
 *
 * @author WebFood Team
 * @version 2.0.0
 */

/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { io } from 'socket.io-client';
import axiosInstance from '../utils/axiosInstance';

// Khởi tạo Context
const AuthContext = createContext();

/**
 * Component Provider bao bọc toàn bộ ứng dụng để cung cấp Auth State.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderStatusNotification, setOrderStatusNotification] = useState(null);
  const socketRef = useRef(null);

  /**
   * Khởi tạo: Kiểm tra xem người dùng đã đăng nhập trước đó chưa (LocalStorage).
   */
  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (storedUser && token) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Lỗi parse dữ liệu User từ localStorage", e);
        }
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    const cleanSocket = () => {
      if (socketRef.current) {
        socketRef.current.off('orderStatusUpdated');
        socketRef.current.off('new-order-received');
        socketRef.current.off('connect_error');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };

    if (!user || !user._id) {
      cleanSocket();
      setOrderStatusNotification(null);
      return;
    }

    const setupSocket = () => {
      const socket = io('http://localhost:5000', { transports: ['websocket', 'polling'] });
      socketRef.current = socket;

      socket.on('connect', () => {
        socket.emit('join-customer-room', user._id);
        if (user.lastOrderId) {
          socket.emit('join-order-room', user.lastOrderId);
        }
      });

      socket.on('orderStatusUpdated', (payload) => {
        setOrderStatusNotification({
          orderId: payload?.orderId || null,
          status: payload?.status || null,
          message: payload?.message || `Đơn hàng ${payload?.orderId || ''} đã cập nhật: ${payload?.status || ''}`,
          updatedAt: new Date().toISOString()
        });
      });

      socket.on('new-order-received', (payload) => {
        setOrderStatusNotification({
          orderId: payload?.orderId || null,
          status: payload?.status || 'pending',
          message: payload?.message || `Có đơn mới ${payload?.orderId || ''}`,
          updatedAt: new Date().toISOString()
        });
      });

      socket.on('connect_error', (error) => {
        console.warn('Socket Connect Error:', error);
      });
    };

    const fetchLatestOrder = async () => {
      try {
        const res = await axiosInstance.get(`/orders?customerId=${user._id}`);
        const latestOrder = Array.isArray(res.data) && res.data[0] ? res.data[0] : null;
        if (latestOrder) {
          setOrderStatusNotification({
            orderId: latestOrder._id,
            status: latestOrder.status,
            message: `Đơn hàng #${latestOrder._id.slice(-6)}: ${latestOrder.status}`,
            updatedAt: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Lỗi lấy đơn mới nhất tại AuthContext:', error);
      }
    };

    setupSocket();
    fetchLatestOrder();

    return () => {
      cleanSocket();
    };
  }, [user]);

  /**
   * Xử lý Đăng nhập.
   * 
   * @param {string} email    - Email tài khoản.
   * @param {string} password - Mật khẩu.
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  const login = async (email, password) => {
    try {
      const { data } = await axiosInstance.post('/auth/login', { email, password });
      
      // Lưu vào State và LocalStorage
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user',  JSON.stringify(data.user));
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Email hoặc mật khẩu không chính xác' 
      };
    }
  };

  /**
   * Xử lý Đăng ký tài khoản mới.
   * 
   * @param {object} userData - Thông tin đăng ký (lastName, firstName, email, role, ...).
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  const register = async (userData) => {
    try {
      const { data } = await axiosInstance.post('/auth/register', userData);
      
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user',  JSON.stringify(data.user));
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.' 
      };
    }
  };

  /**
   * Cập nhật thông tin Hồ sơ cá nhân.
   * 
   * @param {object} userData - Các trường cần cập nhật (firstName, lastName, address, ...).
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  const updateProfile = async (userData) => {
    try {
      const { data } = await axiosInstance.put('/auth/updatedetails', userData);
      
      // Cập nhật lại State và LocalStorage với dữ liệu mới từ Server
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Không thể cập nhật thông tin lúc này' 
      };
    }
  };

  /**
   * Xử lý Đăng xuất.
   * Xóa toàn bộ dữ liệu xác thực khỏi ứng dụng.
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, loading, orderStatusNotification, setOrderStatusNotification }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook tùy chỉnh để sử dụng AuthContext một cách nhanh chóng.
 * @example const { user, logout } = useAuth();
 */
export const useAuth = () => useContext(AuthContext);
