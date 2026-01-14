import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = ({ children, allowedRoles = [] }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                fontSize: '1.25rem',
                color: 'var(--primary-600)'
            }}>
                Loading...
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                gap: 'var(--space-4)',
            }}>
                <h1 style={{ fontSize: '2rem', color: 'var(--error)' }}>Access Denied</h1>
                <p style={{ color: 'var(--neutral-600)' }}>
                    You don't have permission to access this page.
                </p>
                <p style={{ color: 'var(--neutral-500)', fontSize: '0.875rem' }}>
                    Required role: {allowedRoles.join(', ')} | Your role: {user.role}
                </p>
            </div>
        );
    }

    return children;
};

export default PrivateRoute;
