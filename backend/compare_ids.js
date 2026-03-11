const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Enrollment = require('./models/Enrollment');

async function compare() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const user = await User.findOne({ role: 'student' });
        console.log(`User username: "${user.username}"`);

        const enrollment = await Enrollment.findOne({ studentId: user.username });
        console.log(`Enrollment found for this username: ${!!enrollment}`);

        if (!enrollment) {
            const anyEnrollment = await Enrollment.findOne({});
            console.log(`Example studentId in Enrollment: "${anyEnrollment.studentId}"`);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

compare();
