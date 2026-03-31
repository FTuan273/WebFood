import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Menu() {
  const [data, setData] = useState({ categories: [], products: [] });
  const [form, setForm] = useState({ name: '', price: '', categoryId: '', image: null });

  const fetchData = () => {
    axios.get('http://localhost:5000/api/merchant/menu').then(res => setData(res.data)).catch(console.error);
  };
  useEffect(() => { fetchData() }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('price', form.price);
    if(form.categoryId) fd.append('categoryId', form.categoryId);
    if(form.image) fd.append('image', form.image);

    try {
      await axios.post('http://localhost:5000/api/merchant/products', fd);
      alert('Thêm thành công!');
      setForm({ name: '', price: '', categoryId: '', image: null });
      fetchData();
    } catch (err) { 
      const errorMsg = err.response?.data?.error || err.message;
      alert(`Lỗi thêm món: \n${errorMsg}`); 
    }
  };

  const del = async (id) => {
    if(confirm('Xóa?')) {
      await axios.delete(`http://localhost:5000/api/merchant/products/${id}`);
      fetchData();
    }
  };

  // Cập nhật trạng thái "Hết nguyên liệu" (tạm ẩn) hoặc "Mở bán"
  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'sold_out' ? 'available' : 'sold_out';
      await axios.put(`http://localhost:5000/api/merchant/products/${id}`, { status: newStatus });
      fetchData(); // Load lại data ngay
    } catch(err) { alert('Lỗi cập nhật trạng thái'); }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px' }}>🍲 Quản lý Thực Đơn</h2>
      
      {/* Form thêm món */}
      <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '10px' }}>Thêm món mới</h3>
        <form onSubmit={handleAddProduct} style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input required placeholder="Tên món" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} style={inpStyle} />
          <input required type="number" placeholder="Giá" value={form.price} onChange={e=>setForm({...form, price: e.target.value})} style={inpStyle} />
          <select value={form.categoryId} onChange={e=>setForm({...form, categoryId: e.target.value})} style={inpStyle}>
            <option value="">-- Chọn Danh mục --</option>
            {data.categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <input type="file" onChange={e=>setForm({...form, image: e.target.files[0]})} style={inpStyle} />
          <button type="submit" style={{ backgroundColor: '#10ac84', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Thêm</button>
        </form>
      </div>

      {/* Danh sách */}
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead style={{ backgroundColor: '#f1f2f6' }}>
          <tr>
            <th style={{ padding: '12px' }}>Ảnh</th>
            <th style={{ padding: '12px' }}>Tên món</th>
            <th style={{ padding: '12px' }}>Giá</th>
            <th style={{ padding: '12px' }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {data.products.map(p => (
            <tr key={p._id} style={{ borderBottom: '1px solid #f1f2f6' }}>
              <td style={{ padding: '12px' }}>
                {p.image ? <img src={p.image} alt={p.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px' }} /> : 'No img'}
              </td>
              <td style={{ padding: '12px', fontWeight: '500' }}>{p.name}</td>
              <td style={{ padding: '12px', color: '#ff4757' }}>{p.price.toLocaleString()}đ</td>
              <td style={{ padding: '12px' }}>
                <span style={{ fontSize: '0.8rem', marginRight: '8px', color: p.status === 'sold_out' ? '#e74c3c' : '#2ecc71' }}>
                  {p.status === 'sold_out' ? 'HẾT HÀNG' : 'ĐANG BÁN'}
                </span>
                <button onClick={() => toggleStatus(p._id, p.status)} style={{ backgroundColor: p.status === 'sold_out' ? '#10ac84' : '#ff9f43', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}>
                  {p.status === 'sold_out' ? 'Mở bán' : 'Báo hết'}
                </button>
                <button onClick={() => del(p._id)} style={{ backgroundColor: '#ff4757', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const inpStyle = { padding: '8px', border: '1px solid #ccc', borderRadius: '4px' };
