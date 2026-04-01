import React from 'react';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';

const CartSidebar = () => {
  const { isSidebarOpen, closeSidebar, cartItems, cartTotal, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleCheckout = () => {
    closeSidebar();
    navigate('/checkout');
  };

  return (
    <>
      {isSidebarOpen && (
        <>
          {/* Overlay */}
          <div className="cart-overlay" onClick={closeSidebar} />

          {/* Sidebar */}
          <div className="cart-sidebar">
            <div className="cart-header">
              <h3>Giỏ hàng của bạn</h3>
              <button className="close-cart-btn" onClick={closeSidebar}>
                <X size={24} />
              </button>
            </div>

            <div className="cart-body">
              {cartItems.length === 0 ? (
                <div className="empty-cart text-center">
                  <p>Giỏ hàng của bạn đang trống.</p>
                  <button className="btn btn-primary" onClick={closeSidebar} style={{ marginTop: '15px' }}>
                    Tiếp tục mua hàng
                  </button>
                </div>
              ) : (
                <div className="cart-items">
                  {cartItems.map(item => (
                    <div key={item.id} className="cart-item">
                      <img src={item.image} alt={item.name} className="cart-item-img" />
                      <div className="cart-item-info">
                        <h4 className="cart-item-name">{item.name}</h4>
                        <div className="cart-item-price">{formatPrice(item.price)}</div>
                        <div className="cart-item-actions">
                          <div className="quantity-selector-sm">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus size={14}/></button>
                            <span>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={14}/></button>
                          </div>
                          <button className="remove-item-btn" onClick={() => removeItem(item.id)}>
                            <Trash2 size={16} /> Bỏ s.phẩm
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="cart-footer">
                <div className="cart-total">
                  <span>Tổng tiền tạm tính:</span>
                  <span className="total-price">{formatPrice(cartTotal)}</span>
                </div>
                <button className="btn btn-primary btn-checkout" onClick={handleCheckout}>
                  TIẾN HÀNH THANH TOÁN
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default CartSidebar;
