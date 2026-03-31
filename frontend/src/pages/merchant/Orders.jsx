import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Orders() {
  const [orders, setOrders] = useState([]);

  const fetchOrders = () => {
    axios.get('http://localhost:5000/api/merchant/orders').then(res => setOrders(res.data)).catch(console.error);
  };

  useEffect(() => { 
    fetchOrders(); 
    // Auto-refresh đơn hàng mỗi 10 giây để "nhận thông báo đơn mới" nhanh nhất
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/merchant/orders/${id}/status`, { status });
      fetchOrders();
    } catch (err) { alert('Lỗi cập nhật'); }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px' }}>📦 Quản lý Đơn Hàng</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead style={{ backgroundColor: '#f1f2f6' }}>
          <tr>
            <th style={{ padding: '12px' }}>Mã Đơn & KH</th>
            <th style={{ padding: '12px' }}>Địa chỉ</th>
            <th style={{ padding: '12px' }}>Tổng tiền</th>
            <th style={{ padding: '12px' }}>Trạng thái</th>
            <th style={{ padding: '12px' }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o._id} style={{ borderBottom: '1px solid #f1f2f6' }}>
              <td style={{ padding: '12px' }}>
                <div style={{ fontSize: '0.8rem', color: '#747d8c' }}>{o._id}</div>
                <div>ID KH: {o.customerId}</div>
              </td>
              <td style={{ padding: '12px' }}>{o.deliveryAddress}</td>
              <td style={{ padding: '12px', fontWeight: 'bold' }}>{o.totalPrice.toLocaleString()}đ</td>
              <td style={{ padding: '12px' }}>
                <span style={{ padding: '5px 10px', borderRadius: '15px', fontSize: '0.8rem', border: '1px solid #ccc' }}>
                  {o.status.toUpperCase()}
                </span>
              </td>
              <td style={{ padding: '12px', display: 'flex', gap: '5px' }}>
                {o.status === 'pending' && <button onClick={() => updateStatus(o._id, 'preparing')} style={btn('#3498db')}>Chuẩn bị</button>}
                {o.status === 'preparing' && <button onClick={() => updateStatus(o._id, 'delivering')} style={btn('#f1c40f')}>Giao Shipper</button>}
                {o.status === 'delivering' && <button onClick={() => updateStatus(o._id, 'completed')} style={btn('#10ac84')}>Hoàn thành</button>}
                {o.status !== 'completed' && o.status !== 'cancelled' && <button onClick={() => updateStatus(o._id, 'cancelled')} style={btn('#ff4757')}>Hủy</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const btn = (color) => ({ backgroundColor: color, color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' });
