const mongoose = require('mongoose');
require('dotenv').config();
const Enrollment = require('./models/Enrollment');
const Attendance = require('./models/Attendance');
const Student = require('./models/Student');

async function checkData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const students = await Student.find({}, 'studentId name').limit(1);
        if (students.length === 0) {
            console.log('No students found');
            process.exit(0);
        }

        const sId = students[0].studentId;
        console.log(`Checking data for student: ${sId} (${students[0].name})`);

        const enrollments = await Enrollment.find({ studentId: sId });
        console.log(`Enrollments: ${enrollments.length}`);

        const attendance = await Attendance.find({ studentId: sId });
        console.log(`Attendance Records: ${attendance.length}`);

        const allStudentIds = await Enrollment.distinct('studentId');
        console.log(`Total Unique Student IDs in Enrollments: ${allStudentIds.length}`);

        const allAttendanceIds = await Attendance.distinct('studentId');
        console.log(`Total Unique Student IDs in Attendance: ${allAttendanceIds.length}`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();
