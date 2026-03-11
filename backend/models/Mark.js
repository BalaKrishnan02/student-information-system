const mongoose = require('mongoose');

const MarkSchema = new mongoose.Schema({
    studentId: { type: String, required: true },
    courseId: { type: String, required: true }, // Changed from subject to courseId
    examType: { type: String, required: true }, // Added examType
    marks: { type: Number, required: true },
    grade: { type: String, required: true },
    gradePoints: { type: Number, default: 0 },
    semester: { type: String }
});

module.exports = mongoose.model('Mark', MarkSchema);
