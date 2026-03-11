const mongoose = require('mongoose');
require('dotenv').config();
const Teacher = require('./models/Teacher');

async function checkTeachers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const teachers = await Teacher.find({}, 'teacherId name');
        console.log('--- Current Teachers in DB ---');
        teachers.forEach(t => console.log(`ID: ${t.teacherId}, Name: ${t.name}`));
        console.log('--- End ---');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkTeachers();
