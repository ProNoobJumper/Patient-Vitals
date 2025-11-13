const mongoose = require('mongoose');

const vitalSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
  timestamp: { type: Date, default: Date.now, required: true },

  bloodPressure: {
    systolic: { type: Number },
    diastolic: { type: Number }
  },
  sugarMgDl: { type: Number },
  pulse: { type: Number },

  notes: { type: String }
}, { timestamps: true });

vitalSchema.index({ patient: 1, timestamp: 1 });
vitalSchema.index({ timestamp: 1 });

module.exports = mongoose.model('Vital', vitalSchema);
