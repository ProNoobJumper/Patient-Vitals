const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Patient = require('../models/Patient');


const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

exports.register = async (req, res) => {
  const { name, email, password, role, doctorId, patientInfo } = req.body;

  if (!['doctor','patient'].includes(role)) {
    return res.status(400).json({ error: 'role must be doctor or patient' });
  }
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ error: 'Email already in use' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = new User({ name, email, passwordHash, role });

  if (role === 'patient') {
    if (!doctorId) return res.status(400).json({ error: 'doctorId required for patient' });
    const patientDoc = new Patient({
      name: patientInfo?.name || name,
      dob: patientInfo?.dob,
      doctor: doctorId,
      meta: patientInfo?.meta || {}
    });
    await patientDoc.save();
    user.patientRef = patientDoc._id;

    
  }

  await user.save();
  const token = generateToken(user);
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
  const token = generateToken(user);
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
};
