require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const Patient = require('./models/Patient');
const Vital = require('./models/Vital');

async function addVitals(patient) {
  const doctor = await User.findOne({ role: 'doctor' }).exec();
  if (!doctor) {
    console.error('No doctor found. Please create a doctor account first.');
    process.exit(1);
  }

  const now = new Date();
  const samples = [
    { patient: patient._id, recordedBy: doctor._id, pulse: 72, timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 24) },
    { patient: patient._id, recordedBy: doctor._id, bloodPressure: { systolic: 118, diastolic: 76 }, timestamp: new Date(now.getTime() - 1000 * 60 * 60) },
    { patient: patient._id, recordedBy: doctor._id, sugarMgDl: 95, timestamp: new Date(now.getTime() - 1000 * 60 * 30) },
    { patient: patient._id, recordedBy: doctor._id, notes: 'Temperature 36.7 C', timestamp: now }
  ];

  for (const s of samples) {
    const v = new Vital(s);
    await v.save();
    console.log('Saved vital id', v._id.toString(), 'for', patient._id.toString());
  }

  console.log('Sample vitals added.');
  process.exit(0);
}

async function run() {
  try {
    await connectDB();
    // Find a patient by name or get the first patient
    const patient = await Patient.findOne({ name: 'Test Patient' }).exec();
    if (!patient) {
      // Try to get any patient
      const anyPatient = await Patient.findOne().exec();
      if (!anyPatient) {
        console.error('No patient found. Please create a patient first using the API or setup script.');
        process.exit(1);
      }
      console.log(`Using patient: ${anyPatient.name} (${anyPatient._id})`);
      await addVitals(anyPatient);
      return;
    }
    await addVitals(patient);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

run();
