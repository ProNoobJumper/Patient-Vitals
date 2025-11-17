# Patient Vitals Tracker

A comprehensive web application for monitoring patient vital signs including Blood Pressure, Blood Sugar, and Pulse. Designed for healthcare professionals to track and analyze patient health metrics in real-time.

## 🏥 Features

### For Doctors
- **Patient Dashboard**: View all assigned patients with color-coded health status indicators
- **Real-time Monitoring**: Track blood pressure, glucose levels, and pulse readings
- **Alert System**: Automatic notifications for critical or warning-level vitals
- **Trend Analysis**: Visual charts showing patient health trends over time
- **Quick Search**: Search patients by name or Medical Record Number (MRN)


### Technical Features
- 🎨 **Modern UI**: Animated splash screen with medical-themed SVG graphics
- 📊 **Interactive Charts**: Powered by Chart.js for data visualization
- 🔐 **Secure Authentication**: JWT-based authentication with role-based access control
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- ♿ **Accessible**: Keyboard navigation and ARIA labels for screen readers
- 🎭 **Animated Login**: Cute interactive bot that responds to user input

## 🚀 Tech Stack

### Frontend
- **HTML5/CSS3/JavaScript**: No build tools required
- **Chart.js 4.4.4**: Data visualization
- **Custom CSS**: Inter font family, modern design system
- **Hash-based Routing**: Simple SPA navigation

### Backend
- **Node.js & Express**: RESTful API server
- **MongoDB & Mongoose**: Database and ODM
- **JWT**: Secure authentication
- **bcryptjs**: Password hashing
- **Joi**: Request validation
- **express-rate-limit**: API rate limiting

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Modern web browser (Chrome, Firefox, Safari, Edge)

## 🔧 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd patient-vitals-tracker
```

### 2. Backend Setup
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the project root directory:

```env
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/patient_vitals
JWT_SECRET=your-secure-512-bit-secret-key-here
JWT_EXPIRES_IN=7d

# Alert Thresholds
ALERT_THRESHOLD_BP_SYS=140
ALERT_THRESHOLD_BP_DIA=90
ALERT_THRESHOLD_SUGAR_HIGH=200
ALERT_THRESHOLD_SUGAR_LOW=70
ALERT_THRESHOLD_PULSE_HIGH=120
ALERT_THRESHOLD_PULSE_LOW=40
```

**⚠️ Important**: Generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Start MongoDB
```bash
# Using MongoDB service
sudo service mongod start

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 5. Start the Backend Server
```bash
npm run dev   # or: node server.js
```

The API will run on `http://localhost:4000`

### 6. Frontend Setup
Simply open `index.html` in the project root in a web browser, or use a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js http-server
npx http-server -p 8000

# Using VS Code Live Server extension
# Right-click index.html → Open with Live Server
```

Access the application at `http://localhost:8000`

## 📚 API Documentation

### Authentication Endpoints

#### Default development doctor

During development you can auto-create (or fetch) a doctor by calling:

```http
GET /api/auth/get-doctor
```

This ensures there is at least one doctor user with:

- Email: `dr.smith@example.com`
- Password: `password`

Use these credentials on the web UI login screen unless you register your own doctor account.

#### Register Doctor
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Dr. John Smith",
  "email": "doctor@hospital.com",
  "password": "securePassword123"
}
```


#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "doctor@hospital.com",
  "password": "securePassword123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "name": "Dr. John Smith",
    "email": "doctor@hospital.com",
    "role": "doctor"
  }
}
```

### Patient Endpoints

#### Create Patient (Doctor only)
```http
POST /api/patients
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John Carter",
  "dob": "1985-03-20",
  "gender": "male",
  "contact": "+1234567890",
  "meta": {
    "bloodType": "O+",
    "allergies": ["penicillin"]
  }
}
```

#### Get All Patients (Doctor only)
```http
GET /api/patients
Authorization: Bearer {token}
```

#### Get Patient by ID
```http
GET /api/patients/:id
Authorization: Bearer {token}
```

### Vitals Endpoints

#### Add Vital Reading
```http
POST /api/vitals
Authorization: Bearer {token}
Content-Type: application/json

{
  "patient": "patient_mongodb_id",
  "timestamp": "2025-11-13T10:30:00Z",
  "bloodPressure": {
    "systolic": 120,
    "diastolic": 80
  },
  "sugarMgDl": 95,
  "pulse": 72,
  "notes": "Patient feeling normal"
}
```

#### Get Patient Vitals
```http
GET /api/vitals/patient/:patientId?from=2025-11-01&to=2025-11-13&limit=100
Authorization: Bearer {token}
```

#### Get Patient Statistics
```http
GET /api/vitals/patient/:patientId/stats?from=2025-11-01&to=2025-11-13
Authorization: Bearer {token}

Response:
{
  "avgSystolic": 125.5,
  "avgDiastolic": 82.3,
  "avgSugar": 98.7,
  "avgPulse": 74.2,
  "minSugar": 85,
  "maxSugar": 115,
  "count": 24
}
```

