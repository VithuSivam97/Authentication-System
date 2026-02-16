const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Otp = require('../models/Otp');
const generateOtp = require('../utils/generateOtp');
const { sendOtpEmail, sendLockoutAlert } = require('../utils/sendEmail');

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

/**
 * POST /api/auth/register
 * Step 1: Validate fields, hash password, send OTP email
 */
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({
                error: '409_CONFLICT',
                status: 'EMAIL_EXISTS',
                action: 'USE_DIFFERENT_EMAIL'
            });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate OTP
        const otp = generateOtp();

        // Delete any existing OTPs for this email (prevents duplicates)
        await Otp.deleteMany({ email: email.toLowerCase(), purpose: 'register' });

        // Save OTP with temp user data
        await Otp.create({
            email: email.toLowerCase(),
            otp,
            purpose: 'register',
            tempUserData: {
                username,
                email: email.toLowerCase(),
                password: hashedPassword
            },
            expiresAt: new Date(Date.now() + 60 * 1000) // 1 minute
        });

        // Send OTP email
        await sendOtpEmail(email, otp, 'register');

        res.status(200).json({
            status: 'OTP_SENT',
            message: 'VERIFICATION_PACKET_SENT'
        });
    } catch (err) {
        console.error('[REGISTER ERROR]', err);
        res.status(500).json({
            error: '500_SERVER_ERROR',
            status: 'REGISTRATION_FAILED',
            action: 'TRY_AGAIN'
        });
    }
};

/**
 * POST /api/auth/verify-register-otp
 * Step 2: Verify OTP, create user, return JWT
 */
const verifyRegisterOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Find the OTP record
        const otpRecord = await Otp.findOne({
            email: email.toLowerCase(),
            purpose: 'register'
        });

        if (!otpRecord) {
            return res.status(408).json({
                error: '408_REQUEST_TIMEOUT',
                status: 'CODE_EXPIRED',
                action: 'CLICK_RESEND_TOKEN'
            });
        }

        // Check if OTP has expired
        if (otpRecord.expiresAt < new Date()) {
            await Otp.deleteOne({ _id: otpRecord._id });
            return res.status(408).json({
                error: '408_REQUEST_TIMEOUT',
                status: 'CODE_EXPIRED',
                action: 'CLICK_RESEND_TOKEN'
            });
        }

        // Verify OTP matches
        if (otpRecord.otp !== otp) {
            return res.status(401).json({
                error: '401_UNAUTHORIZED',
                status: 'INVALID_TOKEN',
                action: 'CHECK_CODE_AND_RETRY'
            });
        }

        // Create the user from temp data
        const user = await User.create({
            username: otpRecord.tempUserData.username,
            email: otpRecord.tempUserData.email,
            password: otpRecord.tempUserData.password
        });

        // Clean up OTP
        await Otp.deleteOne({ _id: otpRecord._id });

        // Generate JWT
        const token = generateToken(user._id);

        res.status(201).json({
            status: 'USER_CREATED',
            message: 'IDENTITY_VERIFIED',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (err) {
        console.error('[VERIFY REGISTER OTP ERROR]', err);
        res.status(500).json({
            error: '500_SERVER_ERROR',
            status: 'VERIFICATION_FAILED',
            action: 'TRY_AGAIN'
        });
    }
};

/**
 * POST /api/auth/login
 * Authenticate user, return JWT
 * Locks account after 5 failed attempts
 */
const MAX_FAILED_ATTEMPTS = 5;

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(403).json({
                error: '403_FORBIDDEN',
                status: 'INVALID_CREDENTIALS',
                action: 'VERIFY_EMAIL_OR_CODE'
            });
        }

        // Check if account is locked
        if (user.isLocked) {
            return res.status(423).json({
                error: '423_LOCKED',
                status: 'ACCOUNT_LOCKED',
                action: 'RESET_PASSWORD_TO_UNLOCK'
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // Increment failed attempts
            user.failedLoginAttempts += 1;
            const attemptsLeft = MAX_FAILED_ATTEMPTS - user.failedLoginAttempts;

            if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
                // Lock the account
                user.isLocked = true;
                user.lockedAt = new Date();
                await user.save();

                // Send alert email (non-blocking)
                sendLockoutAlert(user.email).catch(err =>
                    console.error('[LOCKOUT ALERT ERROR]', err)
                );

                console.log(`[SECURITY] Account locked: ${user.email} (${user.failedLoginAttempts} failed attempts)`);

                return res.status(423).json({
                    error: '423_LOCKED',
                    status: 'ACCOUNT_LOCKED',
                    action: 'RESET_PASSWORD_TO_UNLOCK'
                });
            }

            await user.save();

            return res.status(403).json({
                error: '403_FORBIDDEN',
                status: 'INVALID_CREDENTIALS',
                action: `WRONG_PASSCODE_${attemptsLeft}_ATTEMPTS_LEFT`
            });
        }

        // Successful login — reset failed attempts
        if (user.failedLoginAttempts > 0) {
            user.failedLoginAttempts = 0;
            await user.save();
        }

        // Generate JWT
        const token = generateToken(user._id);

        res.status(200).json({
            status: 'LOGIN_SUCCESS',
            message: 'ACCESS_GRANTED',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (err) {
        console.error('[LOGIN ERROR]', err);
        res.status(500).json({
            error: '500_SERVER_ERROR',
            status: 'LOGIN_FAILED',
            action: 'TRY_AGAIN'
        });
    }
};

/**
 * POST /api/auth/forgot-password
 * Send password reset OTP to email
 */
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user exists
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({
                error: '404_NOT_FOUND',
                status: 'EMAIL_NOT_REGISTERED',
                action: 'CHECK_EMAIL_OR_REGISTER'
            });
        }

        // Generate OTP
        const otp = generateOtp();

        // Delete any existing reset OTPs for this email
        await Otp.deleteMany({ email: email.toLowerCase(), purpose: 'reset' });

        // Save OTP
        await Otp.create({
            email: email.toLowerCase(),
            otp,
            purpose: 'reset',
            expiresAt: new Date(Date.now() + 60 * 1000) // 1 minute
        });

        // Send OTP email
        await sendOtpEmail(email, otp, 'reset');

        res.status(200).json({
            status: 'OTP_SENT',
            message: 'RECOVERY_PACKET_SENT'
        });
    } catch (err) {
        console.error('[FORGOT PASSWORD ERROR]', err);
        res.status(500).json({
            error: '500_SERVER_ERROR',
            status: 'REQUEST_FAILED',
            action: 'TRY_AGAIN'
        });
    }
};

