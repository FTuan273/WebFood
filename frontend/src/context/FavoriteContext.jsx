import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'react-toastify';

const FavoriteContext = createContext();

export const useFavorites = () => useContext(FavoriteContext);

export const FavoriteProvider = ({ children }) => {
  const { user } = useAuth();
  
  // Lưu dưới dạng Set danh sách ID để kiểm tra trạng thái O(1)
  const [favoriteRestaurantIds, setFavoriteRestaurantIds] = useState(new Set());
  const [favoriteProductIds, setFavoriteProductIds] = useState(new Set());

  // Lấy toàn bộ ID yêu thích về khi đăng nhập
  const fetchFavorites = async () => {
    if (!user || user.role !== 'Customer') return;
    try {
      const res = await axiosInstance.get('/customer/favorites');
      if (res.data.success) {
        setFavoriteRestaurantIds(new Set(res.data.restaurants.map(r => r._id)));
        setFavoriteProductIds(new Set(res.data.products.map(p => p._id)));
      }
    } catch (err) {
      console.error('Lỗi khi tải thông tin yêu thích:', err);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  // Hành động thả / gỡ Trái tim
  const toggleFavoriteRestaurant = async (restaurantId, e) => {
    if (e) e.preventDefault(); // Ngăn chặn nổi bọt sự kiện click Link
    
    // Yêu cầu đăng nhập trước
    if (!user) {
      toast.warning('Vui lòng đăng nhập để lưu quán yêu thích!');
      return;
    }

    const isFav = favoriteRestaurantIds.has(restaurantId);
    try {
      if (isFav) {
        await axiosInstance.delete(`/customer/favorites/${restaurantId}`);
        setFavoriteRestaurantIds(prev => {
          const next = new Set(prev); next.delete(restaurantId); return next;
        });
        toast.info('Đã bỏ theo dõi quán ăn 💔');
      } else {
        await axiosInstance.post('/customer/favorites', { targetId: restaurantId, type: 'restaurant' });
        setFavoriteRestaurantIds(prev => new Set(prev).add(restaurantId));
        toast.success('Đã lưu nhà hàng vào danh sách Yêu Thích! ❤️');
      }
    } catch (err) {
      toast.error('Có lỗi xảy ra khi cập nhật Trái tim!');
    }
  };

  const toggleFavoriteProduct = async (productId, e) => {
    if (e) e.preventDefault();
    
    if (!user) {
      toast.warning('Vui lòng đăng nhập để lưu món ăn!');
      return;
    }

    const isFav = favoriteProductIds.has(productId);
    try {
      if (isFav) {
        await axiosInstance.delete(`/customer/favorites/${productId}`);
        setFavoriteProductIds(prev => {
          const next = new Set(prev); next.delete(productId); return next;
        });
        toast.info('Đã gỡ món ăn khỏi danh sách 💔');
      } else {
        await axiosInstance.post('/customer/favorites', { targetId: productId, type: 'product' });
        setFavoriteProductIds(prev => new Set(prev).add(productId));
        toast.success('Đã thả 1 Trái tim cho món này! ❤️');
      }
    } catch (err) {
      toast.error('Có lỗi xảy ra khi cập nhật Trái tim!');
    }
  };

  return (
    <FavoriteContext.Provider value={{ 
      favoriteRestaurantIds, 
      favoriteProductIds, 
      toggleFavoriteRestaurant, 
      toggleFavoriteProduct 
    }}>
      {children}
    </FavoriteContext.Provider>
  );
};
