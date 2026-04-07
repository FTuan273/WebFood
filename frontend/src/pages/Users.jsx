import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Lock, Unlock, Search, Trash2 } from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    axios.get('http://localhost:5000/api/admin/users')
      .then(res => {
        setUsers(res.data.users);
        setLoading(false);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleStatus = (id) => {
    axios.put(`http://localhost:5000/api/admin/users/${id}/status`)
      .then(() => fetchUsers())
      .catch(console.error);
  };

  const updateRole = (id, newRole) => {
    axios.put(`http://localhost:5000/api/admin/users/${id}/role`, { role: newRole })
      .then(() => fetchUsers())
      .catch(console.error);
  };

  const deleteUser = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa User này vĩnh viễn khỏi hệ thống không?')) {
      axios.delete(`http://localhost:5000/api/admin/users/${id}`)
        .then(() => fetchUsers())
        .catch(console.error);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '2rem', marginBottom: '20px', color: '#2f3542' }}>Quản lý User</h2>
      
      <div style={{ backgroundColor: '#fff', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #f1f2f6', textAlign: 'left' }}>
              <th style={thStyle}>Tài khoản</th>
              <th style={thStyle}>Vai trò (Role)</th>
              <th style={thStyle}>Trạng thái</th>
              <th style={thStyle}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
               <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center' }}>Đang tải...</td></tr>
            ) : users.length === 0 ? (
               <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center' }}>Chưa có user nào</td></tr>
            ) : (
              users.map(user => (
                <tr key={user._id} style={{ borderBottom: '1px solid #f1f2f6' }}>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 'bold', color: '#2f3542' }}>{user.firstName} {user.lastName}</div>
                    <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>{user.email}</div>
                  </td>
                  <td style={tdStyle}>
                    <select 
                      value={user.role} 
                      onChange={(e) => updateRole(user._id, e.target.value)}
                      style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #ced6e0', outline: 'none', backgroundColor: '#f8f9fa', color: '#2f3542', fontWeight: 600, cursor: 'pointer' }}
                    >
                      <option value="Customer">CUSTOMER</option>
                      <option value="Merchant">MERCHANT</option>
                      <option value="Admin">ADMIN</option>
                    </select>
                  </td>
                  <td style={tdStyle}>
                    <span style={statusBadge(user.status || 'active')}>{user.status === 'locked' ? 'Bị Khóa' : 'Hoạt động'}</span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button 
                        onClick={() => toggleStatus(user._id)}
                        style={actionButton(user.status || 'active')}
                      >
                        {user.status === 'locked' ? <><Unlock size={16} /> Mở khóa</> : <><Lock size={16} /> Khóa</>}
                      </button>
                      <button 
                        onClick={() => deleteUser(user._id)} 
                        style={{ padding: '8px', backgroundColor: '#fff', border: '1px solid #ff4757', color: '#ff4757', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: '0.2s' }}
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#ff4757'; e.currentTarget.style.color = '#fff'; }}
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.color = '#ff4757'; }}
                        title="Xóa tài khoản"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const thStyle = { padding: '15px 20px', color: '#7f8c8d', fontWeight: '600' };
const tdStyle = { padding: '15px 20px', verticalAlign: 'middle' };

const roleBadge = (role) => ({
  padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600',
  backgroundColor: role === 'admin' ? '#ffeaa7' : role === 'merchant' ? '#fab1a0' : '#dfe6e9',
  color: role === 'admin' ? '#d63031' : role === 'merchant' ? '#e17055' : '#636e72',
});

const statusBadge = (status) => ({
  padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600',
  backgroundColor: status === 'active' ? '#e3fbe3' : '#ffe1e1',
  color: status === 'active' ? '#2ed573' : '#ff4757',
});

const actionButton = (status) => ({
  display: 'flex', alignItems: 'center', gap: '8px',
  padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
  fontWeight: '600', fontSize: '0.9rem', transition: 'all 0.2s',
  backgroundColor: status === 'active' ? '#ff4757' : '#2ed573',
  color: 'white'
});

export default Users;
