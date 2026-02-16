const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * JWT Authentication Middleware
 * Verifies the token from the Authorization header
 * Attaches the user to req.user
 */
const auth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: '401_UNAUTHORIZED',
                status: 'NO_TOKEN',
                action: 'LOGIN_REQUIRED'
            });
        }

        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({
                error: '401_UNAUTHORIZED',
                status: 'USER_NOT_FOUND',
                action: 'LOGIN_REQUIRED'
            });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({
            error: '401_UNAUTHORIZED',
            status: 'INVALID_TOKEN',
            action: 'LOGIN_REQUIRED'
        });
    }
};

module.exports = auth;
