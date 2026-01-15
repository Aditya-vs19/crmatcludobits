import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import api from '../services/api';
import './Dashboard.css';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/auth/users');
            setUsers(response.data.data || []);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const getRoleBadgeStyle = (role) => {
        const styles = {
            'Admin': { background: '#dc264120', color: '#dc2641' },
            'Sales': { background: '#3b82f620', color: '#3b82f6' },
            'Operations': { background: '#10b98120', color: '#10b981' },
        };
        return styles[role] || { background: '#6b728020', color: '#6b7280' };
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="dashboard-header">
                    <h1 className="dashboard-title">User Management</h1>
                    <p className="dashboard-subtitle">Manage system users and roles</p>
                </div>
                <div className="section-card">
                    <div className="section-content">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="skeleton skeleton-row" style={{ marginBottom: '1rem' }}></div>
                        ))}
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout>
                <div className="dashboard-header">
                    <h1 className="dashboard-title">User Management</h1>
                    <p className="dashboard-subtitle">Manage system users and roles</p>
                </div>
                <div className="section-card">
                    <div className="section-content" style={{ textAlign: 'center', padding: '2rem' }}>
                        <p style={{ color: 'var(--error)', marginBottom: '1rem' }}>{error}</p>
                        <button onClick={fetchUsers} className="action-btn">Retry</button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="dashboard-header">
                <h1 className="dashboard-title">User Management</h1>
                <p className="dashboard-subtitle">Manage system users and roles</p>
            </div>

            {/* Stats */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '2rem' }}>
                <div className="stat-card">
                    <div className="stat-label">Total Users</div>
                    <div className="stat-value">{users.length}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Admins</div>
                    <div className="stat-value" style={{ color: '#dc2641' }}>
                        {users.filter(u => u.role === 'Admin').length}
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Staff</div>
                    <div className="stat-value info">
                        {users.filter(u => u.role !== 'Admin').length}
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="section-card">
                <div className="section-header">
                    <span className="section-icon">👥</span>
                    <h3 className="section-title">All Users</h3>
                </div>
                <div className="section-content" style={{ padding: 0 }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', color: '#a3a3a3' }}>
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id}>
                                        <td style={{ fontWeight: 500, color: '#171717' }}>{user.id}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '999px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                ...getRoleBadgeStyle(user.role)
                                            }}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default UsersPage;
