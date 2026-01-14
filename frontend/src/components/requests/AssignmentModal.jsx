import { useState, useEffect } from 'react';
import api from '../../services/api';
import './AssignmentModal.css';

const AssignmentModal = ({ request, onClose, onAssigned }) => {
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            // Fetch all users (we'll filter Sales and Operations on frontend)
            const response = await api.get('/auth/users'); // You'll need to add this endpoint
            const allUsers = response.data.data || [];

            // Filter to Sales and Operations only
            const assignableUsers = allUsers.filter(u =>
                u.role === 'Sales' || u.role === 'Operations'
            );

            setUsers(assignableUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
            setError('Failed to load users');
        }
    };

    const handleAssign = async () => {
        if (!selectedUserId) {
            setError('Please select a user');
            return;
        }

        try {
            setLoading(true);
            setError('');

            await api.post(`/requests/${request.id}/assign`, {
                userId: parseInt(selectedUserId),
                notes,
            });

            onAssigned && onAssigned();
            onClose();
        } catch (error) {
            console.error('Error assigning request:', error);
            setError(error.response?.data?.message || 'Failed to assign request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content assignment-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Assign Request</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <div className="request-info">
                        <p><strong>Request ID:</strong> {request.request_id}</p>
                        <p><strong>Customer:</strong> {request.customer_email}</p>
                        <p><strong>Requirements:</strong> {request.requirements}</p>
                        {request.assigned_user_email && (
                            <p><strong>Currently Assigned To:</strong> {request.assigned_user_email}</p>
                        )}
                    </div>

                    {error && (
                        <div className="error-message">{error}</div>
                    )}

                    <div className="form-group">
                        <label htmlFor="user-select">Assign To:</label>
                        <select
                            id="user-select"
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                            className="form-select"
                        >
                            <option value="">Select a user...</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.email} ({user.role})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="notes">Notes (optional):</label>
                        <textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="form-textarea"
                            rows="3"
                            placeholder="Add any notes about this assignment..."
                        />
                    </div>
                </div>

                <div className="modal-footer">
                    <button onClick={onClose} className="btn btn-secondary">
                        Cancel
                    </button>
                    <button
                        onClick={handleAssign}
                        className="btn btn-primary"
                        disabled={loading || !selectedUserId}
                    >
                        {loading ? 'Assigning...' : request.assigned_user_id ? 'Reassign' : 'Assign'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssignmentModal;
