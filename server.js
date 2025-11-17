require('dotenv').config();
require('express-async-errors');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const vitalRoutes = require('./routes/vitals');
const alertRoutes = require('./routes/alerts');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => res.json({ ok: true, msg: 'Patient Vitals Tracker API' }));

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/vitals', vitalRoutes);
app.use('/api/alerts', alertRoutes);

app.use((err, req, res, next) => {
  console.error(err); 
  if (err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({ error: err.message || 'Client error' });
  }
  res.status(500).json({ error: 'Server error' });
});

const PORT = process.env.PORT || 4000;
connectDB().then(() => {
  const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Error: Port ${PORT} is already in use. Is the server already running in another terminal?`);
      process.exit(1);
    }
  });
});