/**
 * POST /api/auth/verify-reset-otp
 * Verify the password reset OTP
 */
const verifyResetOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Find the OTP record
        const otpRecord = await Otp.findOne({
            email: email.toLowerCase(),
            purpose: 'reset'
        });

        if (!otpRecord) {
            return res.status(408).json({
                error: '408_REQUEST_TIMEOUT',
                status: 'CODE_EXPIRED',
                action: 'CLICK_RESEND_TOKEN'
            });
        }

        // Check expiry
        if (otpRecord.expiresAt < new Date()) {
            await Otp.deleteOne({ _id: otpRecord._id });
            return res.status(408).json({
                error: '408_REQUEST_TIMEOUT',
                status: 'CODE_EXPIRED',
                action: 'CLICK_RESEND_TOKEN'
            });
        }

        // Verify OTP
        if (otpRecord.otp !== otp) {
            return res.status(401).json({
                error: '401_UNAUTHORIZED',
                status: 'INVALID_TOKEN',
                action: 'CHECK_CODE_AND_RETRY'
            });
        }

        // Generate a short-lived reset token
        const resetToken = jwt.sign(
            { email: email.toLowerCase(), purpose: 'reset' },
            process.env.JWT_SECRET,
            { expiresIn: '5m' }
        );

        res.status(200).json({
            status: 'OTP_VERIFIED',
            message: 'TOKEN_VERIFIED',
            resetToken
        });
    } catch (err) {
        console.error('[VERIFY RESET OTP ERROR]', err);
        res.status(500).json({
            error: '500_SERVER_ERROR',
            status: 'VERIFICATION_FAILED',
            action: 'TRY_AGAIN'
        });
    }
};

/**
 * POST /api/auth/reset-password
 * Update the user's password using reset token
 */
const resetPassword = async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;

        // Verify reset token
        let decoded;
        try {
            decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({
                error: '401_UNAUTHORIZED',
                status: 'RESET_TOKEN_EXPIRED',
                action: 'RESTART_RECOVERY'
            });
        }

        if (decoded.purpose !== 'reset') {
            return res.status(401).json({
                error: '401_UNAUTHORIZED',
                status: 'INVALID_TOKEN',
                action: 'RESTART_RECOVERY'
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update user's password and unlock account
        const user = await User.findOneAndUpdate(
            { email: decoded.email },
            { password: hashedPassword, failedLoginAttempts: 0, isLocked: false, lockedAt: null },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                error: '404_NOT_FOUND',
                status: 'USER_NOT_FOUND',
                action: 'CONTACT_ADMIN'
            });
        }

        // Clean up any remaining OTPs
        await Otp.deleteMany({ email: decoded.email, purpose: 'reset' });

        res.status(200).json({
            status: 'PASSWORD_UPDATED',
            message: 'PASSCODE_RESET_COMPLETE'
        });
    } catch (err) {
        console.error('[RESET PASSWORD ERROR]', err);
        res.status(500).json({
            error: '500_SERVER_ERROR',
            status: 'RESET_FAILED',
            action: 'TRY_AGAIN'
        });
    }
};

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
const getMe = async (req, res) => {
    res.status(200).json({
        status: 'AUTHENTICATED',
        user: req.user
    });
};

module.exports = {
    register,
    verifyRegisterOtp,
    login,
    forgotPassword,
    verifyResetOtp,
    resetPassword,
    getMe
};
