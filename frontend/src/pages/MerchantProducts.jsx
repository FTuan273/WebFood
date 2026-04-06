import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'react-toastify';

// ── Giá trị mặc định khi tạo/sửa món ──────────────────────────────────────
const EMPTY_FORM = { name: '', price: '', description: '', image: '', status: 'available' };

const MerchantProducts = () => {
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(null);   // null | 'create' | { ...product }
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [imageFile, setImageFile] = useState(null);      // File object chọn từ máy
  const [imagePreview, setImagePreview] = useState(''); // URL blob để preview

  // ── Tải danh sách món ───────────────────────────────────────────────────
  const fetchProducts = async () => {
    try {
      const res = await axiosInstance.get('/merchant/products');
      setProducts(res.data.products);
    } catch { toast.error('Không thể tải danh sách món ăn'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  // ── Mở modal ────────────────────────────────────────────────────────────
  const openCreate = () => { setForm(EMPTY_FORM); setImageFile(null); setImagePreview(''); setModal('create'); };
  const openEdit   = (p) => {
    setForm({ name: p.name, price: p.price, description: p.description, image: p.image, status: p.status });
    setImageFile(null);
    // Ảnh cũ từ DB: nếu là path /uploads/... thì prefix backend URL
    setImagePreview(p.image ? (p.image.startsWith('http') ? p.image : `http://localhost:5000${p.image}`) : '');
    setModal(p);
  };
  const closeModal = () => setModal(null);

  // ── Chọn file ảnh → tạo preview ngay lập tức ────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file)); // preview local, không cần upload ngay
  };

  // ── Lưu (Tạo hoặc Cập nhật) ─────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let imageUrl = form.image; // Mặc định giữ nguyên ảnh cũ

      // Nếu có file mới → upload trước, lấy URL
      if (imageFile) {
        const fd = new FormData();
        fd.append('image', imageFile);
        const uploadRes = await axiosInstance.post('/merchant/upload-image', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        imageUrl = uploadRes.data.url; // VD: /uploads/1234567890-123456.jpg
      }

      const payload = { ...form, price: Number(form.price), image: imageUrl };
      if (modal === 'create') {
        await axiosInstance.post('/merchant/products', payload);
        toast.success('Đã thêm món mới!');
      } else {
        await axiosInstance.put(`/merchant/products/${modal._id}`, payload);
        toast.success('Đã cập nhật món!');
      }
      closeModal();
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi lưu');
    } finally { setSaving(false); }
  };

  // ── Xoá ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xoá món này?')) return;
    try {
      await axiosInstance.delete(`/merchant/products/${id}`);
      toast.success('Đã xoá món!');
      fetchProducts();
    } catch { toast.error('Không thể xoá'); }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) return <div style={{ padding: '20px', color: '#888' }}>Đang tải...</div>;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Thực đơn</h2>
          <p style={{ color: '#888', margin: '4px 0 0' }}>{products.length} món ăn</p>
        </div>
        <button onClick={openCreate} style={btnPrimary}>
          <Plus size={18} /> Thêm món
        </button>
      </div>

      {/* Product Table */}
      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#aaa', background: 'white', borderRadius: '14px' }}>
          Chưa có món ăn nào. Nhấn <strong>Thêm món</strong> để bắt đầu!
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                {['Ảnh', 'Tên món', 'Giá (₫)', 'Trạng thái', 'Thao tác'].map(h => (
                  <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.8rem', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={p._id} style={{ borderTop: '1px solid #f0f0f0', backgroundColor: i % 2 === 0 ? 'white' : '#fafafa' }}>
                  <td style={{ padding: '12px 16px' }}>
                    {p.image
                      ? <img
                          src={p.image.startsWith('http') ? p.image : `http://localhost:5000${p.image}`}
                          alt={p.name}
                          style={{ width: 52, height: 52, borderRadius: 8, objectFit: 'cover' }}
                        />
                      : <div style={{ width: 52, height: 52, borderRadius: 8, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>🍽️</div>
                    }
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#1a1a2e' }}>{p.name}</div>
                    <div style={{ fontSize: '0.82rem', color: '#aaa', marginTop: '2px' }}>{p.description || '(Không có mô tả)'}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#e94560' }}>
                    {p.price.toLocaleString('vi-VN')}₫
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600,
                      backgroundColor: p.status === 'available' ? '#e8f5e9' : '#fce4ec',
                      color: p.status === 'available' ? '#2e7d32' : '#c62828'
                    }}>
                      {p.status === 'available' ? '✓ Còn hàng' : '✗ Hết hàng'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => openEdit(p)} style={btnIcon('#0f3460', '#e3f2fd')}>
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleDelete(p._id)} style={btnIcon('#c62828', '#fce4ec')}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Thêm/Sửa */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '28px', width: '480px', maxWidth: '95vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontWeight: 700, color: '#1a1a2e' }}>
                {modal === 'create' ? '➕ Thêm món mới' : '✏️ Sửa món ăn'}
              </h3>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><X size={22} /></button>
            </div>

            <form onSubmit={handleSave}>
              {/* Tên món */}
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Tên món *</label>
                <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} />
              </div>

              {/* Giá */}
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Giá (₫) *</label>
                <input type="number" required min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} style={inputStyle} />
              </div>

              {/* Mô tả */}
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Mô tả</label>
                <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={inputStyle} />
              </div>

              {/* Upload ảnh từ máy */}
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Ảnh món ăn</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'block', width: '100%', padding: '8px', border: '1.5px dashed #ccc', borderRadius: '8px', cursor: 'pointer', boxSizing: 'border-box' }}
                />
                {/* Preview ảnh (file mới hoặc ảnh cũ từ DB) */}
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="preview"
                    style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', marginTop: '10px' }}
                  />
                )}
              </div>

              {/* Trạng thái */}
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Trạng thái</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={inputStyle}>
                  <option value="available">Còn hàng</option>
                  <option value="sold_out">Hết hàng</option>
                </select>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={closeModal} style={btnSecondary}>Huỷ</button>
                <button type="submit" disabled={saving} style={btnPrimary}>
                  <Check size={16} /> {saving ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Styles nhỏ ─────────────────────────────────────────────────────────────
const labelStyle = { display: 'block', fontSize: '0.85rem', color: '#555', marginBottom: '6px', fontWeight: 500 };
const btnPrimary = {
  display: 'flex', alignItems: 'center', gap: '6px',
  background: 'linear-gradient(135deg,#e94560,#c0392b)',
  color: 'white', border: 'none', borderRadius: '10px',
  padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem'
};
const btnSecondary = {
  background: '#f0f0f0', color: '#555', border: 'none',
  borderRadius: '10px', padding: '10px 20px', cursor: 'pointer', fontWeight: 600
};
const btnIcon = (color, bg) => ({
  background: bg, color, border: 'none', borderRadius: '8px',
  padding: '7px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center'
});
const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: '8px',
  border: '1.5px solid #e0e0e0', fontSize: '0.9rem',
  outline: 'none', boxSizing: 'border-box', transition: 'border 0.2s'
};

export default MerchantProducts;
