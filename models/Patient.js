const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dob: { type: Date },
  gender: { type: String, enum: ['male','female','other'] },
  contact: { type: String },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  meta: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

patientSchema.index({ doctor: 1 });

module.exports = mongoose.model('Patient', patientSchema);
