const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['restaurant', 'product'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'typeRef'
  }
}, { timestamps: true });

// Mỗi user chỉ được yêu thích 1 lần mỗi target
favoriteSchema.index({ userId: 1, targetId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
