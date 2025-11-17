require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');

async function run() {
  await connectDB();
  const u = await User.findOne({ email: 'patient@example.com' }).lean();
  console.log('User:', u);
  const doc = await User.findOne({ email: 'doctor@example.com' }).lean();
  console.log('Doctor user:', doc);
  process.exit(0);
}
run().catch(err => { console.error(err); process.exit(1); });
