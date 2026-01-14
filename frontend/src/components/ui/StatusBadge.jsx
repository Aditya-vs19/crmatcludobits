import './StatusBadge.css';

const StatusBadge = ({ status, size = 'md' }) => {
    const getStatusClass = () => {
        switch (status?.toLowerCase()) {
            case 'pending':
            case 'new':
                return 'status-warning';
            case 'in progress':
            case 'processing':
                return 'status-info';
            case 'completed':
            case 'approved':
            case 'active':
                return 'status-success';
            case 'rejected':
            case 'cancelled':
            case 'failed':
                return 'status-error';
            default:
                return 'status-default';
        }
    };

    return (
        <span className={`status-badge ${getStatusClass()} status-${size}`}>
            {status}
        </span>
    );
};

export default StatusBadge;
