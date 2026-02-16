/**
 * Generates a random 6-digit numeric OTP
 * @returns {string} 6-digit OTP as a string
 */
const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = generateOtp;
