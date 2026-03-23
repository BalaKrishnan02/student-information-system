// Use Google DNS to resolve MongoDB Atlas SRV records (fixes ISP DNS blocking)
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'https://student-information-system-mu.vercel.app'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow all origins in development or if they are in the allowed list
        if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            console.log('Blocked by CORS:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/student');
const courseRoutes = require('./routes/course');
const attendanceRoutes = require('./routes/attendance');
const markRoutes = require('./routes/mark');
const enrollmentRoutes = require('./routes/enrollment');
const teacherRoutes = require('./routes/teacher');

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/marks', markRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/teachers', teacherRoutes);

app.get('/', (req, res) => {
    res.send('Student Information System API is running');
});

// Dynamic QR zip endpoint
app.get('/qrcode/:role_qrcodes.zip', async (req, res) => {
    const role = req.params.role;
    if (!['student', 'teacher', 'admin'].includes(role)) {
        return res.status(400).send('Invalid role');
    }

    const archiver = require('archiver');
    const qrDir = path.join(__dirname, 'qrcode', role);
    const fs = require('fs');

    if (!fs.existsSync(qrDir)) {
        return res.status(404).send('No QR codes found for this role');
    }

    res.attachment(`${role}_qrcodes.zip`);
    const archive = archiver('zip', {
        zlib: { level: 9 }
    });

    archive.on('error', function (err) {
        if (!res.headersSent) {
            res.status(500).send({ error: err.message });
        }
    });

    archive.pipe(res);
    archive.directory(qrDir, false);
    await archive.finalize();
});

app.use('/qrcode', express.static(path.join(__dirname, 'qrcode')));
app.use('/profile', express.static(path.join(__dirname, 'profile')));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
