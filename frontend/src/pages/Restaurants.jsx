import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Check, X, Building, Lock, Unlock, Eye, MapPin, Phone, Mail, User, FileText, Camera } from 'lucide-react';

const Restaurants = () => {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'active'
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State cho Reject
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRejectId, setSelectedRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchRestaurants = () => {
    setLoading(true);
    const endpoint = activeTab === 'pending' 
      ? 'http://localhost:5000/api/admin/restaurants/pending'
      : 'http://localhost:5000/api/admin/restaurants/active';

    axios.get(endpoint)
      .then(res => {
        setRestaurants(res.data.restaurants);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRestaurants();
  }, [activeTab]);

  const updateStatus = (id, status, reason = '') => {
    let confirmMsg = '';
    if (status === 'approved') confirmMsg = 'Bạn có chắc chắn muốn DUYỆT quán ăn này?';
    if (status === 'locked') confirmMsg = 'Bạn có chắc chắn muốn KHÓA quán ăn này?';
    if (status === 'active' || status === 'approved' && activeTab === 'active') confirmMsg = 'Bạn có chắc chắn muốn MỞ KHÓA quán ăn này?'; // Khi ở tab active, unlock đổi status lại thành approved

    if (status === 'rejected' || window.confirm(confirmMsg)) {
      const payload = { status };
      if (reason) payload.rejectReason = reason;

      axios.put(`http://localhost:5000/api/admin/restaurants/${id}/status`, payload)
        .then(() => {
          setShowRejectModal(false);
          setRejectReason('');
          fetchRestaurants();
        })
        .catch(console.error);
    }
  };

  const handleOpenRejectModal = (id) => {
    setSelectedRejectId(id);
    setShowRejectModal(true);
  };

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) {
      alert("Vui lòng nhập lý do từ chối!");
      return;
    }
    updateStatus(selectedRejectId, 'rejected', rejectReason);
  };

  const renderPendingTab = () => {
    if (restaurants.length === 0 && !loading) {
      return (
        <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#f8f9fa', borderRadius: '15px', border: '2px dashed #ced6e0' }}>
          <Building size={60} color="#b2bec3" style={{ marginBottom: '15px' }} />
          <h3 style={{ color: '#636e72', margin: 0 }}>Không có quán ăn nào chờ duyệt</h3>
          <p style={{ color: '#b2bec3', marginTop: '10px' }}>Hệ thống đã xử lý hết các yêu cầu.</p>
        </div>
      );
    }

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '25px' }}>
        {restaurants.map(res => (
          <div key={res._id} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 8px 30px rgba(0,0,0,0.06)', border: '1px solid #f1f2f6', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '15px' }}>
              <div>
                <h3 style={{ color: '#2f3542', margin: '0 0 8px 0', fontSize: '1.4rem' }}>{res.name}</h3>
                <div style={{ color: '#7f8c8d', fontSize: '0.9rem', lineHeight: '1.4', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <MapPin size={14} /> {res.address}
                </div>
              </div>
              <span style={{ padding: '6px 12px', backgroundColor: '#fff3cd', color: '#f39c12', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                PENDING
              </span>
            </div>
            
            <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '10px', marginBottom: '15px', fontSize: '0.95rem', color: '#57606f', borderLeft: '4px solid #0984e3' }}>
              <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}><User size={16} color="#0984e3"/> <strong>Đại diện:</strong> {res.ownerId?.name || 'Không rõ'}</div>
              <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={16} color="#0984e3"/> <strong>Email:</strong> {res.ownerId?.email || 'Không rõ'}</div>
              {res.ownerId?.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={16} color="#0984e3"/> <strong>SĐT:</strong> {res.ownerId.phone}</div>}
            </div>

            {/* Placeholder GPKD / CCCD */}
            <div style={{ marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ backgroundColor: '#f1f2f6', height: '100px', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#747d8c', border: '1px dashed #ced6e0' }}>
                <FileText size={24} style={{ marginBottom: '5px' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: '500' }}>Giấy Phép KD</span>
              </div>
              <div style={{ backgroundColor: '#f1f2f6', height: '100px', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#747d8c', border: '1px dashed #ced6e0' }}>
                <Camera size={24} style={{ marginBottom: '5px' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: '500' }}>CCCD / CMND</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', marginTop: 'auto' }}>
              <button 
                onClick={() => updateStatus(res._id, 'approved')}
                style={{ flex: 1, padding: '12px', backgroundColor: '#2ed573', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'filter 0.2s', fontSize: '1rem' }}
                onMouseOver={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                onMouseOut={e => e.currentTarget.style.filter = 'brightness(1)'}
              >
                <Check size={20} /> Duyệt
              </button>
              <button 
                onClick={() => handleOpenRejectModal(res._id)}
                style={{ flex: 1, padding: '12px', backgroundColor: '#ff4757', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'filter 0.2s', fontSize: '1rem' }}
                onMouseOver={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                onMouseOut={e => e.currentTarget.style.filter = 'brightness(1)'}
              >
                <X size={20} /> Từ Chối
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderActiveTab = () => {
    if (restaurants.length === 0 && !loading) {
      return (
        <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#f8f9fa', borderRadius: '15px', border: '2px dashed #ced6e0' }}>
          <Building size={60} color="#b2bec3" style={{ marginBottom: '15px' }} />
          <h3 style={{ color: '#636e72', margin: 0 }}>Chưa có nhà hàng nào đang hoạt động</h3>
        </div>
      );
    }

    return (
      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #f1f2f6' }}>
            <tr>
              <th style={{ padding: '15px 20px', color: '#2f3542', fontWeight: '600' }}>Tên quán</th>
              <th style={{ padding: '15px 20px', color: '#2f3542', fontWeight: '600' }}>Chủ quán</th>
              <th style={{ padding: '15px 20px', color: '#2f3542', fontWeight: '600' }}>Tham gia</th>
              <th style={{ padding: '15px 20px', color: '#2f3542', fontWeight: '600', textAlign: 'center' }}>Đơn hàng</th>
              <th style={{ padding: '15px 20px', color: '#2f3542', fontWeight: '600', textAlign: 'center' }}>Đánh giá</th>
              <th style={{ padding: '15px 20px', color: '#2f3542', fontWeight: '600', textAlign: 'center' }}>Trạng thái</th>
              <th style={{ padding: '15px 20px', color: '#2f3542', fontWeight: '600', textAlign: 'center' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {restaurants.map((res, index) => (
              <tr key={res._id} style={{ borderBottom: '1px solid #f1f2f6', backgroundColor: index % 2 === 0 ? 'white' : '#fafbfc' }}>
                <td style={{ padding: '15px 20px', fontWeight: '500', color: '#2b2bdc' }}>{res.name}</td>
                <td style={{ padding: '15px 20px', color: '#57606f' }}>{res.ownerId?.name || 'Không rõ'}</td>
                <td style={{ padding: '15px 20px', color: '#57606f' }}>
                  {new Date(res.createdAt).toLocaleDateString('vi-VN')}
                </td>
                <td style={{ padding: '15px 20px', textAlign: 'center', fontWeight: '600', color: '#2ed573' }}>
                  {res.totalCompletedOrders || 0}
                </td>
                <td style={{ padding: '15px 20px', textAlign: 'center', color: '#f1c40f', fontWeight: 'bold' }}>
                  {res.averageRating || 'N/A'} ⭐
                </td>
                <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                  {res.status === 'locked' ? (
                    <span style={{ padding: '5px 10px', backgroundColor: '#ffeaa7', color: '#d63031', borderRadius: '15px', fontSize: '0.85rem', fontWeight: '600' }}>ĐÃ KHÓA</span>
                  ) : (
                    <span style={{ padding: '5px 10px', backgroundColor: '#e8f8f5', color: '#1abc9c', borderRadius: '15px', fontSize: '0.85rem', fontWeight: '600' }}>HOẠT ĐỘNG</span>
                  )}
                </td>
                <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    <button 
                      title="Xem doanh thu"
                      onClick={() => alert(`Xem chi tiết doanh thu của ${res.name} (Đang phát triển)`)}
                      style={{ padding: '8px', backgroundColor: '#f1f2f6', color: '#2f3542', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s' }}
                      onMouseOver={e => e.currentTarget.style.backgroundColor = '#dfe4ea'}
                      onMouseOut={e => e.currentTarget.style.backgroundColor = '#f1f2f6'}
                    >
                      <Eye size={18} />
                    </button>
                    {res.status === 'locked' ? (
                      <button 
                        title="Mở khóa"
                        onClick={() => updateStatus(res._id, 'approved')}
                        style={{ padding: '8px', backgroundColor: '#2ed573', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'filter 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                        onMouseOut={e => e.currentTarget.style.filter = 'brightness(1)'}
                      >
                        <Unlock size={18} />
                      </button>
                    ) : (
                      <button 
                        title="Khóa quán"
                        onClick={() => updateStatus(res._id, 'locked')}
                        style={{ padding: '8px', backgroundColor: '#ff4757', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'filter 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                        onMouseOut={e => e.currentTarget.style.filter = 'brightness(1)'}
                      >
                        <Lock size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h2 style={{ fontSize: '2rem', color: '#2f3542', margin: 0 }}>Quản lý Quán Ăn (Merchant)</h2>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', borderBottom: '2px solid #f1f2f6', paddingBottom: '15px' }}>
        <button 
          onClick={() => setActiveTab('pending')}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: activeTab === 'pending' ? '#0984e3' : 'transparent', 
            color: activeTab === 'pending' ? 'white' : '#57606f', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer', 
            fontWeight: '600', 
            fontSize: '1rem',
            transition: 'all 0.2s'
          }}
        >
          Duyệt Quán Mới
        </button>
        <button 
          onClick={() => setActiveTab('active')}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: activeTab === 'active' ? '#0984e3' : 'transparent', 
            color: activeTab === 'active' ? 'white' : '#57606f', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer', 
            fontWeight: '600', 
            fontSize: '1rem',
            transition: 'all 0.2s'
          }}
        >
          Danh sách Quán Active
        </button>
      </div>
      
      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : activeTab === 'pending' ? renderPendingTab() : renderActiveTab()}

      {/* Reject Modal */}
      {showRejectModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '400px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#2f3542' }}>Lý do từ chối</h3>
            <textarea 
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="VD: Không giấy phép kinh doanh, thông tin mập mờ..."
              style={{ width: '100%', padding: '12px', border: '1px solid #ced6e0', borderRadius: '8px', height: '100px', resize: 'none', marginBottom: '20px', boxSizing: 'border-box', fontFamily: 'inherit' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
                style={{ padding: '10px 20px', border: 'none', backgroundColor: '#f1f2f6', color: '#2f3542', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}
              >
                Hủy
              </button>
              <button 
                onClick={handleConfirmReject}
                style={{ padding: '10px 20px', border: 'none', backgroundColor: '#ff4757', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
              >
                Xác nhận Từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Restaurants;
