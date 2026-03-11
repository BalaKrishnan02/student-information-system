const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sis')
    .then(async () => {
        console.log('Connected to DB');

        const studentSchema = new mongoose.Schema({ studentId: String, photo: String }, { strict: false });
        const StudentModel = mongoose.models.Student || mongoose.model('Student', studentSchema);

        const profileDir = path.join(__dirname, 'profile');
        if (!fs.existsSync(profileDir)) {
            console.log('Profile directory does not exist!');
            process.exit(1);
        }

        const files = fs.readdirSync(profileDir);
        let updatedCount = 0;

        for (const file of files) {
            // e.g., '23TH0204.jpeg' -> '23TH0204'
            const ext = path.extname(file);
            const studentId = path.basename(file, ext);

            if (studentId) {
                const student = await StudentModel.findOne({ studentId });
                if (student) {
                    student.photo = file;
                    await student.save();
                    console.log(`Linked photo ${file} to student ${studentId}`);
                    updatedCount++;
                } else {
                    console.log(`Student with ID ${studentId} not found in DB.`);
                }
            }
        }

        console.log(`Finished updating. Total students updated: ${updatedCount}`);
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
