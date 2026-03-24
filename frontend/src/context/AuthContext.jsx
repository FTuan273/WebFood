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

import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from '../utils/axiosInstance';

// Khởi tạo Context
const AuthContext = createContext();

/**
 * Component Provider bao bọc toàn bộ ứng dụng để cung cấp Auth State.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Khởi tạo: Kiểm tra xem người dùng đã đăng nhập trước đó chưa (LocalStorage).
   */
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token      = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Lỗi parse dữ liệu User từ localStorage", e);
      }
    }
    setLoading(false);
  }, []);

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
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook tùy chỉnh để sử dụng AuthContext một cách nhanh chóng.
 * @example const { user, logout } = useAuth();
 */
export const useAuth = () => useContext(AuthContext);
