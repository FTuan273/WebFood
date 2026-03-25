import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/admin/categories';

const PRESET_CATEGORIES = [
  { name: 'Cơm', icon: '🍚' },
  { name: 'Bún - Phở', icon: '🍜' },
  { name: 'Trà sữa', icon: '🧋' },
  { name: 'Cà phê', icon: '☕' },
  { name: 'Ăn vặt', icon: '🍿' },
  { name: 'Bánh mì', icon: '🥖' },
  { name: 'Bánh ngọt', icon: '🍰' },
  { name: 'Đồ uống', icon: '🥤' },
  { name: 'Lẩu', icon: '🍲' },
  { name: 'Nước ép', icon: '🍹' },
];

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form tạo mới
  const [form, setForm] = useState({ name: '', icon: '🍽️', description: '' });
  const [formError, setFormError] = useState('');

  // Trạng thái chỉnh sửa
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', icon: '', description: '' });

  // ── Fetch ──────────────────────────────────────────────
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setCategories(res.data.categories || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  // ── Create ─────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setFormError('Vui lòng nhập tên danh mục!'); return; }
    setFormError('');
    setSubmitting(true);
    try {
      await axios.post(API_URL, form);
      setForm({ name: '', icon: '🍽️', description: '' });
      fetchCategories();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Lỗi tạo danh mục');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Update ─────────────────────────────────────────────
  const handleUpdate = async (id) => {
    try {
      await axios.put(`${API_URL}/${id}`, editForm);
      setEditId(null);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi cập nhật');
    }
  };

  // ── Toggle ─────────────────────────────────────────────
  const handleToggle = async (id) => {
    try {
      await axios.put(`${API_URL}/${id}/toggle`);
      fetchCategories();
    } catch { /* silent */ }
  };

  // ── Delete ─────────────────────────────────────────────
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xóa danh mục "${name}"?`)) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchCategories();
    } catch { /* silent */ }
  };

  // ── Quick Add Preset ───────────────────────────────────
  const handlePreset = async (preset) => {
    try {
      await axios.post(API_URL, { ...preset, description: '' });
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi');
    }
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#2f3542' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700 }}>
          🏷️ Quản lý Danh mục Món ăn
        </h2>
        <p style={{ margin: '6px 0 0', color: '#747d8c', fontSize: '0.95rem' }}>
          Tạo các danh mục lớn để các quán phân loại món ăn của mình.
        </p>
      </div>

      {/* Form tạo mới */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>➕ Thêm danh mục mới</h3>
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={styles.field}>
            <label style={styles.label}>Icon</label>
            <input
              type="text"
              value={form.icon}
              onChange={e => setForm({ ...form, icon: e.target.value })}
              style={{ ...styles.input, width: 70, textAlign: 'center', fontSize: '1.4rem' }}
              placeholder="🍽️"
              maxLength={4}
            />
          </div>
          <div style={{ ...styles.field, flex: 1, minWidth: 180 }}>
            <label style={styles.label}>Tên danh mục <span style={{ color: '#ff4757' }}>*</span></label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              style={styles.input}
              placeholder="VD: Cơm, Trà sữa, Ăn vặt..."
            />
          </div>
          <div style={{ ...styles.field, flex: 2, minWidth: 200 }}>
            <label style={styles.label}>Mô tả</label>
            <input
              type="text"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              style={styles.input}
              placeholder="Mô tả ngắn (tùy chọn)"
            />
          </div>
          <button type="submit" disabled={submitting} style={styles.btnPrimary}>
            {submitting ? '...' : 'Thêm danh mục'}
          </button>
        </form>
        {formError && <p style={{ color: '#ff4757', marginTop: 8, fontSize: '0.9rem' }}>⚠️ {formError}</p>}

        {/* Preset nhanh */}
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: '0.85rem', color: '#747d8c', marginBottom: 8 }}>⚡ Thêm nhanh:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {PRESET_CATEGORIES.map(p => (
              <button key={p.name} onClick={() => handlePreset(p)} style={styles.btnPreset}>
                {p.icon} {p.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Danh sách */}
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={styles.cardTitle}>📋 Danh sách ({categories.length})</h3>
          <span style={{ fontSize: '0.85rem', color: '#747d8c' }}>
            ✅ {categories.filter(c => c.isActive).length} hoạt động &nbsp;·&nbsp;
            ⛔ {categories.filter(c => !c.isActive).length} ẩn
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#747d8c' }}>Đang tải...</div>
        ) : categories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#747d8c' }}>
            <div style={{ fontSize: '3rem' }}>🗂️</div>
            <p>Chưa có danh mục nào. Hãy tạo danh mục đầu tiên!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {categories.map(cat => (
              <div key={cat._id} style={{
                ...styles.categoryCard,
                opacity: cat.isActive ? 1 : 0.6,
                borderLeft: `4px solid ${cat.isActive ? '#2ed573' : '#a4b0be'}`
              }}>
                {editId === cat._id ? (
                  // ── Edit Mode ──
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        value={editForm.icon}
                        onChange={e => setEditForm({ ...editForm, icon: e.target.value })}
                        style={{ ...styles.inputSm, width: 55, textAlign: 'center', fontSize: '1.2rem' }}
                        maxLength={4}
                      />
                      <input
                        value={editForm.name}
                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                        style={{ ...styles.inputSm, flex: 1 }}
                        placeholder="Tên danh mục"
                      />
                    </div>
                    <input
                      value={editForm.description}
                      onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                      style={styles.inputSm}
                      placeholder="Mô tả"
                    />
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => handleUpdate(cat._id)} style={styles.btnSave}>💾 Lưu</button>
                      <button onClick={() => setEditId(null)} style={styles.btnCancel}>Hủy</button>
                    </div>
                  </div>
                ) : (
                  // ── View Mode ──
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: '2rem' }}>{cat.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '1rem' }}>{cat.name}</div>
                        {cat.description && (
                          <div style={{ fontSize: '0.8rem', color: '#747d8c', marginTop: 2 }}>{cat.description}</div>
                        )}
                      </div>
                      <span style={{
                        fontSize: '0.75rem', fontWeight: 600, padding: '3px 8px',
                        borderRadius: 20,
                        backgroundColor: cat.isActive ? '#d1fae5' : '#f1f2f6',
                        color: cat.isActive ? '#059669' : '#747d8c'
                      }}>
                        {cat.isActive ? 'Hoạt động' : 'Đã ẩn'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 12, justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => { setEditId(cat._id); setEditForm({ name: cat.name, icon: cat.icon, description: cat.description }); }}
                        style={styles.btnEdit}
                      >✏️ Sửa</button>
                      <button onClick={() => handleToggle(cat._id)} style={styles.btnToggle}>
                        {cat.isActive ? '⛔ Ẩn' : '✅ Hiện'}
                      </button>
                      <button onClick={() => handleDelete(cat._id, cat.name)} style={styles.btnDelete}>🗑️</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = {
  card: {
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    padding: '24px',
    marginBottom: 24,
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  },
  cardTitle: { margin: '0 0 16px', fontWeight: 700, fontSize: '1rem', color: '#2f3542' },
  field: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: { fontSize: '0.8rem', fontWeight: 600, color: '#57606f' },
  input: {
    padding: '10px 14px', border: '1.5px solid #dfe4ea', borderRadius: 8,
    fontSize: '0.95rem', outline: 'none', transition: 'border 0.2s',
    fontFamily: 'Inter, sans-serif', width: '100%', boxSizing: 'border-box'
  },
  inputSm: {
    padding: '8px 10px', border: '1.5px solid #dfe4ea', borderRadius: 6,
    fontSize: '0.88rem', outline: 'none', width: '100%', boxSizing: 'border-box',
    fontFamily: 'Inter, sans-serif'
  },
  btnPrimary: {
    padding: '10px 20px', backgroundColor: '#ff4757', color: '#fff',
    border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer',
    fontSize: '0.9rem', whiteSpace: 'nowrap'
  },
  btnPreset: {
    padding: '6px 14px', backgroundColor: '#f1f2f6', color: '#2f3542',
    border: 'none', borderRadius: 20, fontSize: '0.85rem', cursor: 'pointer',
    transition: 'background 0.2s'
  },
  categoryCard: {
    backgroundColor: '#fafafa', borderRadius: 10, padding: 16,
    border: '1px solid #e2e8f0', transition: 'box-shadow 0.2s'
  },
  btnEdit: {
    padding: '5px 10px', fontSize: '0.8rem', borderRadius: 6,
    border: '1px solid #dfe4ea', backgroundColor: '#f1f2f6',
    cursor: 'pointer', color: '#2f3542'
  },
  btnToggle: {
    padding: '5px 10px', fontSize: '0.8rem', borderRadius: 6,
    border: '1px solid #dfe4ea', backgroundColor: '#f1f2f6',
    cursor: 'pointer', color: '#2f3542'
  },
  btnDelete: {
    padding: '5px 10px', fontSize: '0.8rem', borderRadius: 6,
    border: '1px solid #ffd0d3', backgroundColor: '#fff5f5',
    cursor: 'pointer', color: '#ff4757'
  },
  btnSave: {
    padding: '6px 12px', fontSize: '0.82rem', borderRadius: 6,
    backgroundColor: '#2ed573', border: 'none', color: '#fff',
    cursor: 'pointer', fontWeight: 600
  },
  btnCancel: {
    padding: '6px 12px', fontSize: '0.82rem', borderRadius: 6,
    backgroundColor: '#f1f2f6', border: 'none', color: '#2f3542',
    cursor: 'pointer'
  }
};

export default Categories;
