import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ChevronRight, CreditCard, Smartphone } from 'lucide-react';
import { io } from 'socket.io-client';
import axiosInstance from '../utils/axiosInstance';
import PaymentDetails from '../components/PaymentDetails';

const SHIP_FEE = 40000;

const Checkout = () => {
  const socketRef = useRef(null);
  const { user } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [useMomo, setUseMomo] = useState(false);
  
  // Thông tin giao hàng
  const [fullName, setFullName] = useState(user ? `${user.lastName || ''} ${user.firstName || ''}`.trim() : '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [address, setAddress] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    const socket = io('http://localhost:5000', { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Checkout socket connected', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.error('Checkout socket connect_error:', err);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off();
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (paymentMethod !== 'bank') setUseMomo(false);
  }, [paymentMethod]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const grandTotal = cartTotal + SHIP_FEE;

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error('Vui lòng đăng nhập trước khi đặt hàng.');
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Giỏ hàng của bạn đang trống.');
      return;
    }

    try {
      // 1. Xác định merchantId (restaurantId)
      const originalRestaurantId = cartItems[0].restaurantId || cartItems[0].restaurant?._id || cartItems[0].restaurant?.id;
      const merchantId = originalRestaurantId || localStorage.getItem('merchantId') || 'MERCHANT_123';
      
      if (!merchantId) {
        toast.error('Không xác định được quán hàng. Vui lòng kiểm tra giỏ hàng.');
        return;
      }

      const deliveryAddress = `${address}, ${ward}, ${district}, ${province}`;
      
      // 2. Xử lý theo phương thức thanh toán
      if (paymentMethod === 'momo_gateway') {
        if (grandTotal < 1000) {
          toast.error('Số tiền thanh toán không hợp lệ');
          return;
        }

        const { data } = await axiosInstance.post('/payment/momo/create', {
          amount: grandTotal,
          orderInfo: `Thanh toan WebFood ${Date.now()}`,
          // Note: Here we might need to pass order details if needed by backend
        });

        if (data.payUrl) {
          window.location.href = data.payUrl;
          return;
        }
        toast.error('MoMo không trả về link thanh toán');
        return;
      }

      // 3. Thanh toán COD hoặc Bank (Tạo đơn hàng trực tiếp)
      const orderData = {
        customerId: user._id || user.id,
        restaurantId: merchantId,
        items: cartItems.map(item => ({
          productId: item._id || item.id,
          quantity: item.quantity,
          price: item.price
        })),
        totalPrice: grandTotal,
        deliveryAddress,
        paymentMethod: paymentMethod === 'cod' ? 'CASH' : 'BANK',
        status: 'pending',
        note,
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone
      };

      const response = await axiosInstance.post('/orders', orderData);

      if (response.status === 201 || response.status === 200) {
        // 4. Bắn socket cho Merchant
        if (socketRef.current && socketRef.current.connected) {
          socketRef.current.emit('place-order', {
            merchantId,
            customerName: fullName || 'Khách hàng',
            totalAmount: grandTotal,
            orderId: response.data._id
          });
        }

        toast.success('Đặt hàng thành công!');
        clearCart();
        navigate('/');
      }
    } catch (error) {
      console.error("Lỗi khi đặt hàng:", error);
      const serverMessage = error.response?.data?.message || error.message;
      toast.error(`Lỗi khi đặt hàng: ${serverMessage}`);
    }
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
                    <Link to="/profile" className="logout-link" style={{ fontSize: '13px' }}>Thay đổi</Link>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: '14px', marginBottom: '15px' }}>
                  Bạn đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                </p>
              )}

              <div className="form-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Họ và tên"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group flex-group">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <input
                  type="tel"
                  className="form-control"
                  placeholder="Số điện thoại"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Địa chỉ cụ thể"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              <div className="form-group flex-group">
                <select
                  className="form-control"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  required
                >
                  <option value="">Chọn Tỉnh / Thành</option>
                  <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                  <option value="Hà Nội">Hà Nội</option>
                </select>
                <select
                  className="form-control"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  required
                >
                  <option value="">Chọn Quận / Huyện</option>
                  <option value="Quận 1">Quận 1</option>
                  <option value="Quận 3">Quận 3</option>
                  <option value="Quận 7">Quận 7</option>
                  <option value="Quận Tân Bình">Quận Tân Bình</option>
                </select>
                <select
                  className="form-control"
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  required
                >
                  <option value="">Chọn Phường / Xã</option>
                  <option value="Phường Bến Nghé">Phường Bến Nghé</option>
                  <option value="Phường Đa Kao">Phường Đa Kao</option>
                  <option value="Phường 1">Phường 1</option>
                </select>
              </div>
              <div className="form-group">
                <textarea
                  className="form-control"
                  placeholder="Ghi chú (tùy chọn)"
                  rows="3"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                ></textarea>
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
                  <span>{formatPrice(SHIP_FEE)}</span>
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

                <label className={`radio-label ${paymentMethod === 'momo_gateway' ? 'active' : ''}`}>
                  <div className="radio-left">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'momo_gateway'}
                      onChange={() => setPaymentMethod('momo_gateway')}
                    />
                    <div className="payment-icon"><Smartphone size={20} /></div>
                    <span>Ví MoMo (Cổng thanh toán)</span>
                  </div>
                </label>
              </div>

              {paymentMethod === 'bank' && (
                <PaymentDetails
                  variant="bank"
                  grandTotal={grandTotal}
                  useMomo={useMomo}
                  onMomoToggle={setUseMomo}
                />
              )}

              {paymentMethod === 'momo_gateway' && (
                <div
                  className="payment-gateway-hint"
                  style={{
                    marginTop: 16,
                    padding: '14px 16px',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    background: 'rgba(209, 160, 84, 0.06)',
                    fontSize: 14,
                    lineHeight: 1.5,
                  }}
                >
                  <strong style={{ display: 'block', marginBottom: 8 }}>Thanh toán qua MoMo</strong>
                  Sau khi bấm <strong>ĐẶT HÀNG</strong>, bạn sẽ được chuyển tới trang thanh toán MoMo an toàn.
                  Khi hoàn tất, hệ thống sẽ đưa bạn về trang kết quả.
                </div>
              )}
            </div>

            {/* Cột 3: Tóm tắt đơn hàng */}
            <div className="checkout-col checkout-summary">
              <h3 className="checkout-title">Đơn hàng ({cartItems.length} sản phẩm)</h3>
              
              <div className="summary-items">
                {cartItems.map(item => (
                  <div key={item.id || item._id} className="summary-item">
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

              <div className="summary-totals">
                <div className="summary-row">
                  <span>Tạm tính</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="summary-row">
                  <span>Phí vận chuyển</span>
                  <span>{formatPrice(SHIP_FEE)}</span>
                </div>
                <div className="summary-row total-row">
                  <span>Tổng cộng</span>
                  <span className="final-price">{formatPrice(grandTotal)}</span>
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