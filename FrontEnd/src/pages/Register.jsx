import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TerminalLayout from '../components/TerminalLayout';
import ErrorPopup from '../components/ErrorPopup';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const navigate = useNavigate();
    const { register, verifyOtp } = useAuth();
    const [step, setStep] = useState(1); // 1: Form, 2: OTP Verification
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [otp, setOtp] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Timer State
    const [timeLeft, setTimeLeft] = useState(60);
    const [isTimerActive, setIsTimerActive] = useState(false);

    useEffect(() => {
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
                setTimeLeft((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        } else if (timeLeft === 0) {
            setIsTimerActive(false);
        }
    }, [isTimerActive, timeLeft]);

    // Error Popup State
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorDetail, setErrorDetail] = useState({ code: '', status: '', action: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const triggerError = (code, status, action) => {
        setErrorDetail({ code, status, action });
        setShowErrorPopup(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setShowErrorPopup(false);

        const { username, email, password, confirmPassword } = formData;

        // 1. Check Empty
        if (!username || !email || !password || !confirmPassword) {
            triggerError('400_BAD_REQUEST', 'MISSING_FIELDS', 'COMPLETE_ALL_INPUTS');
            return;
        }

        // 2. Check Email Format
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$/i;
        if (!emailRegex.test(email)) {
            triggerError('400_BAD_REQUEST', 'INVALID_EMAIL', 'MUST_END_IN_.COM');
            return;
        }

        // 3. Check Password Strength (specific errors)
        if (password.length < 8) {
            triggerError('406_NOT_ACCEPTABLE', 'WEAK_PASSCODE', 'MINIMUM_8_CHARACTERS_REQUIRED');
            return;
        }
        if (!/[a-z]/.test(password)) {
            triggerError('406_NOT_ACCEPTABLE', 'WEAK_PASSCODE', 'LOWERCASE_LETTER_REQUIRED');
            return;
        }
        if (!/[A-Z]/.test(password)) {
            triggerError('406_NOT_ACCEPTABLE', 'WEAK_PASSCODE', 'UPPERCASE_LETTER_REQUIRED');
            return;
        }
        if (!/\d/.test(password)) {
            triggerError('406_NOT_ACCEPTABLE', 'WEAK_PASSCODE', 'NUMBER_REQUIRED');
            return;
        }
        if (!/[\W_]/.test(password)) {
            triggerError('406_NOT_ACCEPTABLE', 'WEAK_PASSCODE', 'SPECIAL_CHARACTER_REQUIRED');
            return;
        }

        // 4. Check Match
        if (password !== confirmPassword) {
            triggerError('409_CONFLICT', 'PASSCODE_MISMATCH', 'VERIFY_CONFIRMATION');
            return;
        }

        // All validations passed — send OTP
        try {
            await register(username, email, password);
            setSuccessMessage('VERIFICATION_PACKET_SENT...');
            setTimeout(() => {
                setSuccessMessage('');
                setStep(2);
            }, 1500);
        } catch (err) {
            const errorData = err.response?.data || {};
            triggerError(
                errorData.error || '500_SERVER_ERROR',
                errorData.status || 'REGISTRATION_FAILED',
                errorData.action || 'TRY_AGAIN'
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

        // OTP verification
        try {
            await verifyOtp(formData.email, otp);
            setSuccessMessage('IDENTITY_VERIFIED...');
            setTimeout(() => {
                setSuccessMessage('');
                console.log('Registration complete:', formData);
                navigate('/dashboard');
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
            const { username, email, password } = formData;
            await register(username, email, password);
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

    return (
        <TerminalLayout>
            <div className="pageHeader">
                <h1 className="glitchTitleSmall" data-text="NEW AGENT">NEW AGENT</h1>
                <p className="subTitle">
                    {step === 1 && "Create new identity record"}
                    {step === 2 && "Verify your contact link"}
                </p>
            </div>

            {successMessage && <div className="successText">{`> STATUS: ${successMessage}`}</div>}

            {/* STEP 1: REGISTRATION FORM */}
            {step === 1 && (
                <form onSubmit={handleSubmit} className="formContainer">
                    <div className="inputGroup">
                        <label className="inputLabel">{'>'} CODENAME</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="inputField"
                            placeholder="Neo"
                        />
                    </div>

                    <div className="inputGroup">
                        <label className="inputLabel">{'>'} CONTACT_LINK</label>
                        <input
                            type="text"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="inputField"
                            placeholder="neo@matrix.org"
                        />
                    </div>

                    <div className="inputGroup">
                        <label className="inputLabel">{'>'} SET_PASSCODE</label>
                        <div className="inputWrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="inputFieldWithToggle"
                                placeholder="••••••••"
                            />
                            {formData.password && (
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="passwordToggleBtn"
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="toggleIcon">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="toggleIcon">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="inputGroup">
                        <label className="inputLabel">{'>'} CONFIRM_PASSCODE</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="inputField"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="submitWrapper">
                        <button type="submit" className="primaryButton">
                            ESTABLISH_LINK
                        </button>
                    </div>

                    <div className="linkContainerCenter">
                        <span className="textGray">ALREADY_ACTIVE? </span>
                        <a href="/" className="linkTextGreen">[ENTER_MAINFRAME]</a>
                    </div>
                </form>
            )}

            {/* STEP 2: OTP VERIFICATION */}
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
                        <button type="button" onClick={() => { setStep(1); setOtp(''); }} className="linkText">[MODIFY_DETAILS]</button>
                    </div>
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

export default Register;
