const mongoose = require('mongoose');
require('dotenv').config();
const Teacher = require('./models/Teacher');
const Course = require('./models/Course');

async function updateDepartment() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // 1. Update Teachers
        const teacherResult = await Teacher.updateMany(
            { department: 'Civil' },
            { $set: { department: 'Information Technology' } }
        );
        console.log(`Teachers updated: ${teacherResult.modifiedCount}`);

        // 2. Update Courses if they match 'Civil' (optional but good for consistency)
        const courseResult = await Course.updateMany(
            { department: 'Civil' },
            { $set: { department: 'Information Technology' } }
        );
        console.log(`Courses updated: ${courseResult.modifiedCount}`);

        // 3. Update any specific instructor mappings in Course if needed? 
        // Not requested, but let's see what changed.

        const updatedTeachers = await Teacher.find({ department: 'Information Technology' }, 'name department');
        console.log('--- Updated Teachers ---');
        updatedTeachers.forEach(t => console.log(`${t.name}: ${t.department}`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

updateDepartment();
