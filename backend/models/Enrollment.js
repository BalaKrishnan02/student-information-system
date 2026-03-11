const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema({
    studentId: { type: String, required: true },
    courseId: { type: String, required: true },
    semester: { type: String, required: true },
    academicYear: { type: String, required: true },
    status: { type: String, default: 'Enrolled' },
    enrollmentDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Enrollment', EnrollmentSchema);
