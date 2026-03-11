const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({}, 'username role');
        console.log('--- Users in DB ---');
        users.forEach(u => console.log(`User: ${u.username}, Role: ${u.role}`));
        console.log('--- End ---');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkUsers();
