const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const verifyData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB...");

        const teacherCount = await mongoose.connection.collection('teachers').countDocuments();
        console.log(`teachers: ${teacherCount}`);

        const studentCount = await mongoose.connection.collection('students').countDocuments();
        console.log(`students: ${studentCount}`);

        const courseCount = await mongoose.connection.collection('courses').countDocuments();
        console.log(`courses: ${courseCount}`);

        const userCount = await mongoose.connection.collection('users').countDocuments();
        console.log(`users: ${userCount}`);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

verifyData();
