import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { getImageUrl } from '../utils/imageUrl';
import { FileText, CheckCircle, Clock, Truck, XCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Orders = () => {
  const { user } = useAuth();
  const { orders, loading, clearUnread } = useOrders();

  useEffect(() => {
    // Xóa badge thông báo đỏ ngay khi user vào xem trang Orders
    if (clearUnread) {
       clearUnread();
    }
  }, [clearUnread]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'pending': return { label: 'Chờ xác nhận', color: '#fa8c16', icon: <Clock size={16} /> };
      case 'confirmed': return { label: 'Đã xác nhận', color: '#1890ff', icon: <CheckCircle size={16} /> };
      case 'preparing': return { label: 'Đang chuẩn bị', color: '#13c2c2', icon: <AlertCircle size={16} /> };
      case 'delivering': return { label: 'Đang giao hàng', color: '#722ed1', icon: <Truck size={16} /> };
      case 'completed': return { label: 'Hoàn thành', color: '#52c41a', icon: <CheckCircle size={16} /> };
      case 'cancelled': return { label: 'Đã hủy', color: '#f5222d', icon: <XCircle size={16} /> };
      default: return { label: 'Không xác định', color: '#8c8c8c', icon: <FileText size={16} /> };
    }
  };

  if (loading) {
    return <div className="container section" style={{ minHeight: '60vh', textAlign: 'center' }}>Đang tải danh sách đơn hàng...</div>;
  }

  return (
    <div className="orders-page bg-light" style={{ minHeight: '80vh', padding: '40px 0' }}>
      <div className="container">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px', gap: '15px' }}>
            <FileText size={28} color="var(--primary)" />
            <h1 style={{ fontSize: '28px', margin: 0, color: 'var(--text-main)' }}>Đơn hàng của tôi</h1>
          </div>

          {orders.length === 0 ? (
            <div style={{ backgroundColor: 'white', padding: '50px', borderRadius: '12px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
              <FileText size={60} color="#e0e0e0" style={{ marginBottom: '20px' }} />
              <h3 style={{ marginBottom: '15px', color: 'var(--text-main)' }}>Bạn chưa có đơn hàng nào</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Hãy đặt món ăn ngay để trải nghiệm nhé!</p>
              <Link to="/menu" className="btn btn-primary" style={{ display: 'inline-block', padding: '10px 25px' }}>Khám phá thực đơn</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {orders.map((order) => {
                const statusInfo = getStatusDisplay(order.status);
                
                return (
                  <div key={order._id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow-sm)', border: order.status === 'cancelled' ? '1px solid #ffa39e' : '1px solid var(--border)' }}>
                    
                    {/* Header: Tên quán + Trạng thái */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0', paddingBottom: '15px', marginBottom: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontWeight: 700, fontSize: '16px' }}>
                          {order.restaurantId?.name || 'Nhà hàng không xác định'}
                        </span>
                      </div>
                      
                      <div style={{ 
                        display: 'flex', alignItems: 'center', gap: '6px', 
                        color: statusInfo.color, backgroundColor: `${statusInfo.color}15`, 
                        padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 600 
                      }}>
                        {statusInfo.icon} {statusInfo.label}
                      </div>
                    </div>

                    {/* Dòng chữ báo Cảnh báo (Nếu Hủy) */}
                    {order.status === 'cancelled' && (
                      <div style={{ backgroundColor: '#fff1f0', color: '#cf1322', padding: '10px 15px', borderRadius: '6px', fontSize: '13px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertCircle size={16} /> Đơn hàng này đã bị hủy. Rất tiếc vì sự bất tiện này.
                      </div>
                    )}

                    {/* Danh sách món ăn */}
                    <div style={{ marginBottom: '15px' }}>
                      {order.items.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <div style={{ display: 'flex', gap: '12px' }}>
                            <img 
                              src={getImageUrl(item.productId?.image)} 
                              alt="món ăn" 
                              style={{ width: '60px', height: '60px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #eee' }} 
                            />
                            <div>
                              <div style={{ fontWeight: 500 }}>{item.productId?.name || 'Món ăn không tồn tại'}</div>
                              <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>x {item.quantity}</div>
                            </div>
                          </div>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                            {formatPrice(item.price * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer: Thông tin tổng quan */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0', paddingTop: '15px' }}>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        <div style={{ marginBottom: '4px' }}>Mã đơn: #{order._id.substring(order._id.length - 8).toUpperCase()}</div>
                        <div>Đặt lúc: {formatDate(order.createdAt)}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '2px' }}>Tổng thanh toán</div>
                        <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--price-color)' }}>
                          {formatPrice(order.totalPrice)}
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
