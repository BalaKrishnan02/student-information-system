const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

dotenv.config();

const updateTeacherPasswords = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB...');

        const salt = await bcrypt.genSalt(10);
        const hashedTeacherPassword = await bcrypt.hash('teacher123', salt);

        const result = await User.updateMany(
            { role: 'teacher' },
            { $set: { password: hashedTeacherPassword } }
        );

        console.log(`Successfully updated ${result.modifiedCount} teacher accounts.`);
        process.exit(0);
    } catch (err) {
        console.error('Error updating passwords:', err);
        process.exit(1);
    }
};

updateTeacherPasswords();
