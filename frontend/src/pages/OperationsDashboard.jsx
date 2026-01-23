import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Dashboard.css';

const OperationsDashboard = () => {
    const [stats, setStats] = useState(null);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        if (user?.id) {
            fetchDashboardData();
        }
    }, [user?.id]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            // Filter requests by the logged-in user's ID
            const requestsRes = await api.get(`/requests?assignedUserId=${user.id}&limit=10`);
            const allRequests = requestsRes.data.data || [];

            setRequests(allRequests);

            // Calculate stats from requests assigned to this user
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


            {/* Recent Requests */}
            <div className="section-card">
                <div className="section-header">

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
