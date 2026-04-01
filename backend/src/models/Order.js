const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true }, // Accept both ObjectId string or numeric/mock IDs for demo
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true } // Giá cố định lúc đặt đơn, tránh bị thay đổi menu về sau
});

const orderSchema = new mongoose.Schema({
  customerId: { type: String, required: true }, // Hỗ trợ demo dạng số/string và ObjectId
  restaurantId: { type: String, required: true }, // Hỗ trợ demo dạng số/string và ObjectId
  items: [orderItemSchema],
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled'],
    default: 'pending'
  },
  deliveryAddress: { type: String, required: true },
  paymentMethod: { type: String, default: 'CASH' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
