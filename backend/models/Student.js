const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    studentId: { type: String, required: true, unique: true },
    firstName: { type: String },
    lastName: { type: String },
    name: { type: String, required: true }, // Keep full name for compatibility
    dob: { type: Date, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    grade: { type: String },
    school: { type: String },
    department: { type: String, required: true },
    course: { type: String, required: true },
    semester: { type: String, required: true },
    photo: { type: String }, // URL to photo
    createdAt: { type: Date, default: Date.now }
});

// Pre-save hook to populate name from first and last if available
StudentSchema.pre('validate', function () {
    if (this.firstName && this.lastName) {
        this.name = `${this.firstName} ${this.lastName}`;
    } else if (!this.name && this.firstName) {
        this.name = this.firstName;
    }
});

module.exports = mongoose.model('Student', StudentSchema);
