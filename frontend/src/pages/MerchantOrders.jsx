import React, { useEffect, useState } from 'react';
import { ClipboardList, RefreshCw } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'react-toastify';

// Luồng trạng thái đơn hàng
const STATUS_FLOW = ['pending', 'confirmed', 'preparing', 'delivering', 'completed'];
const STATUS_LABEL = {
  pending:    { label: '⏳ Chờ xác nhận', color: '#f39c12', bg: '#fff8e1' },
  confirmed:  { label: '✅ Đã xác nhận',  color: '#2980b9', bg: '#e3f2fd' },
  preparing:  { label: '🍳 Đang làm',     color: '#8e44ad', bg: '#f3e5f5' },
  delivering: { label: '🚀 Đang giao',    color: '#16a085', bg: '#e0f7fa' },
  completed:  { label: '🎉 Hoàn thành',   color: '#27ae60', bg: '#e8f5e9' },
  cancelled:  { label: '❌ Đã huỷ',       color: '#e74c3c', bg: '#fce4ec' },
};

const MerchantOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | pending | preparing | ...

  const fetchOrders = async () => {
    try {
      const res = await axiosInstance.get('/merchant/orders');
      setOrders(res.data.orders);
    } catch { toast.error('Không tải được đơn hàng'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const changeStatus = async (orderId, newStatus) => {
    try {
      await axiosInstance.put(`/merchant/orders/${orderId}/status`, { status: newStatus });
      toast.success('Cập nhật trạng thái!');
      fetchOrders();
    } catch { toast.error('Cập nhật thất bại'); }
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  if (loading) return <div style={{ padding: 20, color: '#888' }}>Đang tải...</div>;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Đơn hàng</h2>
          <p style={{ color: '#888', margin: '4px 0 0' }}>{orders.length} đơn tổng cộng</p>
        </div>
        <button onClick={fetchOrders} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f0f0f0', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer' }}>
          <RefreshCw size={16} /> Làm mới
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[['all','Tất cả'], ...Object.entries(STATUS_LABEL)].map(([key, val]) => (
          <button key={key} onClick={() => setFilter(key)}
            style={{ padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem',
              background: filter === key ? '#1a1a2e' : '#f0f0f0',
              color: filter === key ? 'white' : '#555'
            }}>
            {key === 'all' ? 'Tất cả' : (val.label || val)}
          </button>
        ))}
      </div>

      {/* Order list */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#aaa', background: 'white', borderRadius: 14 }}>
          <ClipboardList size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
          <div>Không có đơn hàng nào</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map(order => {
            const st = STATUS_LABEL[order.status] || {};
            const nextStatus = STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1];
            return (
              <div key={order._id} style={{ background: 'white', borderRadius: 14, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                {/* Header đơn */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <span style={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.95rem' }}>
                      #{order._id.slice(-6).toUpperCase()}
                    </span>
                    <span style={{ color: '#aaa', fontSize: '0.82rem', marginLeft: 10 }}>
                      {new Date(order.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: '0.82rem', fontWeight: 600, color: st.color, background: st.bg }}>
                    {st.label}
                  </span>
                </div>

                {/* Khách hàng */}
                <div style={{ fontSize: '0.88rem', color: '#555', marginBottom: 10 }}>
                  👤 {order.customerId?.lastName} {order.customerId?.firstName} — 📞 {order.customerId?.phoneNumber || '—'}
                  <br />📍 {order.deliveryAddress}
                </div>

                {/* Danh sách món */}
                <div style={{ background: '#f8f9fa', borderRadius: 8, padding: '10px 14px', marginBottom: 12 }}>
                  {order.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.87rem', padding: '3px 0' }}>
                      <span>{item.productId?.name || 'Món đã xoá'} × {item.quantity}</span>
                      <span style={{ fontWeight: 600 }}>{(item.price * item.quantity).toLocaleString('vi-VN')}₫</span>
                    </div>
                  ))}
                  <div style={{ borderTop: '1px dashed #ddd', marginTop: 6, paddingTop: 6, display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                    <span>Tổng</span>
                    <span style={{ color: '#e94560' }}>{order.totalPrice.toLocaleString('vi-VN')}₫</span>
                  </div>
                </div>

                {/* Nút chuyển trạng thái */}
                {nextStatus && order.status !== 'cancelled' && (
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button onClick={() => changeStatus(order._id, 'cancelled')}
                      style={{ background: '#fce4ec', color: '#c62828', border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                      Huỷ đơn
                    </button>
                    <button onClick={() => changeStatus(order._id, nextStatus)}
                      style={{ background: 'linear-gradient(135deg,#e94560,#c0392b)', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                      {STATUS_LABEL[nextStatus]?.label} →
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MerchantOrders;
