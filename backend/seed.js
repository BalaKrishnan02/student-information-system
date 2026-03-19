const mongoose = require('mongoose');
const User = require('./backend/models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './backend/.env' });

async function seedAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const username = 'admin';
        const existing = await User.findOne({ username });
        if (existing) {
            console.log('Admin already exists');
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash('admin123', 10);
        const admin = new User({
            username: username,
            password: hashedPassword,
            role: 'admin'
        });

        await admin.save();
        console.log('Created admin: admin / admin123');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seedAdmin();
