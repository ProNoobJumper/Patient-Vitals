const Patient = require('../models/Patient');
const User = require('../models/User');

exports.createPatient = async (req, res) => {
  const { name, dob, gender, contact, meta } = req.body;
  const doctorId = req.user._id;
  const patient = new Patient({ name, dob, gender, contact, doctor: doctorId, meta });
  await patient.save();

  const doc = await User.findById(doctorId);
  doc.assignedPatients = doc.assignedPatients || [];
  doc.assignedPatients.push(patient._id);
  await doc.save();

  res.status(201).json(patient);
};

exports.getPatientsForDoctor = async (req, res) => {
  const doctorId = req.user.role === 'doctor' ? req.user._id : req.user.patientRef?.doctor;
  const patients = await Patient.find({ doctor: doctorId });
  res.json(patients);
};

exports.getPatientById = async (req, res) => {
  const patient = await Patient.findById(req.params.id).populate('doctor', 'name email');
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  if (req.user.role === 'doctor' && String(patient.doctor._id) !== String(req.user._id)) {
    // if doctor not owner, deny
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (req.user.role === 'patient' && String(req.user.patientRef) !== String(patient._id)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  res.json(patient);
};

exports.updatePatient = async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });
  if (String(patient.doctor) !== String(req.user._id)) {
    return res.status(403).json({ error: 'Only assigned doctor can update patient' });
  }
  Object.assign(patient, req.body);
  await patient.save();
  res.json(patient);
};
