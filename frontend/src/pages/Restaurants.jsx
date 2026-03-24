import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Check, X, Building } from 'lucide-react';

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRestaurants = () => {
    axios.get('http://localhost:5000/api/admin/restaurants/pending')
      .then(res => {
        setRestaurants(res.data.restaurants);
        setLoading(false);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const updateStatus = (id, status) => {
    if (window.confirm(`Bạn có chắc chắn muốn ${status === 'approved' ? 'DUYỆT' : 'TỪ CHỐI'} quán ăn này?`)) {
      axios.put(`http://localhost:5000/api/admin/restaurants/${id}/status`, { status })
        .then(() => fetchRestaurants())
        .catch(console.error);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '2rem', marginBottom: '20px', color: '#2f3542' }}>Duyệt Quán Ăn (Merchant)</h2>
      
      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : restaurants.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#f8f9fa', borderRadius: '15px', border: '2px dashed #ced6e0' }}>
          <Building size={60} color="#b2bec3" style={{ marginBottom: '15px' }} />
          <h3 style={{ color: '#636e72', margin: 0 }}>Không có quán ăn nào chờ duyệt</h3>
          <p style={{ color: '#b2bec3', marginTop: '10px' }}>Hệ thống đã xử lý hết các yêu cầu ứng tuyển của Merchant.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' }}>
          {restaurants.map(res => (
            <div key={res._id} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 8px 30px rgba(0,0,0,0.06)', border: '1px solid #f1f2f6', transition: 'transform 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '15px' }}>
                <div>
                  <h3 style={{ color: '#2f3542', margin: '0 0 8px 0', fontSize: '1.4rem' }}>{res.name}</h3>
                  <div style={{ color: '#7f8c8d', fontSize: '0.9rem', lineHeight: '1.4' }}>📍 {res.address}</div>
                </div>
                <span style={{ padding: '6px 12px', backgroundColor: '#fff3cd', color: '#f39c12', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  PENDING
                </span>
              </div>
              
              <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '10px', marginBottom: '25px', fontSize: '0.95rem', color: '#57606f', borderLeft: '4px solid #0984e3' }}>
                <div style={{ marginBottom: '5px' }}><strong>Người đại diện:</strong> {res.ownerId?.name || 'Không rõ'}</div>
                <div style={{ marginBottom: '5px' }}><strong>Email:</strong> {res.ownerId?.email || 'Không rõ'}</div>
                {res.ownerId?.phone && <div><strong>SĐT:</strong> {res.ownerId.phone}</div>}
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <button 
                  onClick={() => updateStatus(res._id, 'approved')}
                  style={{ flex: 1, padding: '12px', backgroundColor: '#2ed573', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'filter 0.2s', fontSize: '1rem' }}
                  onMouseOver={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                  onMouseOut={e => e.currentTarget.style.filter = 'brightness(1)'}
                >
                  <Check size={20} /> Duyệt
                </button>
                <button 
                  onClick={() => updateStatus(res._id, 'rejected')}
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
      )}
    </div>
  );
};

export default Restaurants;
