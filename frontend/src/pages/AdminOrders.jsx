import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ShieldAlert, Package, Check, X, Search, Clock, ShieldBan } from 'lucide-react';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrders = () => {
    setLoading(true);
    axios.get('http://localhost:5000/api/admin/orders')
      .then(res => {
        if (res.data.success) setOrders(res.data.orders);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => { 
    fetchOrders(); 
    
    // Khởi tạo kênh sóng Vệ tinh Real-time
    const socket = io('http://localhost:5000');
    socket.on('system_orders_changed', () => {
      fetchOrders(); // Nạp lại bảng bất cứ khi nào có biến động Đơn Hàng
    });

    // Ngắt kết nối để đỡ nặng máy khi rời Router khác
    return () => socket.disconnect();
  }, []);

  const handleForceCancel = async (orderId) => {
    const reason = window.prompt("CẢNH BÁO CAO CẤP: Ép hủy sẽ diễn ra ngay lập tức!\nNhập lý do hủy đơn (Sẽ xuất hiện trong thông báo gửi đến điện thoại Khách Hàng):");
    if (reason === null) return;
    
    try {
      const res = await axios.put(`http://localhost:5000/api/admin/orders/${orderId}/force-cancel`, { cancelReason: reason });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchOrders();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi ép hủy đơn');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'completed': return <span style={{...badgeBase, bg: '#e3fbe3', color: '#2ed573'}}><Check size={14}/> Hoàn thành</span>;
      case 'cancelled': return <span style={{...badgeBase, bg: '#ffe1e1', color: '#ff4757'}}><X size={14}/> Đã hủy</span>;
      case 'pending': return <span style={{...badgeBase, bg: '#fef5d4', color: '#f39c12'}}><Clock size={14}/> Đang chờ duyệt</span>;
      case 'confirmed': return <span style={{...badgeBase, bg: '#eef2ff', color: '#5f27cd'}}><Check size={14}/> Quán đã nhận</span>;
      case 'preparing': return <span style={{...badgeBase, bg: '#eef2ff', color: '#5f27cd'}}><Package size={14}/> Đang chuẩn bị</span>;
      case 'delivering': return <span style={{...badgeBase, bg: '#e1f5fe', color: '#0984e3'}}><Package size={14}/> Đang giao</span>;
      default: return <span style={{...badgeBase, bg: '#eee', color: '#666'}}>{status}</span>;
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchFilter = filter === 'all' || o.status === filter;
    const searchLow = searchTerm.toLowerCase();
    const fullName = o.customerId ? `${o.customerId.lastName || ''} ${o.customerId.firstName || ''}`.trim() : '';
    const matchSearch = o._id.toLowerCase().includes(searchLow) 
      || fullName.toLowerCase().includes(searchLow)
      || (o.restaurantId?.name && o.restaurantId.name.toLowerCase().includes(searchLow));
    return matchFilter && matchSearch;
  });

  return (
    <div>
      <h2 style={{ fontSize: '2rem', marginBottom: '20px', color: '#2f3542', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ShieldAlert size={32} color="#ff4757" /> Master Orders Control
      </h2>
      <p style={{ color: '#7f8c8d', marginBottom: '30px' }}>
        Theo dõi toàn bộ luồng luân chuyển đơn hàng hệ thống. Hỗ trợ <strong>Cứu hộ ép hủy</strong> đối với các đơn hàng lỗi để bảo hành Khách.
      </p>

      {/* Thanh Công Cụ */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', backgroundColor: '#fff', padding: '15px 20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, backgroundColor: '#f5f6fa', padding: '10px 15px', borderRadius: '8px' }}>
          <Search size={20} color="#7f8c8d" style={{ marginRight: '10px' }} />
          <input 
            type="text" 
            placeholder="Tìm mã đơn, tên khách, hoặc tên quán..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ border: 'none', backgroundColor: 'transparent', outline: 'none', width: '100%', fontSize: '1rem' }}
          />
        </div>
        <select 
          value={filter} 
          onChange={e => setFilter(e.target.value)}
          style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #dcdde1', outline: 'none', fontSize: '1rem', cursor: 'pointer' }}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Đang chờ</option>
          <option value="delivering">Đang giao</option>
          <option value="completed">Đã hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>

      {/* Bảng Dữ Liệu */}
      <div style={{ backgroundColor: '#fff', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#fafafa', borderBottom: '2px solid #f1f2f6', textAlign: 'left' }}>
              <th style={thStyle}>Mã Đơn Hàng</th>
              <th style={thStyle}>Khách Hàng</th>
              <th style={thStyle}>Tên Quán</th>
              <th style={thStyle}>Tổng Thu</th>
              <th style={thStyle}>Trạng Thái</th>
              <th style={{...thStyle, textAlign: 'center'}}>Quyền Năng</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="6" style={{padding:'20px', textAlign:'center'}}>Đang tải phân luồng dữ liệu...</td></tr> :
             filteredOrders.length === 0 ? <tr><td colSpan="6" style={{padding:'20px', textAlign:'center'}}>Không tìm thấy đơn hàng nào.</td></tr> :
             filteredOrders.map(o => {
               const canCancel = ['pending', 'confirmed', 'preparing', 'delivering'].includes(o.status);
               return (
                 <tr key={o._id} style={{ borderBottom: '1px solid #f1f2f6' }}>
                   <td style={tdStyle}><span style={{ fontFamily: 'monospace', color: '#7f8c8d' }}>#{o._id.slice(-8).toUpperCase()}</span></td>
                   <td style={tdStyle}>
                     <div style={{ fontWeight: 'bold' }}>{o.customerId ? `${o.customerId.lastName || ''} ${o.customerId.firstName || ''}`.trim() || 'Khách Vô Danh' : 'Khách Vô Danh'}</div>
                     <div style={{ fontSize: '0.85rem', color: '#888' }}>{o.customerId?.phone}</div>
                   </td>
                   <td style={{...tdStyle, fontWeight: 'bold'}}>{o.restaurantId?.name || 'Quán Cũ Đã Xóa'}</td>
                   <td style={{...tdStyle, fontWeight: 'bold', color: '#2ed573'}}>{o.totalPrice.toLocaleString('vi-VN')} đ</td>
                   <td style={tdStyle}>
                     <div style={{ background: getStatusBadge(o.status).props.style.bg, color: getStatusBadge(o.status).props.style.color, padding: '5px 10px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                       {getStatusBadge(o.status).props.children}
                     </div>
                   </td>
                   <td style={{...tdStyle, textAlign: 'center'}}>
                     {canCancel ? (
                       <button onClick={() => handleForceCancel(o._id)} style={{ padding: '8px 15px', backgroundColor: '#ff4757', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                         <ShieldBan size={16} /> Ép Hủy
                       </button>
                     ) : (
                       <span style={{ color: '#ccc', fontStyle: 'italic', fontSize: '0.9rem' }}>Đã khóa mốc</span>
                     )}
                   </td>
                 </tr>
               );
             })
            }
          </tbody>
        </table>
      </div>
    </div>
  );
};

const badgeBase = { }; // Dùng trực tiếp inline properties thay vì gộp
const thStyle = { padding: '15px 20px', color: '#7f8c8d', fontWeight: '600' };
const tdStyle = { padding: '15px 20px', verticalAlign: 'middle', color: '#2f3542' };

export default AdminOrders;
