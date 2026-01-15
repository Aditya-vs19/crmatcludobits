import DashboardLayout from '../components/layout/DashboardLayout';
import './Dashboard.css';

const SettingsPage = () => {
    return (
        <DashboardLayout>
            {/* Header */}
            <div className="dashboard-header">
                <h1 className="dashboard-title">Settings</h1>
                <p className="dashboard-subtitle">Configure application settings</p>
            </div>

            {/* Settings Sections */}
            <div className="dashboard-grid">
                {/* General Settings */}
                <div className="section-card">
                    <div className="section-header">
                        <span className="section-icon">⚙️</span>
                        <h3 className="section-title">General Settings</h3>
                    </div>
                    <div className="section-content">
                        <div style={{ padding: '1rem', color: 'var(--neutral-600)' }}>
                            <p style={{ marginBottom: '1rem' }}>
                                Application configuration options will be available here.
                            </p>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                <li style={{
                                    padding: '0.75rem',
                                    background: 'var(--neutral-50)',
                                    borderRadius: '8px',
                                    marginBottom: '0.5rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span>Email Polling Interval</span>
                                    <span style={{ fontWeight: '600', color: 'var(--primary-600)' }}>5 minutes</span>
                                </li>
                                <li style={{
                                    padding: '0.75rem',
                                    background: 'var(--neutral-50)',
                                    borderRadius: '8px',
                                    marginBottom: '0.5rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span>Auto-assignment</span>
                                    <span style={{ fontWeight: '600', color: 'var(--success)' }}>Enabled</span>
                                </li>
                                <li style={{
                                    padding: '0.75rem',
                                    background: 'var(--neutral-50)',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span>Notification Alerts</span>
                                    <span style={{ fontWeight: '600', color: 'var(--success)' }}>Enabled</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Email Configuration */}
                <div className="section-card">
                    <div className="section-header">
                        <span className="section-icon">📧</span>
                        <h3 className="section-title">Email Configuration</h3>
                    </div>
                    <div className="section-content">
                        <div style={{ padding: '1rem', color: 'var(--neutral-600)' }}>
                            <p style={{ marginBottom: '1rem' }}>
                                Email account settings and integrations.
                            </p>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                <li style={{
                                    padding: '0.75rem',
                                    background: 'var(--neutral-50)',
                                    borderRadius: '8px',
                                    marginBottom: '0.5rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span>IMAP Status</span>
                                    <span style={{
                                        padding: '0.25rem 0.5rem',
                                        background: '#10b98120',
                                        color: '#10b981',
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        fontWeight: '600'
                                    }}>Connected</span>
                                </li>
                                <li style={{
                                    padding: '0.75rem',
                                    background: 'var(--neutral-50)',
                                    borderRadius: '8px',
                                    marginBottom: '0.5rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span>SMTP Status</span>
                                    <span style={{
                                        padding: '0.25rem 0.5rem',
                                        background: '#f59e0b20',
                                        color: '#f59e0b',
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        fontWeight: '600'
                                    }}>Pending Setup</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* System Info */}
            <div className="section-card" style={{ marginTop: '1.5rem' }}>
                <div className="section-header">
                    <span className="section-icon">ℹ️</span>
                    <h3 className="section-title">System Information</h3>
                </div>
                <div className="section-content">
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem',
                        padding: '1rem'
                    }}>
                        <div style={{
                            padding: '1rem',
                            background: 'var(--neutral-50)',
                            borderRadius: '8px',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', marginBottom: '0.25rem' }}>Version</div>
                            <div style={{ fontWeight: '600', color: 'var(--neutral-800)' }}>1.0.0</div>
                        </div>
                        <div style={{
                            padding: '1rem',
                            background: 'var(--neutral-50)',
                            borderRadius: '8px',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', marginBottom: '0.25rem' }}>Database</div>
                            <div style={{ fontWeight: '600', color: 'var(--neutral-800)' }}>MySQL</div>
                        </div>
                        <div style={{
                            padding: '1rem',
                            background: 'var(--neutral-50)',
                            borderRadius: '8px',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', marginBottom: '0.25rem' }}>Environment</div>
                            <div style={{ fontWeight: '600', color: 'var(--neutral-800)' }}>Development</div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SettingsPage;
