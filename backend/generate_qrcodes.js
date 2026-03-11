const mongoose = require('mongoose');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const User = require('./models/User');

const QR_BASE_DIR = path.join(__dirname, 'qrcode');
const ROLES = ['student', 'teacher', 'admin'];

async function generateQRCodes() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Create directory structure
        if (!fs.existsSync(QR_BASE_DIR)) fs.mkdirSync(QR_BASE_DIR);
        ROLES.forEach(role => {
            const roleDir = path.join(QR_BASE_DIR, role);
            if (!fs.existsSync(roleDir)) fs.mkdirSync(roleDir);
        });

        // 2. Fetch all users
        const users = await User.find({});
        console.log(`Generating QR codes for ${users.length} users...`);

        for (const user of users) {
            const qrData = JSON.stringify({
                username: user.username,
                role: user.role,
                type: 'SIS_LOGIN_QR' // Tag to identify it's our app
            });

            const fileName = `${user.username}_qr.png`;
            const filePath = path.join(QR_BASE_DIR, user.role, fileName);

            await QRCode.toFile(filePath, qrData, {
                color: {
                    dark: '#4F46E5', // Primary color
                    light: '#FFFFFF'
                },
                width: 300
            });
        }

        console.log('Successfully generated all QR codes in ./qrcode/ folder');
        process.exit(0);
    } catch (err) {
        console.error('Error generating QR codes:', err);
        process.exit(1);
    }
}

generateQRCodes();
