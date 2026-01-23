import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import api from '../services/api';
import './Dashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  const [emailStats, setEmailStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, requestsRes, emailsRes, emailStatsRes] = await Promise.all([
        api.get('/requests/stats'),
        api.get('/requests?limit=10'),
        api.get('/emails?limit=5').catch(() => ({ data: { data: [] } })),
        api.get('/emails/stats').catch(() => ({ data: { data: null } })),
      ]);

      setStats(statsRes.data.data);
      setRequests(requestsRes.data.data || []);
      setEmails(emailsRes.data.data || []);
      setEmailStats(emailStatsRes.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate funnel stage percentages
  const getStagePercent = (count) => {
    if (!stats?.total || stats.total === 0) return 0;
    return Math.round((count / stats.total) * 100);
  };

  // Loading skeleton
  if (loading) {
    return (
      <DashboardLayout>
        <div className="dashboard-header">
          <h1 className="dashboard-title">Dashboard Overview</h1>
          <p className="dashboard-subtitle">Real-time system metrics and performance tracking</p>
        </div>

        <div className="stats-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="stat-card skeleton skeleton-stat"></div>
          ))}
        </div>

        <div className="dashboard-grid">
          <div className="section-card">
            <div className="section-header">
              <span className="section-title">Loading...</span>
            </div>
            <div className="section-content">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton skeleton-row"></div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard Overview</h1>
        <p className="dashboard-subtitle">Real-time system metrics and performance tracking</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Requests</div>
          <div className="stat-value">{stats?.total || 0}</div>
          <div className="stat-sublabel">All time</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Emails</div>
          <div className="stat-value info">{emailStats?.total || 0}</div>
          <div className="stat-sublabel">
            {emailStats?.pending || 0} pending processing
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">In Progress</div>
          <div className="stat-value">{stats?.assigned || 0}</div>
          <div className="stat-sublabel">Active investigations</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Resolved</div>
          <div className="stat-value success">{stats?.quoted || 0}</div>
          <div className="stat-sublabel">
            Success rate: {stats?.total ? Math.round((stats.quoted / stats.total) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* Recent Emails Table */}
      <div className="section-card">
        <div className="section-header">

          <h3 className="section-title">Recent Emails</h3>
        </div>
        <div className="section-content" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Sender</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Received</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {emails.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: '#a3a3a3' }}>
                    No emails found
                  </td>
                </tr>
              ) : (
                emails.map((email) => (
                  <tr key={email.id}>
                    <td style={{ fontWeight: 500, color: '#171717' }}>{email.sender_email}</td>
                    <td>{email.subject?.substring(0, 50)}{email.subject?.length > 50 ? '...' : ''}</td>
                    <td>
                      <span className={`status-chip ${email.status?.toLowerCase()}`}>
                        {email.status}
                      </span>
                    </td>
                    <td>{new Date(email.received_at).toLocaleString()}</td>
                    <td>
                      <button className="action-btn" onClick={() => navigate('/emails')}>View</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Requests Table */}
      <div className="section-card">
        <div className="section-header">

          <h3 className="section-title">Recent Requests</h3>
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
                <th></th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: '#a3a3a3' }}>
                    No requests found
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
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
                    <td>
                      <button className="action-btn" onClick={() => navigate(`/admin/requests`)}>View</button>
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

export default AdminDashboard;
