const mongoose = require('mongoose');
const User = require('../models/User');
const { generateQR } = require('./generateQR');
require('dotenv').config({ path: '../.env' });

const backfill = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sis');
        console.log('Connected to DB');

        const users = await User.find({});
        for (let user of users) {
            await generateQR(user.username, user.role);
            console.log(`Generated QR for ${user.username} (${user.role})`);
        }

        console.log('Backfill complete!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

backfill();
