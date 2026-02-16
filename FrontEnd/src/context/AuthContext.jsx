import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await api.get('/me');
                    setUser(response.data.user);
                } catch (error) {
                    console.error('Auth check failed:', error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (email, password) => {
        const response = await api.post('/login', { email, password });
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        setUser(user);
        return response.data;
    };

    const register = async (username, email, password) => {
        const response = await api.post('/register', { username, email, password });
        return response.data; // Returns OTP_SENT status
    };

    const verifyOtp = async (email, otp) => {
        const response = await api.post('/verify-register-otp', { email, otp });
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        setUser(user);
        return response.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const forgotPassword = async (email) => {
        const response = await api.post('/forgot-password', { email });
        return response.data;
    };

    const verifyResetOtp = async (email, otp) => {
        const response = await api.post('/verify-reset-otp', { email, otp });
        return response.data;
    };

    const resetPassword = async (resetToken, newPassword) => {
        const response = await api.post('/reset-password', { resetToken, newPassword });
        return response.data;
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, verifyOtp, logout, forgotPassword, verifyResetOtp, resetPassword }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
