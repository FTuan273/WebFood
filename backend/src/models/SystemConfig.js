const mongoose = require('mongoose');

const systemConfigSchema = new mongoose.Schema({
  key: { 
    type: String, 
    required: true, 
    unique: true, 
    default: 'global_config' 
  },
  commissionRate: { 
    type: Number, 
    required: true, 
    default: 15,
    min: 0,
    max: 100
  }
}, { timestamps: true });

module.exports = mongoose.model('SystemConfig', systemConfigSchema);
