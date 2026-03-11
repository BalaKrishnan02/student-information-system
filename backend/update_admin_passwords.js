const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

dotenv.config();

const updateAdminPasswords = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB...');

        const salt = await bcrypt.genSalt(10);
        const hashedAdminPassword = await bcrypt.hash('admin123', salt);

        const result = await User.updateMany(
            { role: 'admin' },
            { $set: { password: hashedAdminPassword } }
        );

        console.log(`Successfully updated ${result.modifiedCount} admin accounts.`);
        if (result.modifiedCount === 0) {
            console.log('Note: No admin accounts were found to update. You can register an admin account on the registration page.');
        }
        process.exit(0);
    } catch (err) {
        console.error('Error updating passwords:', err);
        process.exit(1);
    }
};

updateAdminPasswords();
