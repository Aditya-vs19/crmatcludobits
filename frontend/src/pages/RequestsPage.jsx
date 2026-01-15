import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import DashboardLayout from '../components/layout/DashboardLayout';
import AssignmentModal from '../components/requests/AssignmentModal';
import './Dashboard.css';

const RequestsPage = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [filter, setFilter] = useState('all');

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await api.get('/requests');
            setRequests(response.data.data || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching requests:', err);
            setError('Failed to load requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAssign = (request) => {
        setSelectedRequest(request);
        setShowAssignModal(true);
    };

    const handleAssignmentComplete = () => {
        setShowAssignModal(false);
        setSelectedRequest(null);
        fetchRequests();
    };

    const filteredRequests = requests.filter(request => {
        if (filter === 'all') return true;
        return request.funnel_stage?.toLowerCase() === filter.toLowerCase();
    });

    const getStageColor = (stage) => {
        const colors = {
            'New': 'var(--info)',
            'Assigned': 'var(--warning)',
            'Quoted': 'var(--primary-500)',
            'Closed': 'var(--success)',
        };
        return colors[stage] || 'var(--neutral-500)';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            'Low': 'var(--success)',
            'Medium': 'var(--warning)',
            'High': 'var(--error)',
            'Urgent': 'var(--error)',
        };
        return colors[priority] || 'var(--neutral-500)';
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="dashboard-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading requests...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout>
                <div className="dashboard-error">
                    <p>{error}</p>
                    <button onClick={fetchRequests} className="btn-primary">Retry</button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="requests-page">
                <div className="page-header">
                    <h1>Service Requests</h1>
                    <p className="page-subtitle">Manage and track all customer requests</p>
                </div>

                {/* Filter Tabs */}
                <div className="filter-tabs" style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                    {['all', 'New', 'Assigned', 'Quoted', 'Closed'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                border: 'none',
                                background: filter === f ? 'var(--primary-500)' : 'var(--neutral-100)',
                                color: filter === f ? 'white' : 'var(--neutral-700)',
                                cursor: 'pointer',
                                fontWeight: filter === f ? '600' : '400',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            {f === 'all' ? 'All' : f}
                        </button>
                    ))}
                </div>

                {/* Requests Table */}
                <div className="card" style={{ overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--neutral-50)', borderBottom: '1px solid var(--neutral-200)' }}>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--neutral-600)' }}>Request ID</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--neutral-600)' }}>Customer</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--neutral-600)' }}>Requirements</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--neutral-600)' }}>Stage</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--neutral-600)' }}>Priority</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--neutral-600)' }}>Date</th>
                                {user?.role === 'Admin' && (
                                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: 'var(--neutral-600)' }}>Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={user?.role === 'Admin' ? 7 : 6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--neutral-500)' }}>
                                        No requests found
                                    </td>
                                </tr>
                            ) : (
                                filteredRequests.map((request) => (
                                    <tr key={request.id} style={{ borderBottom: '1px solid var(--neutral-100)' }}>
                                        <td style={{ padding: '1rem', fontFamily: 'monospace', color: 'var(--primary-600)' }}>
                                            {request.request_id}
                                        </td>
                                        <td style={{ padding: '1rem' }}>{request.customer_email}</td>
                                        <td style={{ padding: '1rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {request.requirements}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '999px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                background: `${getStageColor(request.funnel_stage)}20`,
                                                color: getStageColor(request.funnel_stage),
                                            }}>
                                                {request.funnel_stage}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '999px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                background: `${getPriorityColor(request.priority)}20`,
                                                color: getPriorityColor(request.priority),
                                            }}>
                                                {request.priority}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--neutral-500)', fontSize: '0.875rem' }}>
                                            {new Date(request.created_at).toLocaleDateString()}
                                        </td>
                                        {user?.role === 'Admin' && (
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                <button
                                                    onClick={() => handleAssign(request)}
                                                    style={{
                                                        padding: '0.5rem 1rem',
                                                        borderRadius: '6px',
                                                        border: 'none',
                                                        background: 'var(--primary-500)',
                                                        color: 'white',
                                                        cursor: 'pointer',
                                                        fontSize: '0.875rem',
                                                    }}
                                                >
                                                    {request.assigned_user_id ? 'Reassign' : 'Assign'}
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showAssignModal && selectedRequest && (
                <AssignmentModal
                    request={selectedRequest}
                    onClose={() => setShowAssignModal(false)}
                    onAssign={handleAssignmentComplete}
                />
            )}
        </DashboardLayout>
    );
};

export default RequestsPage;
