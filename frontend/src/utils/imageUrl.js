/**
 * Chuyển đổi đường dẫn ảnh thành URL đầy đủ.
 * - Nếu ảnh là /uploads/... (do backend trả về) → thêm BACKEND_URL
 * - Nếu ảnh đã là URL đầy đủ (http...) → giữ nguyên
 * - Nếu không có ảnh → trả về ảnh mặc định
 */
const BACKEND_URL = 'http://localhost:5000';
const DEFAULT_FOOD_IMG = 'https://images.unsplash.com/photo-1544025162-8315ea07f440?w=500';
const DEFAULT_STORE_IMG = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500';

export const getImageUrl = (image, fallback = DEFAULT_FOOD_IMG) => {
  if (!image) return fallback;
  if (image.startsWith('http')) return image;           // URL ngoài (Cloudinary, Unsplash...)
  if (image.startsWith('/uploads/')) return `${BACKEND_URL}${image}`;  // File local
  return fallback;
};

export { DEFAULT_FOOD_IMG, DEFAULT_STORE_IMG };
