import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, Tag, CheckCircle } from 'lucide-react';
import { getImageUrl } from '../utils/imageUrl';

const Cart = () => {
  const { user } = useAuth();
  const { cartItems, cartTotal, removeFromCart, updateQuantity, clearCart, appliedVoucher, applyVoucher, removeVoucher } = useCart();
  const navigate = useNavigate();
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherLoading, setVoucherLoading] = useState(false);

  const handleApplyVoucher = async () => {
    setVoucherLoading(true);
    await applyVoucher(voucherCode.trim().toUpperCase(), user);
    setVoucherLoading(false);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (cartItems.length === 0) {
    return (
      <div className="container" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <ShoppingBag size={80} color="#e0e0e0" style={{ marginBottom: '20px' }} />
        <h2 style={{ marginBottom: '15px', color: 'var(--text-main)' }}>Giỏ hàng của bạn đang trống</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Chưa có sản phẩm nào trong giỏ hàng. Cùng khám phá hàng ngàn món ăn ngon nhé!</p>
        <button onClick={() => navigate('/menu')} className="btn btn-primary" style={{ padding: '12px 30px', fontSize: '16px' }}>
          Khám phá thực đơn
        </button>
      </div>
    );
  }

  return (
    <div className="cart-page bg-light" style={{ minHeight: '80vh', padding: '40px 0' }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px', gap: '15px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-main)' }}>
            <ArrowLeft size={24} />
          </button>
          <h1 style={{ fontSize: '28px', margin: 0, color: 'var(--text-main)' }}>Giỏ hàng của bạn</h1>
        </div>

        <div className="cart-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '30px', alignItems: 'start' }}>
          
          <div className="cart-items-section" style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '15px', marginBottom: '15px' }}>
              <span style={{ fontWeight: 600 }}>Sản phẩm ({cartItems.length})</span>
              <button onClick={clearCart} style={{ color: 'var(--primary)', border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>
                Xóa tất cả
              </button>
            </div>

            <div className="cart-items-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item-row" style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto auto', gap: '15px', alignItems: 'center', paddingBottom: '20px', borderBottom: '1px solid #f0f0f0' }}>
                  <img src={getImageUrl(item.image)} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                  
                  <div className="item-details">
                    <h4 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>{item.name}</h4>
                    {item.restaurantName && (
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '5px' }}>Quán: {item.restaurantName}</div>
                    )}
                    <div style={{ fontWeight: 600, color: 'var(--price-color)' }}>{formatPrice(item.price)}</div>
                  </div>

                  <div className="quantity-controls" style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden' }}>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      style={{ padding: '8px 12px', border: 'none', background: 'white', cursor: 'pointer' }}
                    >
                      <Minus size={14} />
                    </button>
                    <span style={{ padding: '0 10px', fontSize: '14px', fontWeight: 500, minWidth: '30px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      style={{ padding: '8px 12px', border: 'none', background: 'white', cursor: 'pointer' }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button 
                    onClick={() => removeFromCart(item.id)}
                    style={{ border: 'none', background: 'none', color: '#ff4d4f', cursor: 'pointer', padding: '10px' }}
                    title="Xóa sản phẩm"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="cart-summary-section" style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow-sm)', position: 'sticky', top: '90px' }}>
            <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '15px', margin: '0 0 20px 0', fontSize: '18px' }}>Tóm tắt đơn hàng</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBefore: '15px', color: 'var(--text-muted)' }}>
              <span>Tạm tính</span>
              <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{formatPrice(cartTotal)}</span>
            </div>

            <div className="summary-discount" style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed var(--border)' }}>
                {appliedVoucher ? (
                  <div style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    backgroundColor: '#f0fff4', border: '1px solid #2ed573', borderRadius: '8px', padding: '10px 14px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle size={18} color="#2ed573" />
                      <span style={{ fontWeight: 'bold', color: '#2f3542' }}>{appliedVoucher.code}</span>
                      <span style={{ fontSize: '0.85rem', color: '#57606f' }}>(-{formatPrice(appliedVoucher.discountAmount)})</span>
                    </div>
                    <button type="button" onClick={removeVoucher} style={{ background: 'none', border: 'none', color: '#ff4757', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Nhập mã giảm giá" 
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyVoucher()}
                        style={{ textTransform: 'uppercase', flex: 1, padding: '10px', border: '1px solid var(--border)', borderRadius: '8px' }}
                      />
                      <button 
                        type="button" 
                        className="btn btn-outline" 
                        style={{ height: '42px', display: 'flex', alignItems: 'center', gap: '5px', padding: '0 15px', border: '1px solid var(--primary)', color: 'var(--primary)', background: 'transparent', borderRadius: '8px', cursor: 'pointer' }}
                        onClick={handleApplyVoucher}
                        disabled={voucherLoading}
                      >
                        <Tag size={15} /> {voucherLoading ? '...' : 'Áp dụng'}
                      </button>
                    </div>
                  </div>
                )}
            </div>

            {appliedVoucher && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', color: '#2ed573', fontWeight: 500 }}>
                <span>Giảm giá voucher</span>
                <span>-{formatPrice(appliedVoucher.discountAmount)}</span>
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid var(--border)' }}>
              <span style={{ fontWeight: 600, fontSize: '16px' }}>Tổng cộng</span>
              <span style={{ color: 'var(--price-color)', fontSize: '20px', fontWeight: 700 }}>
                {formatPrice(Math.max(0, cartTotal - (appliedVoucher?.discountAmount || 0)))}
              </span>
            </div>
            
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'right', marginTop: '5px' }}>
              (Chưa bao gồm phí giao hàng)
            </p>

            <button 
              onClick={() => navigate('/checkout')}
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '25px', padding: '14px', fontSize: '16px', fontWeight: 600, textTransform: 'uppercase' }}
            >
              Tiến hành đặt hàng
            </button>
            <Link to="/menu" style={{ display: 'block', textAlign: 'center', marginTop: '15px', fontSize: '14px', color: 'var(--primary)', textDecoration: 'none' }}>
              Tiếp tục mua hàng
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Cart;
