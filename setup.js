require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');

async function setup() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    
    // Check if doctor already exists
    const existingDoctor = await User.findOne({ email: 'doctor@example.com' });
    if (existingDoctor) {
      console.log('✓ Doctor account already exists');
      console.log(`  Email: doctor@example.com`);
      console.log(`  Password: password123`);
      process.exit(0);
    }
    
    // Create doctor account
    const passwordHash = await bcrypt.hash('password123', 10);
    const doctor = new User({
      name: 'Dr. John Smith',
      email: 'doctor@example.com',
      passwordHash,
      role: 'doctor'
    });
    await doctor.save();
    console.log('✓ Doctor account created successfully');
    console.log(`  Email: doctor@example.com`);
    console.log(`  Password: password123`);
    
    process.exit(0);
  } catch (err) {
    console.error('Setup error:', err.message);
    process.exit(1);
  }
}

setup();
