const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['doctor', 'patient'], required: true },
 
  assignedPatients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Patient' }],
  
  patientRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
