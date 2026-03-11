const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Student = require('./models/Student');
const Mark = require('./models/Mark');
const Attendance = require('./models/Attendance');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');
const Teacher = require('./models/Teacher');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected for Seeding'))
    .catch(err => console.log(err));

const students = [];

const marks = [];


const attendance = [];

// Old courses data removed — new courses are added via Admin Dashboard
const courses = [];

// Old teacher data removed — new teachers are added via Admin Dashboard
const teachers = [];

const seedData = async () => {
    try {
        // Only seed courses (students & teachers are now managed via Admin Dashboard)
        const seedCourseIds = courses.map(c => c.courseId);

        // Clear old course data only
        await Course.deleteMany({ courseId: { $in: seedCourseIds } });
        console.log('Cleared old course data...');

        // Seed Courses
        if (courses.length > 0) {
            await Course.insertMany(courses);
            console.log('Courses Seeded');
        }

        // Seed Students (if any are added back to the array)
        if (students.length > 0) {
            const enrichedStudents = students.map(s => {
                const start = new Date(2005, 0, 1);
                const end = new Date(2006, 11, 31);
                const randomDob = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
                return {
                    studentId: s.studentId, name: s.name, dob: randomDob,
                    gender: s.gender || 'Other', email: s.email, phone: '9876543210',
                    address: s.address, department: s.dept, course: 'B.Tech',
                    semester: s.year === '3rd' ? 'Sem 5' : 'Sem 1', photo: s.photoUrl || ''
                };
            });
            await Student.insertMany(enrichedStudents);
            console.log('Students Seeded');

            const salt = await bcrypt.genSalt(10);
            const studentPassword = await bcrypt.hash('student123', salt);
            const teacherPassword = await bcrypt.hash('teacher123', salt);

            let userAccounts = enrichedStudents.map(s => ({
                username: s.studentId, password: studentPassword, role: 'student'
            }));

            if (teachers.length > 0) {
                const teacherAccounts = teachers.map(t => ({
                    username: t.teacherId, password: teacherPassword, role: 'teacher'
                }));
                userAccounts = [...userAccounts, ...teacherAccounts];
            }
            await User.insertMany(userAccounts);
            console.log('User Accounts Seeded');

            if (marks.length > 0) {
                await Mark.insertMany(marks);
                console.log('Marks Seeded');
            }
        }

        // Seed Teachers (if any are added back to the array)
        if (teachers.length > 0) {
            await Teacher.insertMany(teachers);
            console.log('Teachers Seeded');
        }

        console.log('Data Seeding Completed Successfully');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedData();
