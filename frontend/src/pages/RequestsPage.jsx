import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import DashboardLayout from '../components/layout/DashboardLayout';
import AssignmentModal from '../components/requests/AssignmentModal';
import QuotationForm from '../components/quotations/QuotationForm';
import './Dashboard.css';

const RequestsPage = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showQuotationModal, setShowQuotationModal] = useState(false);
    const [filter, setFilter] = useState('all');

    const fetchRequests = async () => {
        try {
            setLoading(true);
            // For Admin: fetch all requests
            // For Sales/Operations: fetch only assigned requests
            let url = '/requests';
            if (user?.role !== 'Admin' && user?.id) {
                url = `/requests?assignedUserId=${user.id}`;
            }
            const response = await api.get(url);
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
        if (user?.id) {
            fetchRequests();
        }
    }, [user?.id]);

    const handleAssign = (request) => {
        setSelectedRequest(request);
        setShowAssignModal(true);
    };

    const handleAssignmentComplete = () => {
        setShowAssignModal(false);
        setSelectedRequest(null);
        fetchRequests();
    };

    const handleSendQuotation = (request) => {
        setSelectedRequest(request);
        setShowQuotationModal(true);
    };

    const handleQuotationSaved = () => {
        fetchRequests(); // Refresh requests as status might have changed
    };

    const filteredRequests = requests.filter(request => {
        if (filter === 'all') return true;
        return request.funnel_stage?.toLowerCase() === filter.toLowerCase();
    });

    const getStageColor = (stage) => {
        // All stages use gray/black
        return '#48484a';
    };

    const getPriorityColor = (priority) => {
        // All priorities use gray/black
        return '#48484a';
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
                                borderRadius: '6px',
                                border: filter === f ? '1px solid #1d1d1f' : '1px solid #d2d2d7',
                                background: filter === f ? '#1d1d1f' : '#ffffff',
                                color: filter === f ? 'white' : '#48484a',
                                cursor: 'pointer',
                                fontWeight: filter === f ? '500' : '400',
                                fontSize: '0.875rem',
                                transition: 'all 0.15s ease',
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
                                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: 'var(--neutral-600)' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--neutral-500)' }}>
                                        {user?.role === 'Admin' ? 'No requests found' : 'No assigned requests found'}
                                    </td>
                                </tr>
                            ) : (
                                filteredRequests.map((request) => (
                                    <tr key={request.id} style={{ borderBottom: '1px solid var(--neutral-100)' }}>
                                        <td style={{ padding: '1rem', fontFamily: 'monospace', color: '#1d1d1f', fontWeight: '500' }}>
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
                                                fontWeight: '500',
                                                background: '#f5f5f7',
                                                color: '#1d1d1f',
                                            }}>
                                                {request.funnel_stage}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '999px',
                                                fontSize: '0.75rem',
                                                fontWeight: '500',
                                                background: '#f5f5f7',
                                                color: '#1d1d1f',
                                            }}>
                                                {request.priority}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--neutral-500)', fontSize: '0.875rem' }}>
                                            {new Date(request.created_at).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                <button
                                                    onClick={() => {
                                                        setSelectedRequest(request);
                                                        setShowDetailModal(true);
                                                    }}
                                                    title="View Details"
                                                    style={{
                                                        padding: '0.375rem',
                                                        borderRadius: '6px',
                                                        border: '1px solid #d2d2d7',
                                                        background: 'white',
                                                        color: '#1d1d1f',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        minWidth: '32px'
                                                    }}
                                                >
                                                    👁️
                                                </button>

                                                <button
                                                    onClick={() => handleSendQuotation(request)}
                                                    title="Send Quotation"
                                                    style={{
                                                        padding: '0.375rem',
                                                        borderRadius: '6px',
                                                        border: '1px solid #d2d2d7',
                                                        background: 'white',
                                                        color: '#1d1d1f',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        minWidth: '32px'
                                                    }}
                                                >
                                                    📄
                                                </button>

                                                {user?.role === 'Admin' && (
                                                    <button
                                                        onClick={() => handleAssign(request)}
                                                        title={request.assigned_user_id ? 'Reassign' : 'Assign'}
                                                        style={{
                                                            padding: '0.375rem 0.875rem',
                                                            borderRadius: '6px',
                                                            border: '1px solid #1d1d1f',
                                                            background: '#1d1d1f',
                                                            color: 'white',
                                                            cursor: 'pointer',
                                                            fontSize: '0.8125rem',
                                                            fontWeight: '500',
                                                        }}
                                                    >
                                                        {request.assigned_user_id ? 'Reassign' : 'Assign'}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Assignment Modal for Admin */}
            {showAssignModal && selectedRequest && (
                <AssignmentModal
                    request={selectedRequest}
                    onClose={() => setShowAssignModal(false)}
                    onAssign={handleAssignmentComplete}
                />
            )}

            {/* Quotation Form Modal */}
            {showQuotationModal && selectedRequest && (
                <QuotationForm
                    requestId={selectedRequest.id}
                    quotation={{
                        customer_email: selectedRequest.customer_email,
                        request_id: selectedRequest.id
                    }}
                    onClose={() => setShowQuotationModal(false)}
                    onSaved={handleQuotationSaved}
                />
            )}

            {/* Request Detail Modal for Sales/Operations */}
            {showDetailModal && selectedRequest && (
                <div
                    className="modal-overlay"
                    onClick={() => setShowDetailModal(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                    }}
                >
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: 'white',
                            borderRadius: '12px',
                            padding: '2rem',
                            maxWidth: '600px',
                            width: '90%',
                            maxHeight: '80vh',
                            overflow: 'auto',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600', color: '#1d1d1f' }}>
                                Request Details
                            </h2>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    color: '#86868b',
                                    padding: '0.25rem',
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#86868b', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Request ID</label>
                                    <p style={{ margin: 0, fontFamily: 'monospace', fontWeight: '600', color: '#1d1d1f' }}>{selectedRequest.request_id}</p>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#86868b', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</label>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '999px',
                                        fontSize: '0.75rem',
                                        fontWeight: '500',
                                        background: '#f5f5f7',
                                        color: '#1d1d1f',
                                    }}>{selectedRequest.funnel_stage}</span>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: '#86868b', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Customer Email</label>
                                <p style={{ margin: 0, color: '#1d1d1f' }}>{selectedRequest.customer_email}</p>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: '#86868b', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Requirements</label>
                                <p style={{ margin: 0, color: '#1d1d1f', whiteSpace: 'pre-wrap', background: '#f5f5f7', padding: '1rem', borderRadius: '8px' }}>{selectedRequest.requirements}</p>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#86868b', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Priority</label>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '999px',
                                        fontSize: '0.75rem',
                                        fontWeight: '500',
                                        background: '#f5f5f7',
                                        color: '#1d1d1f',
                                    }}>{selectedRequest.priority}</span>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#86868b', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Source</label>
                                    <p style={{ margin: 0, color: '#1d1d1f' }}>{selectedRequest.source || 'Email'}</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#86868b', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Created</label>
                                    <p style={{ margin: 0, color: '#1d1d1f' }}>{new Date(selectedRequest.created_at).toLocaleString()}</p>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#86868b', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Updated</label>
                                    <p style={{ margin: 0, color: '#1d1d1f' }}>{new Date(selectedRequest.updated_at).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '8px',
                                    border: '1px solid #1d1d1f',
                                    background: '#1d1d1f',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default RequestsPage;
