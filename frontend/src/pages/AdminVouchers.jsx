import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Gift, Plus, Trash2, Send } from 'lucide-react';

const AdminVouchers = () => {
  const [vouchers, setVouchers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENT',
    discountValue: '',
    minOrderValue: 0,
    maxDiscount: 0,
    description: '',
    expiresAt: ''
  });

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/admin/vouchers');
      if (data.success) {
        setVouchers(data.vouchers);
      }
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu Vouchers');
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post('http://localhost:5000/api/admin/vouchers', formData);
      if (data.success) {
        toast.success(data.message);
        setShowModal(false);
        setFormData({
          code: '', discountType: 'PERCENT', discountValue: '', minOrderValue: 0, maxDiscount: 0, description: '', expiresAt: ''
        });
        fetchVouchers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc xoá Voucher này không?')) return;
    try {
      const { data } = await axios.delete(`http://localhost:5000/api/admin/vouchers/${id}`);
      if (data.success) {
        toast.success(data.message);
        fetchVouchers();
      }
    } catch (err) {
      toast.error('Lỗi xoá Voucher');
    }
  };

  const handlePublish = async (id) => {
    if (!window.confirm('Bạn có chắc muốn BÁO ĐỘNG toàn server về Voucher này?')) return;
    try {
      const { data } = await axios.post(`http://localhost:5000/api/admin/vouchers/${id}/publish`);
      if (data.success) {
        toast.success(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi phát hành Voucher');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Gift size={28} color="#ff4757" /> Quản Lý Vouchers Toàn Sàn
        </h2>
        <button 
          onClick={() => setShowModal(true)} 
          style={{ padding: '10px 15px', backgroundColor: '#ff4757', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
          <Plus size={18} /> Tạo Voucher Mới
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {vouchers.map(v => (
          <div key={v._id} style={{ border: '1px solid #dfe4ea', borderRadius: '12px', padding: '20px', backgroundColor: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, backgroundColor: v.isActive ? '#2ed573' : '#ff4757', color: 'white', padding: '5px 15px', borderBottomLeftRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
              {v.isActive ? 'ACTIVE' : 'INACTIVE'}
            </div>
            
            <h3 style={{ margin: '0 0 10px 0', color: '#2f3542', fontSize: '1.5rem', letterSpacing: '1px' }}>{v.code}</h3>
            <p style={{ color: '#747d8c', margin: '0 0 15px 0', fontSize: '0.9rem' }}>{v.description}</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', fontSize: '0.9rem', color: '#57606f' }}>
              <div><strong>Giảm:</strong> {v.discountType === 'PERCENT' ? `${v.discountValue}%` : `${v.discountValue.toLocaleString()}đ`}</div>
              <div><strong>Tối đa lên tới:</strong> {v.maxDiscount > 0 ? `${v.maxDiscount.toLocaleString()}đ` : 'Không giới hạn'}</div>
              <div><strong>Thời hạn:</strong> {new Date(v.expiresAt).toLocaleDateString()}</div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => handlePublish(v._id)}
                disabled={!v.isActive}
                style={{ flex: 1, padding: '10px', backgroundColor: v.isActive ? '#1e90ff' : '#a4b0be', color: 'white', border: 'none', borderRadius: '8px', cursor: v.isActive ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontWeight: 'bold' }}>
                <Send size={16} /> Phát hành ngay
              </button>
              <button 
                onClick={() => handleDelete(v._id)}
                style={{ padding: '10px', backgroundColor: '#fff', color: '#ff4757', border: '1px solid #ff4757', borderRadius: '8px', cursor: 'pointer' }}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '400px', maxWidth: '90%' }}>
            <h3 style={{ marginTop: 0, color: '#2f3542' }}>Tạo Mới Voucher</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              <input required type="text" name="code" value={formData.code} onChange={handleInputChange} placeholder="Mã Code (vd: FREESHIP)" style={inputStyle} />
              <input required type="text" name="description" value={formData.description} onChange={handleInputChange} placeholder="Mô tả ưu đãi" style={inputStyle} />
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <select name="discountType" value={formData.discountType} onChange={handleInputChange} style={{ ...inputStyle, flex: 1 }}>
                  <option value="PERCENT">Phần Trăm (%)</option>
                  <option value="FIXED">Số tiền (VNĐ)</option>
                </select>
                <input required type="number" name="discountValue" value={formData.discountValue} onChange={handleInputChange} placeholder="Mức giảm" style={{ ...inputStyle, flex: 2 }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: '#57606f', marginBottom: '5px' }}>Giá trị đơn hàng tối thiểu (VNĐ)</label>
                <input type="number" name="minOrderValue" value={formData.minOrderValue} onChange={handleInputChange} placeholder="VD: 50000 - Để 0 nếu không giới hạn" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: '#57606f', marginBottom: '5px' }}>Số tiền giảm tối đa (VNĐ)</label>
                <input type="number" name="maxDiscount" value={formData.maxDiscount} onChange={handleInputChange} placeholder="VD: 100000 - Để 0 nếu không giới hạn" style={inputStyle} />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: '#57606f', marginBottom: '5px' }}>Hạn sử dụng</label>
                <input required type="date" name="expiresAt" value={formData.expiresAt} onChange={handleInputChange} style={inputStyle} />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '10px', backgroundColor: '#f1f2f6', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Huỷ</button>
                <button type="submit" disabled={loading} style={{ flex: 1, padding: '10px', backgroundColor: '#ff4757', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                  {loading ? 'Đang lưu...' : 'Lưu Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const inputStyle = {
  padding: '12px 15px',
  border: '1px solid #dfe4ea',
  borderRadius: '8px',
  fontSize: '1rem',
  width: '100%',
  boxSizing: 'border-box'
};

export default AdminVouchers;
