import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import api from '../services/api';
import './Dashboard.css';

const OperationsDashboard = () => {
    const [stats, setStats] = useState(null);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const requestsRes = await api.get('/requests?limit=10');
            const allRequests = requestsRes.data.data || [];

            setRequests(allRequests);

            // Calculate stats
            setStats({
                assigned: allRequests.filter(r => r.funnel_stage === 'Assigned').length,
                inProgress: allRequests.filter(r => r.funnel_stage === 'In Progress').length,
                completed: allRequests.filter(r => r.funnel_stage === 'Quoted' || r.funnel_stage === 'Closed').length,
                total: allRequests.length,
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Loading skeleton
    if (loading) {
        return (
            <DashboardLayout>
                <div className="dashboard-header">
                    <h1 className="dashboard-title">Operations Dashboard</h1>
                    <p className="dashboard-subtitle">Manage operations and track progress</p>
                </div>

                <div className="stats-grid">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="stat-card skeleton skeleton-stat"></div>
                    ))}
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="dashboard-header">
                <h1 className="dashboard-title">Operations Dashboard</h1>
                <p className="dashboard-subtitle">Manage operations and track progress</p>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="stat-card">
                    <div className="stat-label">Requests Assigned</div>
                    <div className="stat-value info">{stats?.assigned || 0}</div>
                    <div className="stat-sublabel">Active operations</div>
                </div>

                <div className="stat-card">
                    <div className="stat-label">In Progress</div>
                    <div className="stat-value">{stats?.inProgress || 0}</div>
                    <div className="stat-sublabel">Being worked on</div>
                </div>

                <div className="stat-card">
                    <div className="stat-label">Completed</div>
                    <div className="stat-value success">{stats?.completed || 0}</div>
                    <div className="stat-sublabel">
                        Rate: {stats?.total ? Math.round((stats.completed / stats.total) * 100) : 0}%
                    </div>
                </div>
            </div>

            {/* Workflow Progress */}
            <div className="section-card">
                <div className="section-header">
                    <span className="section-icon">〜</span>
                    <h3 className="section-title">Workflow Status</h3>
                </div>
                <div className="section-content">
                    <div className="workflow-list">
                        <div className="workflow-item">
                            <span className="workflow-label">Assigned</span>
                            <div className="workflow-bar">
                                <div
                                    className="workflow-bar-fill open"
                                    style={{ width: `${stats?.total ? (stats.assigned / stats.total) * 100 : 0}%` }}
                                ></div>
                            </div>
                            <span className="workflow-count">{stats?.assigned || 0}</span>
                        </div>

                        <div className="workflow-item">
                            <span className="workflow-label">In Progress</span>
                            <div className="workflow-bar">
                                <div
                                    className="workflow-bar-fill progress"
                                    style={{ width: `${stats?.total ? (stats.inProgress / stats.total) * 100 : 0}%` }}
                                ></div>
                            </div>
                            <span className="workflow-count">{stats?.inProgress || 0}</span>
                        </div>

                        <div className="workflow-item">
                            <span className="workflow-label">Completed</span>
                            <div className="workflow-bar">
                                <div
                                    className="workflow-bar-fill closed"
                                    style={{ width: `${stats?.total ? (stats.completed / stats.total) * 100 : 0}%` }}
                                ></div>
                            </div>
                            <span className="workflow-count">{stats?.completed || 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Requests */}
            <div className="section-card">
                <div className="section-header">
                    <span className="section-icon">📝</span>
                    <h3 className="section-title">Recent Operations</h3>
                </div>
                <div className="section-content" style={{ padding: 0 }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Request ID</th>
                                <th>Customer</th>
                                <th>Stage</th>
                                <th>Priority</th>
                                <th>Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', color: '#a3a3a3' }}>
                                        No operations assigned
                                    </td>
                                </tr>
                            ) : (
                                requests.slice(0, 5).map((request) => (
                                    <tr key={request.id}>
                                        <td style={{ fontWeight: 500, color: '#171717' }}>{request.request_id}</td>
                                        <td>{request.customer_email}</td>
                                        <td>
                                            <span className={`status-chip ${request.funnel_stage?.toLowerCase()}`}>
                                                {request.funnel_stage}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-chip ${request.priority?.toLowerCase()}`}>
                                                {request.priority}
                                            </span>
                                        </td>
                                        <td>{new Date(request.created_at).toLocaleDateString()}</td>
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

export default OperationsDashboard;
