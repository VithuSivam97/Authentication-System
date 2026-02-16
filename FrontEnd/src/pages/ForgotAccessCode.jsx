import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TerminalLayout from '../components/TerminalLayout';
import ErrorPopup from '../components/ErrorPopup';
import { useAuth } from '../context/AuthContext';

function ForgotAccessCode() {
    const navigate = useNavigate();
    const { forgotPassword, verifyResetOtp, resetPassword } = useAuth();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Code
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [resetToken, setResetToken] = useState('');

    // Timer State
    const [timeLeft, setTimeLeft] = useState(60);
    const [isTimerActive, setIsTimerActive] = useState(false);

    useEffect(() => {
        let interval = null;
        if (step === 2) {
            setIsTimerActive(true);
            setTimeLeft(60);
        } else {
            setIsTimerActive(false);
        }
    }, [step]);

    useEffect(() => {
        if (isTimerActive && timeLeft > 0) {
            const interval = setInterval(() => {
                setTimeLeft((prevTime) => prevTime - 1);
            }, 1000);
            return () => clearInterval(interval);
        } else if (timeLeft === 0) {
            setIsTimerActive(false);
        }
    }, [isTimerActive, timeLeft]);

    // UI Feedback
    const [successMessage, setSuccessMessage] = useState('');

    // Error Popup State
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorDetail, setErrorDetail] = useState({ code: '', status: '', action: '' });

    const triggerError = (code, status, action) => {
        setErrorDetail({ code, status, action });
        setShowErrorPopup(true);
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setShowErrorPopup(false);

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$/i;
        if (!emailRegex.test(email)) {
            triggerError('400_BAD_REQUEST', 'INVALID_EMAIL_FORMAT', 'MUST_END_IN_.COM');
            return;
        }

        try {
            await forgotPassword(email);
            setSuccessMessage('RECOVERY_PACKET_SENT...');
            setTimeout(() => {
                setSuccessMessage('');
                setStep(2);
            }, 1500);
        } catch (err) {
            const errorData = err.response?.data || {};
            triggerError(
                errorData.error || '500_SERVER_ERROR',
                errorData.status || 'RECOVERY_FAILED',
                errorData.action || 'CHECK_EMAIL_AND_RETRY'
            );
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setShowErrorPopup(false);

        if (timeLeft === 0) {
            triggerError('408_REQUEST_TIMEOUT', 'CODE_EXPIRED', 'CLICK_RESEND_TOKEN');
            return;
        }

        if (otp.length !== 6) {
            triggerError('401_UNAUTHORIZED', 'INVALID_TOKEN_LENGTH', 'MUST_BE_6_DIGITS');
            return;
        }

        try {
            const response = await verifyResetOtp(email, otp);
            setResetToken(response.resetToken);
            setSuccessMessage('TOKEN_VERIFIED...');
            setTimeout(() => {
                setSuccessMessage('');
                setStep(3);
            }, 1500);
        } catch (err) {
            const errorData = err.response?.data || {};
            triggerError(
                errorData.error || '401_UNAUTHORIZED',
                errorData.status || 'VERIFICATION_FAILED',
                errorData.action || 'CHECK_CODE_AND_RETRY'
            );
        }
    };

    const handleResend = async (e) => {
        if (e) e.preventDefault();
        setShowErrorPopup(false);
        setOtp('');

        try {
            await forgotPassword(email);
            setTimeLeft(60);
            setIsTimerActive(true);
            setSuccessMessage('NEW_PACKET_SENT...');
            setTimeout(() => setSuccessMessage(''), 1500);
        } catch (err) {
            const errorData = err.response?.data || {};
            triggerError(
                errorData.error || '500_SERVER_ERROR',
                errorData.status || 'RESEND_FAILED',
                errorData.action || 'TRY_AGAIN'
            );
        }
    };

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        setShowErrorPopup(false);

        if (newPassword.trim() === '') {
            triggerError('400_BAD_REQUEST', 'PASSWORD_EMPTY', 'ENTER_NEW_CREDENTIALS');
            return;
        }

        // Specific Password Validation
        if (newPassword.length < 8) {
            triggerError('406_NOT_ACCEPTABLE', 'WEAK_CREDENTIALS', 'MINIMUM_8_CHARACTERS_REQUIRED');
            return;
        }
        if (!/[a-z]/.test(newPassword)) {
            triggerError('406_NOT_ACCEPTABLE', 'WEAK_CREDENTIALS', 'LOWERCASE_LETTER_REQUIRED');
            return;
        }
        if (!/[A-Z]/.test(newPassword)) {
            triggerError('406_NOT_ACCEPTABLE', 'WEAK_CREDENTIALS', 'UPPERCASE_LETTER_REQUIRED');
            return;
        }
        if (!/\d/.test(newPassword)) {
            triggerError('406_NOT_ACCEPTABLE', 'WEAK_CREDENTIALS', 'NUMBER_REQUIRED');
            return;
        }
        if (!/[\W_]/.test(newPassword)) {
            triggerError('406_NOT_ACCEPTABLE', 'WEAK_CREDENTIALS', 'SPECIAL_CHARACTER_REQUIRED');
            return;
        }

        if (newPassword !== confirmPassword) {
            triggerError('409_CONFLICT', 'CREDENTIAL_MISMATCH', 'VERIFY_CONFIRMATION_CODE');
            return;
        }

        try {
            await resetPassword(resetToken, newPassword);
            setSuccessMessage('CREDENTIALS_OVERWRITTEN...');
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (err) {
            const errorData = err.response?.data || {};
            triggerError(
                errorData.error || '500_SERVER_ERROR',
                errorData.status || 'RESET_FAILED',
                errorData.action || 'TRY_AGAIN'
            );
        }
    };

    return (
        <TerminalLayout>
            <div className="pageHeader">
                <h1 className="glitchTitle" data-text="RECOVERY_MODE">RECOVERY_MODE</h1>
                <p className="subTitle">
                    {step === 1 && "Identity Verification Sequence"}
                    {step === 2 && "Security Challenge Required"}
                    {step === 3 && "Credential Update Protocol"}
                </p>
            </div>

            {successMessage && <div className="successText">{`> STATUS: ${successMessage}`}</div>}

            {/* STEP 1: EMAIL */}
            {step === 1 && (
                <form onSubmit={handleEmailSubmit} className="formContainer">
                    <div className="inputGroup">
                        <label className="inputLabel">{'>'} TARGET_EMAIL</label>
                        <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="inputField"
                            placeholder="Enter email address"
                        />
                    </div>
                    <button type="submit" className="primaryButton">SEND_RECOVERY_PACKET</button>
                    <div className="linkContainerCenter">
                        <a href="/" className="linkText">[ABORT_SEQUENCE]</a>
                    </div>
                </form>
            )}

            {/* STEP 2: OTP */}
            {step === 2 && (
                <form onSubmit={handleOtpSubmit} className="formContainer">
                    <div className="inputGroup">
                        <label className="inputLabel">{'>'} SECURITY_TOKEN</label>
                        <div className="otpTimerWrapper">
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="otpInput"
                                placeholder="______"
                                maxLength={6}
                                disabled={timeLeft === 0}
                            />
                            <div className={timeLeft < 10 ? 'otpTimerDanger' : 'otpTimer'}>
                                {`00:${timeLeft.toString().padStart(2, '0')}`}
                            </div>
                        </div>
                    </div>
                    <button
                        type={timeLeft === 0 ? "button" : "submit"}
                        onClick={timeLeft === 0 ? handleResend : undefined}
                        className="primaryButton"
                    >
                        {timeLeft === 0 ? 'RESEND_TOKEN' : 'VERIFY_TOKEN'}
                    </button>
                    <div className="linkContainerCenter">
                        <button type="button" onClick={() => setStep(1)} className="linkText">[RESTART_SEQUENCE]</button>
                    </div>
                </form>
            )}

            {/* STEP 3: NEW PASSWORD */}
            {step === 3 && (
                <form onSubmit={handleResetSubmit} className="formContainer">
                    <div className="inputGroup">
                        <label className="inputLabel">{'>'} NEW_ACCESS_CODE</label>
                        <div className="inputWrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="inputFieldWithToggle"
                                placeholder="Enter new code"
                            />
                            {newPassword.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="passwordToggleBtn"
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="toggleIcon">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="toggleIcon">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="inputGroup">
                        <label className="inputLabel">{'>'} CONFIRM_CODE</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="inputField"
                            placeholder="Re-enter new code"
                        />
                    </div>
                    <button type="submit" className="primaryButton">OVERWRITE_CREDENTIALS</button>
                </form>
            )}

            <ErrorPopup
                isOpen={showErrorPopup}
                onClose={() => setShowErrorPopup(false)}
                code={errorDetail.code}
                status={errorDetail.status}
                action={errorDetail.action}
            />
        </TerminalLayout>
    );
};

export default ForgotAccessCode;
