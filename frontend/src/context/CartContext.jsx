import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'react-toastify';
const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [appliedVoucher, setAppliedVoucher] = useState(null);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  useEffect(() => {
    if (cartItems.length === 0 && appliedVoucher) {
      setAppliedVoucher(null);
    }
  }, [cartItems, appliedVoucher]);

  const applyVoucher = async (code, user) => {
    if (!code) {
      toast.warning('Vui lòng nhập mã voucher');
      return false;
    }
    if (!user) {
      toast.error('Vui lòng đăng nhập để sử dụng voucher');
      return false;
    }

    try {
      const { data } = await axiosInstance.post('/customer/vouchers/apply', {
        code: code,
        orderTotal: cartTotal
      });
      if (data.success) {
        setAppliedVoucher({ code: data.voucher.code, discountAmount: data.discountAmount });
        toast.success(data.message);
        return true;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Mã voucher không hợp lệ');
      setAppliedVoucher(null);
      return false;
    }
  };

  const removeVoucher = () => {
    setAppliedVoucher(null);
    toast.info('Đã bỏ mã giảm giá');
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) {
      setCartItems(cartItems.filter(item => item.id !== id));
      return;
    }
    setCartItems(cartItems.map(item => item.id === id ? { ...item, quantity: newQuantity } : item));
  };

  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { ...product, quantity }];
    });
    openSidebar();
  };

  return (
    <CartContext.Provider value={{ 
      isSidebarOpen, toggleSidebar, openSidebar, closeSidebar, 
      cartItems, cartTotal, cartCount, updateQuantity, removeItem,
      addToCart, clearCart, cart: { items: cartItems },
      appliedVoucher, setAppliedVoucher, applyVoucher, removeVoucher
    }}>
      {children}
    </CartContext.Provider>
  );
};
