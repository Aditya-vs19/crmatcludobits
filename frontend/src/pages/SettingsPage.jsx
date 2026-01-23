import { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import api from '../services/api';
import './Dashboard.css';

const SettingsPage = () => {
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleChange = (e) => {
        setPasswords({
            ...passwords,
            [e.target.name]: e.target.value
        });
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (passwords.newPassword !== passwords.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        if (passwords.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
            return;
        }

        setLoading(true);

        try {
            await api.put('/auth/profile/password', {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });

            setMessage({ type: 'success', text: 'Password updated successfully' });
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to update password'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">Account Settings</h1>
                    <p className="dashboard-subtitle">Manage your account security and preferences</p>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Security Settings - Only Section */}
                <div className="section-card" style={{ gridColumn: '1 / -1' }}>
                    <div className="section-header">
                        <h3 className="section-title">Profile Security</h3>
                    </div>
                    <div className="section-content">
                        <div style={{ padding: '2rem', maxWidth: '600px' }}>
                            <h4 style={{ marginBottom: '1.5rem', color: 'var(--neutral-800)' }}>Change Password</h4>

                            {message.text && (
                                <div style={{
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    marginBottom: '1.5rem',
                                    backgroundColor: message.type === 'error' ? '#fee2e2' : '#dcfce7',
                                    color: message.type === 'error' ? '#dc2626' : '#16a34a',
                                    border: `1px solid ${message.type === 'error' ? '#fca5a5' : '#86efac'}`,
                                    fontSize: '0.875rem',
                                    fontWeight: '500'
                                }}>
                                    {message.text}
                                </div>
                            )}

                            <form onSubmit={handlePasswordChange}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: 'var(--neutral-700)' }}>
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={passwords.currentPassword}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="Enter current password"
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--neutral-300)' }}
                                        required
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: 'var(--neutral-700)' }}>
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={passwords.newPassword}
                                            onChange={handleChange}
                                            className="form-input"
                                            placeholder="Min. 6 characters"
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--neutral-300)' }}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: 'var(--neutral-700)' }}>
                                            Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={passwords.confirmPassword}
                                            onChange={handleChange}
                                            className="form-input"
                                            placeholder="Re-enter new password"
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--neutral-300)' }}
                                            required
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            backgroundColor: 'var(--primary-600)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontWeight: '600',
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            opacity: loading ? 0.7 : 1,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {loading ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>


        </DashboardLayout>
    );
};

export default SettingsPage;
