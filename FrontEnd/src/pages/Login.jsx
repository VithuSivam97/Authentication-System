import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TerminalLayout from '../components/TerminalLayout';
import ErrorPopup from '../components/ErrorPopup';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Error Popup State
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorDetail, setErrorDetail] = useState({ code: '', status: '', action: '' });

    const triggerError = (code, status, action) => {
        setErrorDetail({ code, status, action });
        setShowErrorPopup(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setShowErrorPopup(false);

        // Specific Validation
        if (email.trim() === '') {
            triggerError('400_BAD_REQUEST', 'EMAIL_EMPTY', 'ENTER_CONTACT_LINK');
            return;
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$/i;
        if (!emailRegex.test(email)) {
            triggerError('400_BAD_REQUEST', 'INVALID_EMAIL', 'MUST_END_IN_.COM');
            return;
        }

        if (password.trim() === '') {
            triggerError('400_BAD_REQUEST', 'PASSCODE_EMPTY', 'ENTER_ACCESS_CODE');
            return;
        }

        console.log('Login attempt:', { email, password });

        try {
            await login(email, password);
            // Navigate to dashboard on success
            navigate('/dashboard');
        } catch (err) {
            const errorData = err.response?.data || {};

            // If account is locked, show alert and redirect to password reset
            if (err.response?.status === 423) {
                triggerError(
                    errorData.error || '423_LOCKED',
                    errorData.status || 'ACCOUNT_LOCKED',
                    errorData.action || 'RESET_PASSWORD_TO_UNLOCK'
                );
                setTimeout(() => {
                    navigate('/forgot-access-code');
                }, 3000);
                return;
            }

            triggerError(
                errorData.error || '401_UNAUTHORIZED',
                errorData.status || 'ACCESS_DENIED',
                errorData.action || 'CHECK_CREDENTIALS'
            );
        }
    };

    return (
        <TerminalLayout>
            <div className="pageHeader">
                <h1 className="glitchTitle" data-text="ACCESS CONTROL">ACCESS CONTROL</h1>
                <p className="subTitle">Enter credentials to proceed</p>
            </div>

            <form onSubmit={handleSubmit} className="formContainer">
                <div className="inputGroup">
                    <label className="inputLabel">{'>'} EMAIL_ADDRESS</label>
                    <div className="inputWrapper">
                        <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="inputField"
                            placeholder="Enter email address"
                        />
                    </div>
                </div>

                <div className="inputGroup">
                    <label className="inputLabel">{'>'} ACCESS_CODE</label>
                    <div className="inputWrapper">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="inputFieldWithToggle"
                            placeholder="Enter access code"
                        />
                        {password && (
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
                    <div className="linkContainerRight">
                        <a href="/forgot-access-code" className="linkText">[FORGOT_ACCESS_CODE?]</a>
                    </div>
                </div>

                <div className="submitWrapper">
                    <button type="submit" className="primaryButton">
                        <span className="buttonText">INITIATE_SESSION</span>
                        <div className="buttonOverlay"></div>
                    </button>
                </div>

                <div className="linkContainerCenter">
                    <span className="textGray">NO_ID? </span>
                    <a href="/register" className="linkTextGreen">[CREATE_IDENTITY]</a>
                </div>
            </form>

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

export default Login;
