import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ChevronRight, CreditCard, CheckCircle } from 'lucide-react';

const Checkout = () => {
  const { user } = useAuth();
  const { cartItems, cartTotal, closeSidebar } = useCart();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('cod');
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const calculateTotal = () => {
    return cartTotal; // Có thể cộng thêm phí ship ở đây
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    toast.success('Đã đặt hàng thành công!');
    navigate('/');
  };

  if (cartItems.length === 0) {
    return (
      <div className="container section text-center" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <h2 style={{ marginBottom: '20px' }}>Giỏ hàng của bạn đang trống</h2>
        <p style={{ marginBottom: '30px', color: 'var(--text-muted)' }}>Vui lòng chọn món ăn trước khi tiến hành thanh toán.</p>
        <Link to="/menu" className="btn btn-primary">Quay lại Thực đơn</Link>
      </div>
    );
  }

  return (
    <div className="checkout-page bg-light pb-5">
      <div className="container">
        {/* Breadcrumb */}
        <div className="checkout-breadcrumb" style={{ padding: '20px 0' }}>
          <Link to="/cart">Giỏ hàng</Link> <ChevronRight size={14} /> <strong>Thông tin giao hàng</strong>
        </div>

        <form onSubmit={handleCheckoutSubmit}>
          <div className="checkout-grid">
            
            {/* Cột 1: Thông tin giao hàng */}
            <div className="checkout-col checkout-info">
              <h3 className="checkout-title">Thông tin giao hàng</h3>
              {user ? (
                <div className="logged-in-user">
                  <div className="user-avatar">{user.firstName?.charAt(0) || 'U'}</div>
                  <div className="user-details">
                    <div>{user.lastName} {user.firstName} ({user.email})</div>
                    <Link to="/profile" className="logout-link" style={{ fontSize: '13px' }}>Đăng xuất</Link>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: '14px', marginBottom: '15px' }}>
                  Bạn đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                </p>
              )}

              <div className="form-group">
                <input type="text" className="form-control" placeholder="Họ và tên" defaultValue={user ? `${user.lastName} ${user.firstName}` : ''} required />
              </div>
              
              <div className="form-group flex-group">
                <input type="email" className="form-control" placeholder="Email" defaultValue={user?.email || ''} required />
                <input type="tel" className="form-control" placeholder="Số điện thoại" defaultValue={user?.phoneNumber || ''} required />
              </div>

              <div className="form-group">
                <input type="text" className="form-control" placeholder="Địa chỉ" required />
              </div>

              <div className="form-group flex-group">
                <select className="form-control" required>
                  <option value="">Chọn Tỉnh / Thành</option>
                  <option value="sg">Hồ Chí Minh</option>
                  <option value="hn">Hà Nội</option>
                </select>
                <select className="form-control" required>
                  <option value="">Chọn Quận / Huyện</option>
                  <option value="q1">Quận 1</option>
                  <option value="q2">Quận 2</option>
                </select>
                <select className="form-control" required>
                  <option value="">Chọn Phường / Xã</option>
                  <option value="p1">Phường Bến Nghé</option>
                  <option value="p2">Phường Đa Kao</option>
                </select>
              </div>
              <div className="form-group">
                <textarea className="form-control" placeholder="Ghi chú (tùy chọn)" rows="3"></textarea>
              </div>
            </div>

            {/* Cột 2: Phương thức thanh toán */}
            <div className="checkout-col checkout-payment">
              <h3 className="checkout-title">Phương thức vận chuyển</h3>
              <div className="radio-group">
                <label className="radio-label">
                  <div className="radio-left">
                    <input type="radio" name="shipping" defaultChecked />
                    <span>Giao hàng tận nơi</span>
                  </div>
                  <span>40.000₫</span>
                </label>
              </div>

              <h3 className="checkout-title" style={{ marginTop: '30px' }}>Phương thức thanh toán</h3>
              <div className="radio-group payment-group">
                <label className={`radio-label ${paymentMethod === 'cod' ? 'active' : ''}`}>
                  <div className="radio-left">
                    <input 
                      type="radio" 
                      name="payment" 
                      checked={paymentMethod === 'cod'} 
                      onChange={() => setPaymentMethod('cod')} 
                    />
                    <div className="payment-icon"><CreditCard size={20}/></div>
                    <span>Thanh toán khi giao hàng (COD)</span>
                  </div>
                </label>

                <label className={`radio-label ${paymentMethod === 'bank' ? 'active' : ''}`}>
                  <div className="radio-left">
                    <input 
                      type="radio" 
                      name="payment" 
                      checked={paymentMethod === 'bank'} 
                      onChange={() => setPaymentMethod('bank')} 
                    />
                    <div className="payment-icon"><CreditCard size={20}/></div>
                    <span>Chuyển khoản qua ngân hàng</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Cột 3: Tóm tắt đơn hàng */}
            <div className="checkout-col checkout-summary">
              <h3 className="checkout-title">Đơn hàng ({cartItems.length} sản phẩm)</h3>
              
              <div className="summary-items">
                {cartItems.map(item => (
                  <div key={item.id} className="summary-item">
                    <div className="summary-item-img">
                      <img src={item.image} alt={item.name} />
                      <span className="summary-item-qty">{item.quantity}</span>
                    </div>
                    <div className="summary-item-info">
                      <div className="summary-item-name">{item.name}</div>
                    </div>
                    <div className="summary-item-price">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="summary-discount">
                <input type="text" className="form-control" placeholder="Nhập mã giảm giá" />
                <button type="button" className="btn btn-outline" style={{ height: '48px' }}>Áp dụng</button>
              </div>

              <div className="summary-totals">
                <div className="summary-row">
                  <span>Tạm tính</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="summary-row">
                  <span>Phí vận chuyển</span>
                  <span>40.000₫</span>
                </div>
                <div className="summary-row total-row">
                  <span>Tổng cộng</span>
                  <span className="final-price">{formatPrice(calculateTotal() + 40000)}</span>
                </div>
              </div>
              
              <div className="checkout-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                <Link to="/cart" style={{ color: 'var(--primary)', fontSize: '14px' }}>&lt; Quay về giỏ hàng</Link>
                <button type="submit" className="btn btn-primary" style={{ padding: '15px 30px' }}>ĐẶT HÀNG</button>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
