const Alert = require('../models/Alert');
const Patient = require('../models/Patient');

exports.listAlertsForDoctor = async (req, res) => {
  const doctorId = req.user._id;
  const patients = await Patient.find({ doctor: doctorId }).select('_id');
  const patientIds = patients.map(p => p._id);
  const alerts = await Alert.find({ patient: { $in: patientIds } }).sort({ createdAt: -1 }).limit(200);
  res.json(alerts);
};


exports.acknowledgeAlert = async (req, res) => {
  const alert = await Alert.findById(req.params.id);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });

  const PatientModel = require('../models/Patient');
  const patient = await PatientModel.findById(alert.patient);
  if (String(patient.doctor) !== String(req.user._id)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  alert.acknowledged = true;
  alert.acknowledgedBy = req.user._id;
  await alert.save();
  res.json(alert);
};
