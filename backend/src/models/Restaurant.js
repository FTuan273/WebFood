const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  openingHours: { type: String, default: '08:00 - 22:00' },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'locked'],
    default: 'pending' // Super Admin sẽ duyệt
  }
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);
