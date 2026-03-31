import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function StoreInfo() {
  const [store, setStore] = useState({ name: '', address: '', openingHours: '', description: '' });

  useEffect(() => {
    axios.get('http://localhost:5000/api/merchant/store').then(res => setStore(res.data||{})).catch(console.error);
  }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:5000/api/merchant/store', store);
      alert('Đã cập nhật!');
    } catch(err) { alert('Lỗi!'); }
  };

  return (
    <div style={{ maxWidth: '600px' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px' }}>🏪 Thiết Lập Quán</h2>
      <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={labelStyle}>Tên quán</label>
          <input required value={store.name} onChange={e=>setStore({...store, name:e.target.value})} style={inpStyle} />
        </div>
        <div>
          <label style={labelStyle}>Địa chỉ</label>
          <input required value={store.address} onChange={e=>setStore({...store, address:e.target.value})} style={inpStyle} />
        </div>
        <div>
          <label style={labelStyle}>Giờ hoạt động</label>
          <input placeholder="VD: 08:00 - 22:00" value={store.openingHours} onChange={e=>setStore({...store, openingHours:e.target.value})} style={inpStyle} />
        </div>
        <div>
          <label style={labelStyle}>Mô tả quán</label>
          <textarea rows={4} value={store.description} onChange={e=>setStore({...store, description:e.target.value})} style={inpStyle} />
        </div>
        <button type="submit" style={{ backgroundColor: '#10ac84', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
          Lưu thay đổi
        </button>
      </form>
    </div>
  );
}

const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: '500', color: '#2f3542' };
const inpStyle = { width: '100%', padding: '10px', border: '1px solid #ced6e0', borderRadius: '6px', fontSize: '1rem' };
