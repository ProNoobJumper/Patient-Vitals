const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  vital: { type: mongoose.Schema.Types.ObjectId, ref: 'Vital' },
  createdAt: { type: Date, default: Date.now },
  severity: { type: String, enum: ['low','medium','high'], default: 'medium' },
  message: { type: String, required: true },
  acknowledged: { type: Boolean, default: false },
  acknowledgedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

alertSchema.index({ patient: 1, createdAt: -1 });

module.exports = mongoose.model('Alert', alertSchema);
