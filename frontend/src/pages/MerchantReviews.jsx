import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { Star, MessageSquare, TrendingUp, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const StarBar = ({ star, count, total }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
      <span style={{ fontSize: '0.82rem', color: '#666', width: '20px', textAlign: 'right' }}>{star}</span>
      <Star size={12} fill="#ffc107" color="#ffc107" />
      <div style={{ flex: 1, background: '#f0e8e4', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: '#ffc107', borderRadius: '4px', transition: 'width 0.5s' }} />
      </div>
      <span style={{ fontSize: '0.82rem', color: '#888', width: '30px' }}>{count}</span>
    </div>
  );
};

const RatingStars = ({ rating }) => (
  <div style={{ display: 'flex', gap: '2px' }}>
    {[1,2,3,4,5].map(s => (
      <Star key={s} size={14} fill={s <= rating ? '#ffc107' : 'none'} color={s <= rating ? '#ffc107' : '#ddd'} />
    ))}
  </div>
);

const MerchantReviews = () => {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    axiosInstance.get(`/merchant/reviews`)
      .then(res => {
        if (res.data.success) setData(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {[1,2,3].map(i => <div key={i} style={{ height: '80px', background: '#f5f5f5', borderRadius: '12px' }} />)}
    </div>
  );

  if (!data) return <p>Không thể tải đánh giá.</p>;

  const { avgRating, totalReviews, starDistribution, productStats, reviews } = data;

  const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div>
      <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1a1a2e', marginBottom: '6px' }}>Quản lý Đánh Giá</h2>
      <p style={{ color: '#888', marginBottom: '28px' }}>Theo dõi nhận xét và xếp hạng của khách hàng</p>

      {/* Thẻ thống kê tổng quan */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px', marginBottom: '28px' }}>
        {/* Rating tổng */}
        <div style={{ background: 'linear-gradient(135deg, #e94560, #c23152)', borderRadius: '14px', padding: '24px', color: 'white', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1 }}>{avgRating}</div>
          <div style={{ fontSize: '0.85rem', opacity: 0.85, marginTop: '4px' }}>Điểm trung bình</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '3px', marginTop: '8px' }}>
            {[1,2,3,4,5].map(s => <Star key={s} size={16} fill={s <= Math.round(avgRating) ? 'white' : 'none'} color="white" />)}
          </div>
        </div>

        {/* Tổng đánh giá */}
        <div style={{ background: 'white', borderRadius: '14px', padding: '24px', border: '1px solid #f0e0f0', textAlign: 'center' }}>
          <div style={{ width: '44px', height: '44px', background: '#f3f0ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', color: '#7c3aed' }}>
            <MessageSquare size={22} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1a1a2e' }}>{totalReviews}</div>
          <div style={{ fontSize: '0.85rem', color: '#888' }}>Tổng đánh giá</div>
        </div>

        {/* Món được đánh giá */}
        <div style={{ background: 'white', borderRadius: '14px', padding: '24px', border: '1px solid #f0e0f0', textAlign: 'center' }}>
          <div style={{ width: '44px', height: '44px', background: '#fff0eb', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', color: '#e94560' }}>
            <Award size={22} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1a1a2e' }}>{productStats.length}</div>
          <div style={{ fontSize: '0.85rem', color: '#888' }}>Món được đánh giá</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '20px', marginBottom: '28px' }}>
        {/* Phân bố sao */}
        <div style={{ background: 'white', borderRadius: '14px', padding: '22px', border: '1px solid #f0e8e4' }}>
          <h3 style={{ margin: '0 0 18px', fontSize: '1rem', fontWeight: 700, color: '#1a1a2e' }}>Phân bố xếp hạng</h3>
          {[...starDistribution].reverse().map(({ star, count }) => (
            <StarBar key={star} star={star} count={count} total={totalReviews} />
          ))}
        </div>

        {/* Rating theo từng món */}
        <div style={{ background: 'white', borderRadius: '14px', padding: '22px', border: '1px solid #f0e8e4' }}>
          <h3 style={{ margin: '0 0 18px', fontSize: '1rem', fontWeight: 700, color: '#1a1a2e' }}>Xếp hạng theo món ăn</h3>
          {productStats.length === 0 ? (
            <p style={{ color: '#bbb', textAlign: 'center', padding: '20px' }}>Chưa có dữ liệu</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {productStats.sort((a,b) => b.avgRating - a.avgRating).map(p => (
                <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: '#fdf8f6', borderRadius: '8px' }}>
                  {p.image && <img src={p.image} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1a1a2e' }}>{p.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#888' }}>{p.reviewCount} đánh giá</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Star size={14} fill="#ffc107" color="#ffc107" />
                    <span style={{ fontWeight: 700, color: '#1a1a2e' }}>{p.avgRating}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Danh sách chi tiết đánh giá */}
      <div style={{ background: 'white', borderRadius: '14px', padding: '22px', border: '1px solid #f0e8e4' }}>
        <h3 style={{ margin: '0 0 18px', fontSize: '1rem', fontWeight: 700, color: '#1a1a2e' }}>
          Tất cả đánh giá ({reviews.length})
        </h3>

        {reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#bbb' }}>
            <MessageSquare size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
            <p style={{ margin: 0 }}>Chưa có đánh giá nào</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {reviews.map(review => (
              <div key={review._id} style={{ padding: '16px', background: '#fdf8f6', borderRadius: '10px', border: '1px solid #f5ede8' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  {/* Avatar */}
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e94560', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1rem', flexShrink: 0 }}>
                    {review.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a1a2e' }}>{review.user?.name || 'Ẩn danh'}</span>
                        <span style={{ margin: '0 8px', color: '#ddd' }}>·</span>
                        <span style={{ fontSize: '0.8rem', color: '#bbb' }}>{formatDate(review.createdAt)}</span>
                      </div>
                      <RatingStars rating={review.rating} />
                    </div>
                    {review.product && (
                      <div style={{ fontSize: '0.78rem', color: '#e94560', fontWeight: 600, marginBottom: '6px', background: '#fff0ec', display: 'inline-block', padding: '2px 8px', borderRadius: '4px' }}>
                        🍽️ {review.product.name}
                      </div>
                    )}
                    <p style={{ margin: 0, color: '#444', fontSize: '0.9rem', lineHeight: 1.6 }}>{review.comment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MerchantReviews;
