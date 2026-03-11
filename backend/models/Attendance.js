const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    studentId: { type: String, required: true }, // Refers to Student.studentId
    courseId: { type: String, required: true },  // Refers to Course.courseId
    date: { type: Date, required: true },
    status: { type: String, enum: ['Present', 'Absent', 'Late'], required: true }
});

module.exports = mongoose.model('Attendance', AttendanceSchema);
