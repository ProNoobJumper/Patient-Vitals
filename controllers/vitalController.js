const Vital = require('../models/Vital');
const Patient = require('../models/Patient');
const Alert = require('../models/Alert');
const { evaluateAlertsForVital } = require('../utils/alerts');

exports.addVital = async (req, res) => {
  const data = req.body;
  // Check patient exists and authorization
  const patient = await Patient.findById(data.patient);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  // Doctor must be assigned to this patient
  if (String(patient.doctor) !== String(req.user._id)) {
    return res.status(403).json({ error: 'Doctor not assigned to this patient' });
  }

  const vital = new Vital({
    patient: data.patient,
    recordedBy: req.user._id,
    timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
    bloodPressure: data.bloodPressure || {},
    sugarMgDl: data.sugarMgDl,
    pulse: data.pulse,
    notes: data.notes
  });
  await vital.save();

  // evaluate for alerts
  const alerts = evaluateAlertsForVital(vital);
  if (alerts && alerts.length) {
    // write alert documents
    const alertsToSave = alerts.map(a => ({
      patient: vital.patient,
      vital: vital._id,
      severity: a.severity,
      message: a.message
    }));
    await Alert.insertMany(alertsToSave);
  }

  res.status(201).json({ vital, alertsCreated: alerts.length });
};

exports.updateVital = async (req, res) => {
  const vital = await Vital.findById(req.params.id);
  if (!vital) return res.status(404).json({ error: 'Vital not found' });

  // Doctor must be assigned to this patient
  const patient = await Patient.findById(vital.patient);
  if (String(patient.doctor) !== String(req.user._id)) {
    return res.status(403).json({ error: 'Doctor not assigned to this patient' });
  }

  Object.assign(vital, req.body);
  await vital.save();
  res.json(vital);
};

exports.getVitalsForPatient = async (req, res) => {
  const { patientId } = req.params;
  const { from, to, limit = 100 } = req.query;
  const patient = await Patient.findById(patientId);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  if (String(patient.doctor) !== String(req.user._id)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const query = { patient: patientId };
  if (from || to) query.timestamp = {};
  if (from) query.timestamp.$gte = new Date(from);
  if (to) query.timestamp.$lte = new Date(to);

  const vitals = await Vital.find(query).sort({ timestamp: -1 }).limit(parseInt(limit, 10));
  res.json(vitals);
};

exports.statsForPatient = async (req, res) => {
  const { patientId } = req.params;
  const { from, to } = req.query;

  // Authorize user
  const patient = await Patient.findById(patientId);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  if (String(patient.doctor) !== String(req.user._id)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

 const match = { patient: new (require('mongoose').Types.ObjectId)(patientId) };
  if (from || to) match.timestamp = {};
  if (from) match.timestamp.$gte = new Date(from);
  if (to) match.timestamp.$lte = new Date(to);

  const VitalModel = require('../models/Vital');
  const pipeline = [
    { $match: match },
    {
      $group: {
        _id: null,
        avgSystolic: { $avg: "$bloodPressure.systolic" },
        avgDiastolic: { $avg: "$bloodPressure.diastolic" },
        avgSugar: { $avg: "$sugarMgDl" },
        avgPulse: { $avg: "$pulse" },
        minSugar: { $min: "$sugarMgDl" },
        maxSugar: { $max: "$sugarMgDl" },
        count: { $sum: 1 }
      }
    }
  ];

  const result = await VitalModel.aggregate(pipeline);
  res.json(result[0] || { count: 0 });
};