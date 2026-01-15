import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check if user is logged in on mount
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('accessToken');

            if (token) {
                try {
                    const response = await api.get('/auth/me');
                    setUser(response.data.data);
                } catch (err) {
                    console.error('Auth init error:', err);
                    // Clear stale tokens
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    setUser(null);
                }
            }

            setLoading(false);
        };

        initAuth();
    }, []);

    const login = useCallback(async (email, password) => {
        try {
            setLoading(true);
            setError(null);

            // Clear any existing tokens before login attempt
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');

            const response = await api.post('/auth/login', { email, password });
            const { user: userData, accessToken, refreshToken } = response.data.data;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            setUser(userData);

            return { success: true, user: userData };
        } catch (err) {
            console.error('Login error:', err);
            const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
            setError(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    }, []);

    const register = useCallback(async (email, password, role) => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.post('/auth/register', { email, password, role });
            const { user: userData, accessToken, refreshToken } = response.data.data;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            setUser(userData);

            return { success: true, user: userData };
        } catch (err) {
            console.error('Registration error:', err);
            const message = err.response?.data?.message || 'Registration failed';
            setError(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        // Clear tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        // Reset state
        setUser(null);
        setError(null);
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        clearError,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
