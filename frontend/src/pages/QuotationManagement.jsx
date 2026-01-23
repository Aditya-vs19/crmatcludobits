import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import QuotationList from '../components/quotations/QuotationList';
import api from '../services/api';
import './Dashboard.css';

const QuotationManagement = () => {
    const { user } = useAuth();
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchQuotations();
    }, []);

    const fetchQuotations = async () => {
        try {
            setLoading(true);
            const response = await api.get('/quotations');
            setQuotations(response.data.data || []);
            setError('');
        } catch (error) {
            console.error('Error fetching quotations:', error);
            setError('Failed to load quotations');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="quotation-management">
                <div className="page-header">
                    <div className="header-content">
                        <h1>Quotation History</h1>
                        <p className="header-subtitle">
                            View all sent and drafted quotations
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="error-banner">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading quotations...</p>
                    </div>
                ) : (
                    <QuotationList
                        quotations={quotations}
                    // Read-only: no onEdit or onDelete passed
                    />
                )}
            </div>
        </DashboardLayout>
    );
};

export default QuotationManagement;
