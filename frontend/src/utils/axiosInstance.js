/**
 * @file axiosInstance.js
 * @description Cấu hình Axios để gọi API thống nhất trong toàn bộ ứng dụng Frontend.
 * 
 * Các tính năng được thiết lập sẵn:
 *   - `baseURL`: Đường dẫn gốc của API Server.
 *   - `Interceptors (Request)`: Tự động đính kèm JWT (JSON Web Token) vào Header 
 *     của mỗi yêu cầu nếu người dùng đã đăng nhập.
 *
 * @author WebFood Team
 * @version 2.0.0
 */

import axios from 'axios';

// Khởi tạo instance với cấu hình cơ sở
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Request Interceptor: Tự động thêm Token vào Header trước khi gửi yêu cầu đi.
 * 
 * Server backend yêu cầu format: Authorization: Bearer <token>
 */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
