import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Check, MapPin } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'react-toastify';

const AdminLocations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | { ...location }
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  const fetchLocations = async () => {
    try {
      const res = await axiosInstance.get('/admin/locations');
      if (res.data && res.data.success) setLocations(res.data.locations);
    } catch { toast.error('Lỗi khi tải danh sách địa điểm'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLocations(); }, []);

  const openCreate = () => { setForm({ name: '', description: '' }); setModal('create'); };
  const openEdit = (loc) => { setForm({ name: loc.name, description: loc.description || '' }); setModal(loc); };
  const closeModal = () => setModal(null);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal === 'create') {
        await axiosInstance.post('/admin/locations', form);
        toast.success('Thêm địa điểm thành công!');
      } else {
        await axiosInstance.put(`/admin/locations/${modal._id}`, form);
        toast.success('Cập nhật địa điểm thành công!');
      }
      closeModal();
      fetchLocations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi lưu địa điểm');
    } finally { setSaving(false); }
  };

  const handleToggle = async (id) => {
    try {
      await axiosInstance.put(`/admin/locations/${id}/toggle`);
      fetchLocations();
    } catch { toast.error('Không thể đổi trạng thái'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa địa điểm này vĩnh viễn?')) return;
    try {
      await axiosInstance.delete(`/admin/locations/${id}`);
      toast.success('Xóa địa điểm thành công!');
      fetchLocations();
    } catch (err) { toast.error(err.response?.data?.message || 'Không thể xóa'); }
  };

  if (loading) return <div style={{ padding: '20px', color: '#888' }}>Đang tải...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1a1a2e', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={28} color="#e94560" /> Quản lý Điểm Bán
          </h2>
          <p style={{ color: '#888', margin: '4px 0 0' }}>Tạo các phòng ban khu vực để gán cửa hàng theo địa bàn.</p>
        </div>
        <button onClick={openCreate} style={btnPrimary}>
          <Plus size={18} /> Thêm địa điểm
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {locations.map(loc => (
          <div key={loc._id} style={{
            background: 'white', borderRadius: '12px', padding: '20px', border: `1.5px solid ${loc.isActive ? '#e0e0e0' : '#ffebee'}`,
            boxShadow: '0 4px 15px rgba(0,0,0,0.03)', opacity: loc.isActive ? 1 : 0.6, position: 'relative'
          }}>
            <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', color: '#1a1a2e' }}>{loc.name}</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#666', height: '40px', overflow: 'hidden' }}>{loc.description || 'Không có mô tả'}</p>
            
            <div style={{ margin: '15px 0', paddingTop: '15px', borderTop: '1px solid #eee', fontSize: '0.9rem', color: '#555', display: 'flex', justifyContent: 'space-between' }}>
              <span>Cửa hàng:</span>
              <strong style={{ color: '#e94560' }}>{loc.restaurantCount} địa điểm</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => openEdit(loc)} style={btnIcon('#0f3460', '#e3f2fd')} title="Sửa"><Pencil size={15} /></button>
                <button onClick={() => handleDelete(loc._id)} style={btnIcon('#c62828', '#ffebee')} disabled={loc.restaurantCount > 0} title={loc.restaurantCount > 0 ? "Không thể xóa vì có cửa hàng" : "Xóa"}><Trash2 size={15} opacity={loc.restaurantCount > 0 ? 0.3 : 1} /></button>
              </div>
              <button 
                onClick={() => handleToggle(loc._id)} 
                style={{ ...btnSecondary, background: loc.isActive ? '#e8f5e9' : '#f5f5f5', color: loc.isActive ? '#2e7d32' : '#888', padding: '6px 14px', fontSize: '0.8rem', borderRadius: '20px' }}
              >
                {loc.isActive ? 'Đang hoạt động' : 'Đang Tắt'}
              </button>
            </div>
          </div>
        ))}
        {locations.length === 0 && <p style={{ color: '#aaa', padding: '20px 0' }}>Chưa có địa điểm nào.</p>}
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '28px', width: '400px', maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}>{modal === 'create' ? 'Thêm Địa điểm' : 'Sửa Địa điểm'}</h3>
                <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><X size={22} /></button>
             </div>
             <form onSubmit={handleSave}>
               <div style={{ marginBottom: '16px' }}>
                 <label style={labelStyle}>Tên địa điểm (Tỉnh/Thành phố) *</label>
                 <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={inputStyle} placeholder="VD: TP. HCM, Hà Nội..." />
               </div>
               <div style={{ marginBottom: '24px' }}>
                 <label style={labelStyle}>Mô tả</label>
                 <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{...inputStyle, resize: 'vertical', minHeight: '80px'}} />
               </div>
               <div style={{ display: 'flex', justifyItems: 'flex-end', gap: '10px' }}>
                 <button type="submit" disabled={saving} style={{...btnPrimary, width: '100%', justifyContent: 'center'}}>
                    <Check size={18} /> {saving ? 'Đang lưu...' : 'Lưu lại'}
                 </button>
               </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

const labelStyle = { display: 'block', fontSize: '0.85rem', color: '#555', marginBottom: '6px', fontWeight: 500 };
const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #e0e0e0', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' };
const btnPrimary = { display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg,#e94560,#c0392b)', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' };
const btnSecondary = { border: 'none', cursor: 'pointer', fontWeight: 600 };
const btnIcon = (color, bg) => ({ background: bg, color, border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' });

export default AdminLocations;
