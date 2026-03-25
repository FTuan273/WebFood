const mongoose = require('mongoose');

/**
 * @model CategoryFood
 * @description Danh mục món ăn chung do Super Admin quản lý.
 * Các quán (Merchant) dùng danh sách này để phân loại món ăn của họ.
 */
const categoryFoodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    icon: {
      type: String,
      default: '🍽️'
    },
    description: {
      type: String,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('CategoryFood', categoryFoodSchema);
