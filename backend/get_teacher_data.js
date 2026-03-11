const mongoose = require('mongoose');
require('dotenv').config();
const Teacher = require('./models/Teacher');

async function getTeacherDetailedData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const teachers = await Teacher.find({}, 'teacherId name department');
        console.log('--- Teacher Data ---');
        console.log('| ID | Name | Department | Default Password |');
        console.log('|---|---|---|---|');
        teachers.forEach(t => {
            console.log(`| ${t.teacherId} | ${t.name} | ${t.department} | teacher123 |`);
        });
        console.log('--- End ---');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

getTeacherDetailedData();
