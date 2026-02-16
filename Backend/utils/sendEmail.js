const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * Send an OTP email with hacker-themed styling
 * @param {string} to - Recipient email
 * @param {string} otp - 6-digit OTP code
 * @param {string} purpose - 'register' or 'reset'
 */
const sendOtpEmail = async (to, otp, purpose) => {
    const subject = purpose === 'register'
        ? '🔐 VERIFICATION CODE — Identity Confirmation'
        : '🔐 RECOVERY CODE — Password Reset';

    const heading = purpose === 'register'
        ? 'IDENTITY VERIFICATION REQUIRED'
        : 'PASSWORD RECOVERY INITIATED';

    const htmlContent = `
    <div style="background-color: #0c0c0c; padding: 30px; font-family: 'Courier New', monospace; color: #0f0; max-width: 500px; margin: 0 auto; border: 1px solid #0f03;">
        <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #0f0; font-size: 18px; letter-spacing: 3px; text-shadow: 0 0 10px #0f0;">${heading}</h1>
        </div>
        
        <div style="border: 1px solid #0f03; padding: 15px; margin-bottom: 20px;">
            <p style="color: #888; font-size: 12px; margin: 0;">> SYSTEM_MESSAGE:</p>
            <p style="color: #ccc; font-size: 13px; margin: 5px 0 0 0;">A security token has been generated for your request. Enter this code to proceed.</p>
        </div>
        
        <div style="text-align: center; padding: 25px; background-color: #111; border: 2px solid #0f0; margin-bottom: 20px;">
            <p style="color: #888; font-size: 11px; letter-spacing: 2px; margin: 0 0 10px 0;">SECURITY_TOKEN</p>
            <h2 style="color: #0f0; font-size: 36px; letter-spacing: 12px; margin: 0; text-shadow: 0 0 20px #0f0;">${otp}</h2>
        </div>
        
        <div style="border: 1px solid #f003; padding: 10px; margin-bottom: 15px;">
            <p style="color: #f66; font-size: 11px; margin: 0;">⚠ WARNING: This code expires in 60 seconds. Do not share it with anyone.</p>
        </div>
        
        <div style="text-align: center;">
            <p style="color: #555; font-size: 10px; letter-spacing: 1px;">[ AUTOMATED_TRANSMISSION — DO_NOT_REPLY ]</p>
        </div>
    </div>
    `;

    const mailOptions = {
        from: `"AUTH_SYSTEM" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html: htmlContent
    };

    console.log('====================================================');
    console.log(`[DEV INFO] Sending OTP to ${to}`);
    console.log(`[DEV INFO] OTP Code: ${otp}`);
    console.log('====================================================');

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`[DEV INFO] Email sent successfully! Message ID: ${info.messageId}`);
    } catch (error) {
        console.error('[DEV ERROR] Failed to send email:', error);
        throw error; // Re-throw to be caught by controller
    }
};

/**
 * Send an account lockout alert email
 * @param {string} to - Recipient email
 */
const sendLockoutAlert = async (to) => {
    const resetUrl = 'http://localhost:5173/forgot-access-code';

    const htmlContent = `
    <div style="background-color: #0c0c0c; padding: 30px; font-family: 'Courier New', monospace; color: #ff3333; max-width: 500px; margin: 0 auto; border: 1px solid #ff333355;">
        <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #ff3333; font-size: 18px; letter-spacing: 3px; text-shadow: 0 0 10px #ff3333;">⚠ SECURITY ALERT</h1>
        </div>
        <div style="border: 1px solid #ff333333; padding: 15px; margin-bottom: 20px; background-color: #1a0000;">
            <p style="color: #ff6666; margin: 0 0 10px 0; font-size: 12px;">> STATUS: ACCOUNT_LOCKED</p>
            <p style="color: #ff9999; margin: 0 0 10px 0; font-size: 12px;">> REASON: MULTIPLE_FAILED_LOGIN_ATTEMPTS</p>
            <p style="color: #ff9999; margin: 0; font-size: 12px;">> THRESHOLD: 5_ATTEMPTS_EXCEEDED</p>
        </div>
        <div style="text-align: center; margin: 25px 0;">
            <p style="color: #ffaa00; font-size: 13px; margin-bottom: 15px;">Your account has been locked due to suspicious login activity.</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 12px 30px; background-color: #ff3333; color: #000; text-decoration: none; font-family: 'Courier New', monospace; font-weight: bold; letter-spacing: 2px; font-size: 14px; border: none;">RESET_PASSWORD</a>
        </div>
        <div style="border-top: 1px solid #ff333333; padding-top: 15px; margin-top: 15px;">
            <p style="color: #ff666666; font-size: 10px; margin: 0; text-align: center;">If this was not you, reset your password immediately.</p>
        </div>
    </div>`;

    const mailOptions = {
        from: `"SECURITY SYSTEM" <${process.env.EMAIL_USER}>`,
        to,
        subject: '🚨 SECURITY ALERT — Account Locked',
        html: htmlContent
    };

    console.log('====================================================');
    console.log(`[SECURITY] Sending lockout alert to ${to}`);
    console.log('====================================================');

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`[SECURITY] Alert email sent! Message ID: ${info.messageId}`);
    } catch (error) {
        console.error('[SECURITY ERROR] Failed to send alert:', error);
    }
};

module.exports = { sendOtpEmail, sendLockoutAlert };
