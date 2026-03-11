const mongoose = require('mongoose');
require('dotenv').config();
const Teacher = require('./models/Teacher');
const Course = require('./models/Course');

async function getTeacherCourseStats() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const allTeachers = await Teacher.find({});
        const allCourses = await Course.find({});

        const departmentMap = {};

        allTeachers.forEach(teacher => {
            if (!departmentMap[teacher.department]) {
                departmentMap[teacher.department] = [];
            }

            // Find course taught by this teacher
            const courseTaught = allCourses.find(c => c.instructor === teacher.name);

            departmentMap[teacher.department].push({
                name: teacher.name,
                course: courseTaught ? `${courseTaught.courseId} - ${courseTaught.courseName}` : 'No Course Assigned'
            });
        });

        console.log('--- Teacher Course Assignments by Department ---');
        for (const dept in departmentMap) {
            console.log(`\n[${dept}]`);
            departmentMap[dept].forEach(t => {
                console.log(`- ${t.name.padEnd(25)} : ${t.course}`);
            });
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

getTeacherCourseStats();
