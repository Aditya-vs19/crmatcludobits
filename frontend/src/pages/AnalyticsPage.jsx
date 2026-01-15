import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import api from '../services/api';
import './Dashboard.css';

const AnalyticsPage = () => {
    const [stats, setStats] = useState(null);
    const [emailStats, setEmailStats] = useState(null);
    const [quotationStats, setQuotationStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const [statsRes, emailStatsRes, quotationStatsRes] = await Promise.all([
                api.get('/requests/stats').catch(() => ({ data: { data: null } })),
                api.get('/emails/stats').catch(() => ({ data: { data: null } })),
                api.get('/quotations/stats').catch(() => ({ data: { data: null } })),
            ]);

            setStats(statsRes.data.data);
            setEmailStats(emailStatsRes.data.data);
            setQuotationStats(quotationStatsRes.data.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate percentages safely
    const getPercent = (value, total) => {
        if (!total || total === 0) return 0;
        return Math.round((value / total) * 100);
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="dashboard-header">
                    <h1 className="dashboard-title">Analytics</h1>
                    <p className="dashboard-subtitle">Performance metrics and insights</p>
                </div>
                <div className="stats-grid">
                    {[1, 2, 3, 4].map((i) => (
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
                <h1 className="dashboard-title">Analytics</h1>
                <p className="dashboard-subtitle">Performance metrics and insights</p>
            </div>

            {/* Overall Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-label">Total Requests</div>
                    <div className="stat-value">{stats?.total || 0}</div>
                    <div className="stat-sublabel">All time</div>
                </div>

                <div className="stat-card">
                    <div className="stat-label">Conversion Rate</div>
                    <div className="stat-value success">
                        {getPercent(stats?.quoted, stats?.total)}%
                    </div>
                    <div className="stat-sublabel">Quoted / Total</div>
                </div>

                <div className="stat-card">
                    <div className="stat-label">Email Volume</div>
                    <div className="stat-value info">{emailStats?.total || 0}</div>
                    <div className="stat-sublabel">{emailStats?.processed || 0} processed</div>
                </div>

                <div className="stat-card">
                    <div className="stat-label">Quotations</div>
                    <div className="stat-value">{quotationStats?.total || 0}</div>
                    <div className="stat-sublabel">{quotationStats?.accepted || 0} accepted</div>
                </div>
            </div>

            {/* Analytics Charts Placeholder */}
            <div className="dashboard-grid">
                {/* Request Funnel */}
                <div className="section-card">
                    <div className="section-header">
                        <span className="section-icon">📊</span>
                        <h3 className="section-title">Request Funnel</h3>
                    </div>
                    <div className="section-content">
                        <div className="workflow-list">
                            {stats?.byStage?.map((stage) => (
                                <div key={stage.funnel_stage} className="workflow-item">
                                    <span className="workflow-label">{stage.funnel_stage}</span>
                                    <span className="workflow-percent">{getPercent(stage.count, stats?.total)}%</span>
                                    <div className="workflow-bar">
                                        <div
                                            className={`workflow-bar-fill ${stage.funnel_stage === 'New' ? 'open' : stage.funnel_stage === 'Assigned' ? 'progress' : 'closed'}`}
                                            style={{ width: `${getPercent(stage.count, stats?.total)}%` }}
                                        ></div>
                                    </div>
                                    <span className="workflow-count">{stage.count}</span>
                                </div>
                            )) || (
                                    <div style={{ color: '#a3a3a3', fontSize: '0.875rem' }}>No data available</div>
                                )}
                        </div>
                    </div>
                </div>

                {/* Email Processing */}
                <div className="section-card">
                    <div className="section-header">
                        <span className="section-icon">📧</span>
                        <h3 className="section-title">Email Processing</h3>
                    </div>
                    <div className="section-content">
                        <div className="workflow-list">
                            <div className="workflow-item">
                                <span className="workflow-label">Pending</span>
                                <span className="workflow-percent">{getPercent(emailStats?.pending, emailStats?.total)}%</span>
                                <div className="workflow-bar">
                                    <div
                                        className="workflow-bar-fill open"
                                        style={{ width: `${getPercent(emailStats?.pending, emailStats?.total)}%` }}
                                    ></div>
                                </div>
                                <span className="workflow-count">{emailStats?.pending || 0}</span>
                            </div>
                            <div className="workflow-item">
                                <span className="workflow-label">Processed</span>
                                <span className="workflow-percent">{getPercent(emailStats?.processed, emailStats?.total)}%</span>
                                <div className="workflow-bar">
                                    <div
                                        className="workflow-bar-fill closed"
                                        style={{ width: `${getPercent(emailStats?.processed, emailStats?.total)}%` }}
                                    ></div>
                                </div>
                                <span className="workflow-count">{emailStats?.processed || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quotation Stats */}
            <div className="section-card">
                <div className="section-header">
                    <span className="section-icon">💰</span>
                    <h3 className="section-title">Quotation Analytics</h3>
                </div>
                <div className="section-content">
                    <div className="stats-grid" style={{ marginBottom: 0 }}>
                        <div className="stat-card">
                            <div className="stat-label">Draft</div>
                            <div className="stat-value">{quotationStats?.draft || 0}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Sent</div>
                            <div className="stat-value info">{quotationStats?.sent || 0}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Accepted</div>
                            <div className="stat-value success">{quotationStats?.accepted || 0}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Acceptance Rate</div>
                            <div className="stat-value">
                                {getPercent(quotationStats?.accepted, quotationStats?.total)}%
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AnalyticsPage;
