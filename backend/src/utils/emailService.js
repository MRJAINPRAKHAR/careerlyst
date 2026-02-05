const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // App Password
    }
});

// Helper to partially mask the password for logging
const maskPassword = (pass) => {
    if (!pass) return 'N/A';
    if (pass.length <= 4) return '*'.repeat(pass.length);
    return '*'.repeat(pass.length - 4) + pass.slice(-4);
};

console.log(`> [DEBUG] Email config - User: ${process.env.EMAIL_USER}, Pass: ${maskPassword(process.env.EMAIL_PASS)}`);

const sendEmail = async (to, subject, html) => {
    try {
        const mailOptions = {
            from: `"Careerlyst AI" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        };
        await transporter.sendMail(mailOptions);
        console.log(`📧 Email sent to ${to}`);
        return true;
    } catch (error) {
        console.error("❌ Email sending failed:", error); // Inspect the full error object
        return false;
    }
};

module.exports = { sendEmail };
