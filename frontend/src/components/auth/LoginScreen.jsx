import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './LoginScreen.css';

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');

        if (!email || !password) {
            setLocalError('Please fill in all fields');
            return;
        }

        setIsLoading(true);

        const result = await login(email, password);

        if (result.success) {
            const { role } = result.user;
            switch (role) {
                case 'Admin':
                    navigate('/admin');
                    break;
                case 'Sales':
                    navigate('/sales');
                    break;
                case 'Operations':
                    navigate('/operations');
                    break;
                default:
                    navigate('/');
            }
        } else {
            setLocalError(result.error);
        }

        setIsLoading(false);
    };

    return (
        <div className="login-container">
            {/* Left Side - Login Form */}
            <div className="login-left">
                <div className="login-form-wrapper">
                    {/* Logo */}
                    <div className="logo-container">
                        <img
                            src="/logo.png"
                            alt="CludoBits"
                            className="logo-image"
                        />
                    </div>

                    {/* Form Header */}
                    <div className="form-header">
                        <h1>Welcome Back</h1>
                        <p>Sign in to access your dashboard</p>
                    </div>

                    {/* Error Banner */}
                    {localError && (
                        <div className="error-banner">
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            {localError}
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                className="form-input"
                                placeholder="yourname@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-input"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="loading-spinner"></span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="form-footer">
                        <p className="copyright">© 2026 CludoBits. All rights reserved.</p>
                        <a href="#" className="terms-link">Terms & Conditions</a>
                    </div>
                </div>
            </div>

            {/* Right Side - Image */}
            <div className="login-right">
                <div className="image-overlay">
                    {/* Floating Cards */}
                    <div className="floating-card card-1">
                        <div className="card-header">
                            <span className="card-title">Task Management</span>
                            <span className="card-status"></span>
                        </div>
                        <p className="card-time">Real-time Updates</p>
                    </div>

                    <div className="floating-card card-2">
                        <div className="calendar-row">
                            <span>Mon</span>
                            <span>Tue</span>
                            <span>Wed</span>
                            <span>Thu</span>
                            <span>Fri</span>
                        </div>
                        <div className="calendar-dates">
                            <span>13</span>
                            <span className="active">14</span>
                            <span>15</span>
                            <span>16</span>
                            <span>17</span>
                        </div>
                    </div>

                    <div className="floating-card card-3">
                        <span className="meeting-title">Team Sync</span>
                        <span className="meeting-time">2:00pm - 3:00pm</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
