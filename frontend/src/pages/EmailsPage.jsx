import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import StatusBadge from '../components/ui/StatusBadge';
import api from '../services/api';
import EmailDetailModal from '../components/emails/EmailDetailModal';

const EmailsPage = () => {
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [stats, setStats] = useState(null);
    const [filters, setFilters] = useState({
        account: '',
        status: '',
    });

    // Fetch emails
    const fetchEmails = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filters.account) params.append('account', filters.account);
            if (filters.status) params.append('status', filters.status);

            const response = await api.get(`/emails?${params.toString()}`);
            setEmails(response.data.data || []);
        } catch (error) {
            console.error('Error fetching emails:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch stats
    const fetchStats = async () => {
        try {
            const response = await api.get('/emails/stats');
            setStats(response.data.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    // Manual processing trigger
    const triggerProcessing = async () => {
        try {
            const response = await api.post('/emails/process');
            alert(response.data.message);
            fetchEmails();
            fetchStats();
        } catch (error) {
            alert('Failed to process emails: ' + (error.response?.data?.message || error.message));
        }
    };

    useEffect(() => {
        fetchEmails();
        fetchStats();
    }, [filters]);

    const handleRowClick = async (row) => {
        try {
            const response = await api.get(`/emails/${row.id}`);
            setSelectedEmail(response.data.data);
            setShowModal(true);
        } catch (error) {
            console.error('Error fetching email details:', error);
        }
    };

    const columns = [
        { header: 'ID', accessor: 'id' },
        {
            header: 'Account',
            accessor: 'account',
            render: (row) => (
                <span style={{
                    textTransform: 'capitalize',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--primary-700)'
                }}>
                    {row.account}
                </span>
            )
        },
        { header: 'From', accessor: 'sender_email' },
        { header: 'Subject', accessor: 'subject' },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => <StatusBadge status={row.status} />
        },
        {
            header: 'Received',
            accessor: 'received_at',
            render: (row) => new Date(row.received_at).toLocaleString()
        },
    ];

    return (
        <DashboardLayout>
            {/* Stats Cards */}
            {stats && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 'var(--space-6)',
                    marginBottom: 'var(--space-8)'
                }}>
                    <Card>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '0.875rem', color: 'var(--neutral-600)', marginBottom: 'var(--space-2)' }}>
                                Total Emails
                            </p>
                            <h3 style={{ fontSize: '2rem', fontWeight: 'var(--font-weight-bold)', margin: 0 }}>
                                {stats.total}
                            </h3>
                        </div>
                    </Card>

                    <Card>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '0.875rem', color: 'var(--neutral-600)', marginBottom: 'var(--space-2)' }}>
                                Pending
                            </p>
                            <h3 style={{ fontSize: '2rem', fontWeight: 'var(--font-weight-bold)', margin: 0, color: 'var(--warning)' }}>
                                {stats.pending}
                            </h3>
                        </div>
                    </Card>

                    <Card>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '0.875rem', color: 'var(--neutral-600)', marginBottom: 'var(--space-2)' }}>
                                Processed
                            </p>
                            <h3 style={{ fontSize: '2rem', fontWeight: 'var(--font-weight-bold)', margin: 0, color: 'var(--success)' }}>
                                {stats.processed}
                            </h3>
                        </div>
                    </Card>
                </div>
            )}

            {/* Emails Table */}
            <Card
                title="Emails"
                subtitle="All incoming emails from monitored accounts"
                headerAction={
                    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                        <select
                            value={filters.account}
                            onChange={(e) => setFilters({ ...filters, account: e.target.value })}
                            style={{
                                padding: 'var(--space-2) var(--space-3)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--neutral-300)',
                                fontSize: '0.875rem'
                            }}
                        >
                            <option value="">All Accounts</option>
                            <option value="admin">Admin</option>
                            <option value="sales">Sales</option>
                            <option value="operations">Operations</option>
                        </select>

                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            style={{
                                padding: 'var(--space-2) var(--space-3)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--neutral-300)',
                                fontSize: '0.875rem'
                            }}
                        >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="processed">Processed</option>
                        </select>

                        <button
                            onClick={triggerProcessing}
                            className="btn btn-primary"
                            style={{ fontSize: '0.875rem', padding: 'var(--space-2) var(--space-4)' }}
                        >
                            Check Emails
                        </button>
                    </div>
                }
            >
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--neutral-500)' }}>
                        Loading emails...
                    </div>
                ) : (
                    <Table
                        columns={columns}
                        data={emails}
                        onRowClick={handleRowClick}
                    />
                )}
            </Card>

            {/* Email Detail Modal */}
            {showModal && selectedEmail && (
                <EmailDetailModal
                    email={selectedEmail}
                    onClose={() => setShowModal(false)}
                />
            )}
        </DashboardLayout>
    );
};

export default EmailsPage;
