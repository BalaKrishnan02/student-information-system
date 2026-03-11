const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    courseId: { type: String, required: true, unique: true },
    courseName: { type: String, required: true },
    department: { type: String, required: true },
    credits: { type: Number, required: true },
    semester: { type: String, default: 'Sem 1' },
    courseLevel: { type: String, enum: ['Undergraduate', 'Postgraduate', 'Diploma'], default: 'Undergraduate' },
    duration: { type: String, placeholder: 'e.g. 6 Months' },
    instructor: { type: String },
    capacity: { type: Number, default: 60 },
    description: { type: String },
    status: { type: String, enum: ['Active', 'Inactive', 'Upcoming'], default: 'Active' }
});

module.exports = mongoose.model('Course', CourseSchema);
