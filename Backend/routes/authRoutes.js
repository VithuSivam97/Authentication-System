const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    register,
    verifyRegisterOtp,
    login,
    forgotPassword,
    verifyResetOtp,
    resetPassword,
    getMe
} = require('../controllers/authController');

// Public routes
router.post('/register', register);
router.post('/verify-register-otp', verifyRegisterOtp);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', auth, getMe);

module.exports = router;
