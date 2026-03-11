const mongoose = require('mongoose');

const TeacherSchema = new mongoose.Schema({
    teacherId: { type: String, required: true, unique: true },
    firstName: { type: String },
    lastName: { type: String },
    name: { type: String, required: true },
    gender: { type: String },
    phone: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    department: { type: String, required: true },
    designation: { type: String },
    qualification: { type: String },
    specialization: { type: String },
    email: { type: String, required: true },
    photoUrl: { type: String }
});

// Pre-save hook to populate name from first and last if available
TeacherSchema.pre('validate', function () {
    if (this.firstName && this.lastName) {
        this.name = `${this.firstName} ${this.lastName}`;
    } else if (!this.name && this.firstName) {
        this.name = this.firstName;
    }
});

module.exports = mongoose.model('Teacher', TeacherSchema);
