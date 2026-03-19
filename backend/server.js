const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
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
