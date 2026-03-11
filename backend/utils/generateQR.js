const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const generateQR = async (userId, role) => {
    try {
        const qrDir = path.join(__dirname, '..', 'qrcode', role);
        if (!fs.existsSync(qrDir)) {
            fs.mkdirSync(qrDir, { recursive: true });
        }

        const qrData = JSON.stringify({ username: userId, role: role, type: 'SIS_LOGIN_QR' });
        const filePath = path.join(qrDir, `${userId}_qr.png`);

        await QRCode.toFile(filePath, qrData, {
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            },
            width: 300,
            margin: 2
        });

        console.log(`QR code generated for ${userId} (${role})`);
        return true;
    } catch (err) {
        console.error('Error generating QR code:', err);
        return false;
    }
};

module.exports = { generateQR };
