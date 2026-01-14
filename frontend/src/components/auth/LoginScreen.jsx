import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './LoginScreen.css';

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
            {/* Left Side - Branding */}
            <div className="login-left">
                <div className="login-branding">
                    <div className="logo-section">
                        <img
                            src="/logo.png"
                            alt="CludoBits"
                            className="logo-image"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                        <div className="logo-fallback" style={{ display: 'none' }}>
                            <div className="logo-icon-grid">
                                {[...Array(16)].map((_, i) => (
                                    <div key={i} className={`logo-square sq-${i}`}></div>
                                ))}
                            </div>
                            <span className="logo-text">
                                <span className="logo-cludo">Cludo</span>
                                <span className="logo-bits">Bits</span>
                                <sup>®</sup>
                            </span>
                        </div>
                    </div>

                    <div className="hero-content">
                        <h2 className="hero-title">Building the Future with Tech</h2>
                        <p className="hero-description">
                            Comprehensive ticketing, service management, and customer
                            support platform designed for modern IT operations.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="login-right">
                <div className="login-form-container">
                    <div className="form-header">
                        <h2>Sign in to CludoBits Customer</h2>
                        <p>Enterprise IT Service Management System</p>
                    </div>

                    {localError && (
                        <div className="error-banner">
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            {localError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                className="input"
                                placeholder="email@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                className="input"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-login"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="form-footer">
                        <p className="copyright">© 2026 CludoBits IT Solutions. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