### Alert Endpoints

#### Get Alerts (Doctor)
```http
GET /api/alerts
Authorization: Bearer {token}
```

#### Acknowledge Alert (Doctor)
```http
POST /api/alerts/:id/ack
Authorization: Bearer {token}
```

## 🎯 Usage Guide

### For Doctors

1. **Login**: Use the doctor credentials to access the system
2. **Dashboard**: View all assigned patients with status indicators:
   - 🟢 **Green (Normal)**: All vitals in healthy range
   - 🟡 **Yellow (Warning)**: Some readings outside ideal range
   - 🔴 **Red (Critical)**: Immediate attention required
3. **Search**: Use the search bar to find patients by name or MRN
4. **Patient Details**: Click any patient card to view:
   - Current readings
   - Historical charts
   - Trend alerts
   - Alert notifications

### Alert Thresholds

The system automatically generates alerts based on these thresholds:

| Metric | Warning | Critical |
|--------|---------|----------|
| Systolic BP | ≥130 mmHg | ≥140 mmHg |
| Diastolic BP | ≥85 mmHg | ≥90 mmHg |
| Blood Sugar | 160-200 mg/dL or 70-80 mg/dL | >200 mg/dL or <70 mg/dL |
| Pulse | 100-120 bpm or 55-60 bpm | >120 bpm or <55 bpm |

## 🗂️ Project Structure

```
patient-vitals-tracker/
├── index.html              # Main HTML file (frontend)
├── styles.css              # Styling
├── app.js                  # Frontend logic
├── server.js               # Express server entry point
├── config/
│   └── db.js               # MongoDB connection
├── models/
│   ├── User.js             # User schema
│   ├── Patient.js          # Patient schema
│   ├── Vital.js            # Vital signs schema
│   └── Alert.js            # Alert schema
├── controllers/
│   ├── authController.js
│   ├── patientController.js
│   ├── vitalController.js
│   └── alertController.js
├── routes/
│   ├── auth.js
│   ├── patients.js
│   ├── vitals.js
│   └── alerts.js
├── middleware/
│   ├── auth.js             # JWT authentication
│   └── validate.js         # Request validation
├── utils/
│   └── alerts.js           # Alert evaluation logic
├── .env                    # Environment variables
├── package.json
└── README.md
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Role-Based Access Control**: Doctor-only access with patient data management
- **Request Validation**: Joi schema validation for all API requests
- **Rate Limiting**: Prevents brute force attacks (20 requests per 15 minutes)
- **HTTPS Ready**: Configure SSL certificates for production

## 🎨 Customization

### Modify Alert Thresholds
Edit the `.env` file to adjust health metric thresholds:
```env
ALERT_THRESHOLD_BP_SYS=140
ALERT_THRESHOLD_BP_DIA=90
ALERT_THRESHOLD_SUGAR_HIGH=200
ALERT_THRESHOLD_SUGAR_LOW=70
```

### Change Color Scheme
Edit CSS variables in `styles.css`:
```css
:root {
  --bg: #f9fafb;
  --card: #ffffff;
  --text: #111827;
  --primary: #2563eb;
  --ok: #10b981;
  --warn: #f59e0b;
  --crit: #ef4444;
}
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check MongoDB status
sudo service mongod status

# View MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Restart MongoDB
sudo service mongod restart
```

### Port Already in Use
```bash
# Find process using port 4000
lsof -i :4000

# Kill the process
kill -9 <PID>
```

### CORS Errors
Ensure the backend CORS configuration matches your frontend URL:
```javascript
app.use(cors({
  origin: 'http://localhost:8000'
}));
```

## 📝 Demo Data

The frontend includes mock patient data for demonstration:
- 5 sample patients with 24 hours of vital readings
- Realistic data variations and trends
- Pre-configured alert scenarios

## 🚀 Deployment

### Backend (Node.js)
- **Heroku**: `heroku create && git push heroku main`
- **DigitalOcean**: Use App Platform or Droplet
- **AWS**: Elastic Beanstalk or EC2

### Frontend
- **Netlify**: Drag and drop deployment
- **Vercel**: GitHub integration
- **GitHub Pages**: Static hosting

### Database
- **MongoDB Atlas**: Free cloud database
- **mLab**: Managed MongoDB hosting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Development Team

## 🙏 Acknowledgments

- Chart.js for visualization library
- Inter font family by Rasmus Andersson
- Medical community for threshold guidelines

## 📞 Support

For issues and questions:
- Email: medical-it@hospital.com
- GitHub Issues: [Create an issue]

## 🔮 Future Enhancements

- [ ] Email/SMS notifications for critical alerts
- [ ] PDF export of patient reports
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Integration with medical devices
- [ ] Advanced analytics and ML predictions
- [ ] Telemedicine video consultation
- [ ] Medication tracking
- [ ] Appointment scheduling

---

**Version**: 1.0.0  
**Last Updated**: November 2025
