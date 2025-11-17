const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');


const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ error: 'Email already in use' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = new User({ name, email, passwordHash, role: 'doctor' });

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

exports.getDoctor = async (req, res) => {
  let doctor = await User.findOne({ role: 'doctor' });
  if (!doctor) {
    const passwordHash = await bcrypt.hash('password', 10);
    doctor = new User({
      name: 'Dr. Smith',
      email: 'dr.smith@example.com',
      passwordHash,
      role: 'doctor',
    });
    await doctor.save();
  }
  res.json({ doctor });
};
