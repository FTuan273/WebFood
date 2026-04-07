// [THÊM MỚI] Component chặn truy cập theo Phân Quyền (Role: Admin, Merchant, Customer)
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const RoleRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Đang kiểm tra quyền...</div>;
  
  // Chưa đăng nhập
  if (!user) return <Navigate to="/login" replace />;
  
  // Không có quyền
  if (!allowedRoles.includes(user.role)) {
    toast.error('Bạn không có quyền truy cập trang này (Yêu cầu Role: ' + allowedRoles.join(', ') + ')');
    return <Navigate to="/" replace />;
  }

  // Đủ quyền truy cập
  return children;
};

export default RoleRoute;
