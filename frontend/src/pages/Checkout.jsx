import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ChevronRight, CreditCard } from 'lucide-react';
import { io } from 'socket.io-client';
import axios from 'axios'; // Import thêm axios để gọi API

const Checkout = () => {
  const socketRef = useRef(null);

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
  const { user } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart(); // Thêm clearCart để xóa giỏ sau khi đặt
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const [fullName, setFullName] = useState(user ? `${user.lastName} ${user.firstName}` : '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [address, setAddress] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [note, setNote] = useState('');

  const shippingFee = 40000;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const calculateTotal = () => {
    return cartTotal;
  };

  // --- Hàm xử lý đặt hàng ĐÃ CẬP NHẬT GỌI API ---
  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!user) {
        toast.error('Vui lòng đăng nhập trước khi đặt hàng.');
        navigate('/login');
        return;
      }

      const originalRestaurantId = cartItems.length > 0 ? (cartItems[0].restaurantId || cartItems[0].restaurant?._id || cartItems[0].restaurant?.id) : null;
      const merchantId = originalRestaurantId || localStorage.getItem('merchantId') || 'MERCHANT_123';
      // Đồng bộ merchantId giữa Checkout và MerchantDashboard để realtime + fetch đơn.
      localStorage.setItem('merchantId', merchantId);

      if (!merchantId) {
        toast.error('Không xác định được quán hàng. Vui lòng kiểm tra giỏ hàng.');
        return;
      }

      const customerId = user?._id || user?.id;
      if (!customerId) {
        toast.error('Không xác định được thông tin người dùng. Vui lòng đăng nhập lại.');
        navigate('/login');
        return;
      }

      const deliveryAddress = `${address}, ${ward}, ${district}, ${province}`;

      // 1. Chuẩn bị dữ liệu để lưu vào MongoDB
      const orderData = {
        customerId,
        restaurantId: merchantId, // Lưu chính merchantId tương ứng để MerchantDashboard lấy đúng đơn
        items: cartItems.map(item => ({
          productId: item._id || item.id || String(item.name),
          quantity: item.quantity,
          price: item.price
        })),
        totalPrice: calculateTotal() + shippingFee,
        deliveryAddress,
        paymentMethod: paymentMethod === 'cod' ? 'CASH' : 'BANK',
        status: 'pending',
        note,
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone
      };

      // 2. GỌI API POST ĐỂ LƯU VÀO DATABASE
      const response = await axios.post('http://localhost:5000/api/orders', orderData);

      if (response.status === 201 || response.status === 200) {
        // 3. LƯU THÀNH CÔNG -> BẮN SOCKET CHO CHỦ QUÁN (BẢO)
        if (socketRef.current && socketRef.current.connected) {
          socketRef.current.emit('place-order', {
            merchantId,
            customerName: user ? `${user.lastName} ${user.firstName}` : 'Khách hàng',
            totalAmount: calculateTotal() + shippingFee,
            orderId: response.data._id
          });
        } else {
          console.warn('Checkout: socket not connected, skip emit place-order');
        }

        toast.success('Đặt hàng thành công!');
        if(clearCart) clearCart();
        navigate('/');
      }
    } catch (error) {
      console.error("Lỗi khi đặt hàng:", error);
      const serverMessage = error.response?.data?.message || error.response?.data || error.message;
      toast.error(`Lỗi khi đặt hàng: ${serverMessage}`);
    }
  };

  // ... (Phần return JSX phía dưới giữ nguyên như code bạn gửi)

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
            
            {/* Cột 1: Thông tin giao hàng (Giữ nguyên) */}
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
                  placeholder="Địa chỉ"
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

            {/* Cột 2: Phương thức thanh toán (Giữ nguyên logic state) */}
            <div className="checkout-col checkout-payment">
              <h3 className="checkout-title">Phương thức vận chuyển</h3>
              <div className="radio-group">
                <label className="radio-label">
                  <div className="radio-left">
                    <input type="radio" name="shipping" defaultChecked />
                    <span>Giao hàng tận nơi</span>
                  </div>
                  <span>{formatPrice(shippingFee)}</span>
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

            {/* Cột 3: Tóm tắt đơn hàng (Giữ nguyên mapping dữ liệu) */}
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

              <div className="summary-totals">
                <div className="summary-row">
                  <span>Tạm tính</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="summary-row">
                  <span>Phí vận chuyển</span>
                  <span>{formatPrice(shippingFee)}</span>
                </div>
                <div className="summary-row total-row">
                  <span>Tổng cộng</span>
                  <span className="final-price">{formatPrice(calculateTotal() + shippingFee)}</span>
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