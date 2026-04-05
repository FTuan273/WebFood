/**
 * @file NoMinglingGuard.jsx
 * @description Hàng rào bảo vệ (Guard) ngăn cách trải nghiệm người dùng.
 * 
 * Mục tiêu: Không cho phép tài khoản Admin hoặc Merchant sử dụng giao diện mua sắm 
 * dành cho Khách hàng. Nếu họ cố tình truy cập vào các trang thuộc "Shopping Flow" 
 * (như Home, Menu, Checkout), Guard này sẽ:
 *   1. Hiển thị thông báo Toast cảnh báo.
 *   2. Tự động chuyển hướng (Redirect) họ về trang Dashboard quản lý tương ứng.
 *
 * @param {React.ReactNode} children - Các component trang mua sắm cần được bảo vệ.
 * @author WebFood Team
 * @version 2.0.0
 */

import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const NoMinglingGuard = ({ children }) => {
  const { user, loading } = useAuth();

  /**
   * Tác vụ phụ: Hiển thị thông báo khi phát hiện đăng nhập sai vai trò.
   */
  useEffect(() => {
    // Chỉ thực hiện khi đã tải xong dữ liệu User và User có quyền quản trị
    if (!loading && user) {
      if (user.role === 'Admin' || user.role === 'Merchant') {
        const roleName = user.role === 'Admin' ? 'Quản trị viên' : 'Chủ quán';
        
        toast.warn(`Tài khoản ${roleName} không được phép sử dụng giao diện mua sắm.`, {
          toastId: 'no-mingling-toast', // ID cố định để tránh hiện nhiều toast giống nhau khi chuyển trang
          autoClose: 5000
        });
      }
    }
  }, [user, loading]);

  // Đang kiểm tra phiên làm việc -> hiển thị trang trống (hoặc loading spinner)
  if (loading) return null;

  // KIỂM TRA ĐIỀU KIỆN CHẶN:
  // Nếu là Admin hoặc Merchant -> Chuyển hướng ngay lập tức về khu vực quản lý
  if (user && (user.role === 'Admin' || user.role === 'Merchant')) {
    const targetPath = user.role === 'Admin' ? '/admin' : '/merchant';
    return <Navigate to={targetPath} replace />;
  }

  // Nếu là Khách vãng lai (chưa login) hoặc Khách hàng (Customer) -> Cho phép truy cập bình thường
  return children;
};

export default NoMinglingGuard;
