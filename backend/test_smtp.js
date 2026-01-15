// SMTP Connection Test
import nodemailer from 'nodemailer';
import 'dotenv/config';

const testSMTP = async () => {
    console.log('🔧 Testing SMTP connection...');
    console.log(`📧 Using: ${process.env.SMTP_USER}`);

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    try {
        await transporter.verify();
        console.log('✅ SMTP connection successful!');
        console.log('✅ Email sending is configured correctly.');
    } catch (error) {
        console.error('❌ SMTP connection failed:', error.message);
        process.exit(1);
    }

    process.exit(0);
};

testSMTP();
