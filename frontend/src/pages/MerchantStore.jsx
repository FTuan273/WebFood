import React, { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'react-toastify';

const MerchantStore = () => {
  const [form, setForm]           = useState({ name: '', address: '', description: '', openingHours: '', image: '' });
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [status, setStatus]       = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    axiosInstance.get('/merchant/restaurant').then(res => {
      const r = res.data.restaurant;
      setForm({ name: r.name, address: r.address, description: r.description || '', openingHours: r.openingHours, image: r.image || '' });
      setStatus(r.status);
      if (r.image) setImagePreview(r.image.startsWith('http') ? r.image : `http://localhost:5000${r.image}`);
    }).catch(() => toast.error('Không tải được thông tin quán'))
      .finally(() => setLoading(false));
  }, []);

  // Chọn file → preview ngay
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let imageUrl = form.image;

      // Nếu có file mới → upload trước
      if (imageFile) {
        const fd = new FormData();
        fd.append('image', imageFile);
        const res = await axiosInstance.post('/merchant/upload-image', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        imageUrl = res.data.url;
      }

      await axiosInstance.put('/merchant/restaurant', { ...form, image: imageUrl });
      toast.success('Đã cập nhật thông tin quán!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi lưu');
    } finally { setSaving(false); }
  };

  const statusMap = { pending: '⏳ Chờ duyệt', approved: '✅ Đã duyệt', rejected: '❌ Bị từ chối', locked: '🔒 Bị khoá' };

  if (loading) return <div style={{ padding: 20, color: '#888' }}>Đang tải...</div>;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Thông tin quán</h2>
        <p style={{ color: '#888', margin: '4px 0 0' }}>
          Trạng thái: <strong>{statusMap[status] || status}</strong>
        </p>
      </div>

      <div style={{ background: 'white', borderRadius: 14, padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', maxWidth: 600 }}>
        <form onSubmit={handleSave}>

          {/* Tên quán */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Tên quán *</label>
            <input type="text" required value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} />
          </div>

          {/* Địa chỉ */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Địa chỉ *</label>
            <input type="text" required value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))} style={inputStyle} />
          </div>

          {/* Giờ hoạt động */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Giờ hoạt động</label>
            <input type="text" placeholder="VD: 08:00 - 22:00" value={form.openingHours}
              onChange={e => setForm(f => ({ ...f, openingHours: e.target.value }))} style={inputStyle} />
          </div>

          {/* Ảnh bìa — upload file */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Ảnh bìa quán</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'block', width: '100%', padding: '8px', border: '1.5px dashed #ccc', borderRadius: 8, cursor: 'pointer', boxSizing: 'border-box' }}
            />
            {imagePreview && (
              <img src={imagePreview} alt="preview"
                style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 8, marginTop: 10 }} />
            )}
          </div>

          {/* Mô tả */}
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Mô tả quán</label>
            <textarea rows={3} value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          <button type="submit" disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#e94560,#c0392b)', color: 'white', border: 'none', borderRadius: 10, padding: '11px 24px', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem' }}>
            <Save size={18} /> {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </form>
      </div>
    </div>
  );
};

const labelStyle = { display: 'block', fontSize: '0.85rem', color: '#555', marginBottom: 6, fontWeight: 500 };
const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #e0e0e0', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' };

export default MerchantStore;
