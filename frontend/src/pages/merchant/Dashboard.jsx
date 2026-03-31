import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const [data, setData] = useState({ revenue: 0, totalOrders: 0, orders: [] });

  useEffect(() => {
    axios.get('http://localhost:5000/api/merchant/dashboard').then(res => setData(res.data)).catch(console.error);
  }, []);

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px' }}>📊 Tổng Quan Doanh Thu</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ padding: '20px', backgroundColor: '#f1fdf9', borderRadius: '10px', border: '1px solid #10ac84' }}>
          <div style={{ color: '#57606f', fontSize: '14px' }}>Tổng Doanh Thu</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10ac84' }}>{data.revenue.toLocaleString()}đ</div>
        </div>
        <div style={{ padding: '20px', backgroundColor: '#f5f6fa', borderRadius: '10px', border: '1px solid #ced6e0' }}>
          <div style={{ color: '#57606f', fontSize: '14px' }}>Số Lượng Đơn</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2f3542' }}>{data.totalOrders} đơn</div>
        </div>
      </div>

      <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>Đơn hàng gần đây ({data.orders.length})</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #f1f2f6' }}>
            <th style={{ padding: '12px' }}>Mã Đơn</th>
            <th style={{ padding: '12px' }}>Trạng thái</th>
            <th style={{ padding: '12px' }}>Tổng tiền</th>
          </tr>
        </thead>
        <tbody>
          {data.orders.slice(0, 5).map(o => (
            <tr key={o._id} style={{ borderBottom: '1px solid #f1f2f6' }}>
              <td style={{ padding: '12px', fontSize: '0.9rem' }}>{o._id}</td>
              <td style={{ padding: '12px' }}>
                <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', backgroundColor: o.status==='completed'?'#10ac84':'#ff9f43', color: '#fff' }}>
                  {o.status}
                </span>
              </td>
              <td style={{ padding: '12px' }}>{o.totalPrice.toLocaleString()}đ</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
