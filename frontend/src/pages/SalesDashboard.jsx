import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Dashboard.css';

const SalesDashboard = () => {
    const [stats, setStats] = useState(null);
    const [quotationStats, setQuotationStats] = useState(null);
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
            const [requestsRes, quotationsRes] = await Promise.all([
                api.get(`/requests?assignedUserId=${user.id}&limit=10`),
                api.get('/quotations/stats').catch(() => ({ data: { data: null } })),
            ]);

            setRequests(requestsRes.data.data || []);
            setQuotationStats(quotationsRes.data.data);

            // Calculate stats from requests assigned to this user
            const allRequests = requestsRes.data.data || [];
            setStats({
                assigned: allRequests.filter(r => r.funnel_stage === 'Assigned').length,
                quoted: allRequests.filter(r => r.funnel_stage === 'Quoted').length,
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
                    <h1 className="dashboard-title">Sales Dashboard</h1>
                    <p className="dashboard-subtitle">Track your assigned requests and quotations</p>
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
                <h1 className="dashboard-title">Sales Dashboard</h1>
                <p className="dashboard-subtitle">Track your assigned requests and quotations</p>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="stat-card">
                    <div className="stat-label">Requests Assigned</div>
                    <div className="stat-value info">{stats?.assigned || 0}</div>
                    <div className="stat-sublabel">Active work items</div>
                </div>

                <div className="stat-card">
                    <div className="stat-label">Quotations Sent</div>
                    <div className="stat-value">{quotationStats?.sent || 0}</div>
                    <div className="stat-sublabel">Awaiting response</div>
                </div>

                <div className="stat-card">
                    <div className="stat-label">Conversions</div>
                    <div className="stat-value success">{quotationStats?.accepted || 0}</div>
                    <div className="stat-sublabel">
                        Rate: {quotationStats?.total ? Math.round((quotationStats.accepted / quotationStats.total) * 100) : 0}%
                    </div>
                </div>
            </div>

            {/* Quotation Progress */}
            <div className="section-card">
                <div className="section-header">

                    <h3 className="section-title">Quotation Pipeline</h3>
                </div>
                <div className="section-content">
                    <div className="workflow-list">
                        <div className="workflow-item">
                            <span className="workflow-label">Draft</span>
                            <div className="workflow-bar">
                                <div
                                    className="workflow-bar-fill open"
                                    style={{ width: `${quotationStats?.total ? (quotationStats.draft / quotationStats.total) * 100 : 0}%` }}
                                ></div>
                            </div>
                            <span className="workflow-count">{quotationStats?.draft || 0}</span>
                        </div>

                        <div className="workflow-item">
                            <span className="workflow-label">Sent</span>
                            <div className="workflow-bar">
                                <div
                                    className="workflow-bar-fill progress"
                                    style={{ width: `${quotationStats?.total ? (quotationStats.sent / quotationStats.total) * 100 : 0}%` }}
                                ></div>
                            </div>
                            <span className="workflow-count">{quotationStats?.sent || 0}</span>
                        </div>

                        <div className="workflow-item">
                            <span className="workflow-label">Accepted</span>
                            <div className="workflow-bar">
                                <div
                                    className="workflow-bar-fill closed"
                                    style={{ width: `${quotationStats?.total ? (quotationStats.accepted / quotationStats.total) * 100 : 0}%` }}
                                ></div>
                            </div>
                            <span className="workflow-count">{quotationStats?.accepted || 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Requests */}
            <div className="section-card">
                <div className="section-header">

                    <h3 className="section-title">Recent Assigned Requests</h3>
                </div>
                <div className="section-content" style={{ padding: 0 }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Request ID</th>
                                <th>Customer</th>
                                <th>Stage</th>
                                <th>Created</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', color: '#a3a3a3' }}>
                                        No requests assigned
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
                                        <td>{new Date(request.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <button className="action-btn">Create Quote</button>
                                        </td>
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

export default SalesDashboard;
