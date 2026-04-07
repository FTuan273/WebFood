import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Image, Upload, Trash2, Power, PowerOff, Plus } from 'lucide-react';

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);

  const [restaurants, setRestaurants] = useState([]);
  const [restaurantSearch, setRestaurantSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchBanners = () => {
    axios.get('http://localhost:5000/api/admin/banners')
      .then(res => {
        if (res.data.success) {
          setBanners(res.data.banners);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { 
    fetchBanners(); 
    axios.get('http://localhost:5000/api/admin/restaurants/active')
      .then(res => { if (res.data.success) setRestaurants(res.data.restaurants || []) })
      .catch(console.error);
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setImageUrl(''); // Xoá link cũ nếu có chọn file
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || (!imageFile && !imageUrl)) {
      alert('Vui lòng nhập tên chiến dịch và cung cấp hình ảnh (Upload hoặc Link)!');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    if (link) formData.append('link', link);
    
    if (imageFile) {
      formData.append('image', imageFile);
    } else {
      formData.append('imageUrl', imageUrl);
    }

    try {
      await axios.post('http://localhost:5000/api/admin/banners', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setTitle(''); setLink(''); setRestaurantSearch(''); setImageUrl(''); setImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = null;
      fetchBanners();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi thêm Banner mới');
    }
  };

  const toggleStatus = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/banners/${id}/toggle`);
      fetchBanners();
    } catch (err) { console.error(err); }
  };

  const deleteBanner = async (id) => {
    if (window.confirm('Chắc chắn xoá banner này chứ?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/banners/${id}`);
        fetchBanners();
      } catch (err) { console.error(err); }
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '2rem', marginBottom: '20px', color: '#2f3542', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Image size={32} color="#ff4757" /> Quản lý Banner
      </h2>

      {/* Upload Form */}
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '15px', marginBottom: '30px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
        <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}><Plus size={20} /> Thêm Banner Mới</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label style={labelStyle}>Tên Chiến Dịch Quảng Cáo *</label>
            <input type="text" value={title} onChange={e=>setTitle(e.target.value)} style={inputStyle} placeholder="VD: Khuyến mãi Siêu Lớn 8/3" />
            
            <label style={{...labelStyle, marginTop:'15px'}}>Đường Dẫn Chuyển Tiếp (Tùy chọn)</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                value={restaurantSearch || link} 
                onChange={e => {
                  setRestaurantSearch(e.target.value);
                  setLink(e.target.value); // Cho phép nhập tay link
                  setShowDropdown(true);
                }} 
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                style={inputStyle} 
                placeholder="Tìm tên quán hoặc dán URL..." 
              />
              {showDropdown && restaurants.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '8px', maxHeight: '180px', overflowY: 'auto', zIndex: 10, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginTop: '4px' }}>
                  {restaurants.filter(r => r.name.toLowerCase().includes(restaurantSearch.toLowerCase())).map(r => (
                    <div 
                      key={r._id} 
                      style={{ padding: '10px 15px', cursor: 'pointer', borderBottom: '1px solid #f1f2f6', transition: 'background-color 0.2s' }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      onMouseDown={() => {
                        setRestaurantSearch(r.name);
                        setLink(`/restaurant/${r._id}`);
                        setShowDropdown(false);
                      }}
                    >
                      🍔 {r.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div>
            <label style={labelStyle}>Tải ảnh lên từ máy tính (Tối đa 5MB)</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} style={{ padding: '8px 0' }} />
            </div>

            <p style={{ textAlign: 'center', margin: '10px 0', color: '#888', fontSize: '0.9rem' }}>HOẶC</p>

            <label style={labelStyle}>Dán Link Ảnh Trực Tiếp</label>
            <input 
              type="text" 
              value={imageUrl} 
              onChange={e => { setImageUrl(e.target.value); setImageFile(null); if(fileInputRef.current) fileInputRef.current.value = null; }} 
              style={inputStyle} 
              placeholder="https://example.com/banner.jpg" 
              disabled={!!imageFile}
            />
          </div>

          <div style={{ gridColumn: 'span 2', textAlign: 'right' }}>
            <button type="submit" style={{ padding: '12px 30px', backgroundColor: '#EE4D2D', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              + Đăng Tải Banner
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div style={{ backgroundColor: '#fff', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #f1f2f6', textAlign: 'left' }}>
              <th style={thStyle}>Hình Ảnh</th>
              <th style={thStyle}>Tên Chiến Dịch</th>
              <th style={thStyle}>Trạng thái hiển thị</th>
              <th style={thStyle}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="4" style={{padding:'20px', textAlign:'center'}}>Đang tải...</td></tr> : 
             banners.length === 0 ? <tr><td colSpan="4" style={{padding:'20px', textAlign:'center'}}>Chưa có banner nào</td></tr> :
             banners.map(b => (
               <tr key={b._id} style={{ borderBottom: '1px solid #f1f2f6' }}>
                  <td style={tdStyle}>
                    <img src={b.imageUrl} alt={b.title} style={{ height: '60px', width: '140px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }} />
                  </td>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 'bold', color: '#2f3542', fontSize: '1.1rem' }}>{b.title}</div>
                    {b.link && <div style={{ fontSize: '0.85rem', color: '#0984e3', marginTop: '4px' }}>Chuyển hướng: {b.link}</div>}
                  </td>
                  <td style={tdStyle}>
                    <span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', backgroundColor: b.isActive ? '#e3fbe3' : '#ffe1e1', color: b.isActive ? '#2ed573' : '#ff4757' }}>
                      {b.isActive ? 'ĐANG HIỂN THỊ' : 'ĐÃ ẨN'}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => toggleStatus(b._id)} style={{ padding: '8px', backgroundColor: b.isActive ? '#ff4757' : '#2ed573', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        {b.isActive ? <PowerOff size={16} title="Ẩn Banner" /> : <Power size={16} title="Hiển thị Banner" />}
                      </button>
                      <button onClick={() => deleteBanner(b._id)} style={{ padding: '8px', backgroundColor: '#fff', border: '1px solid #ff4757', color: '#ff4757', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const thStyle = { padding: '15px 20px', color: '#7f8c8d', fontWeight: '600' };
const tdStyle = { padding: '15px 20px', verticalAlign: 'middle' };
const labelStyle = { display: 'block', fontSize: '0.95rem', fontWeight: 600, color: '#2f3542', marginBottom: '8px' };
const inputStyle = { width: '100%', padding: '10px 15px', borderRadius: '8px', border: '1px solid #ced6e0', outline: 'none', fontSize: '1rem' };

export default AdminBanners;
