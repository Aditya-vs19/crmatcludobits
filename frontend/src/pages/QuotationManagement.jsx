import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import QuotationForm from '../components/quotations/QuotationForm';
import QuotationList from '../components/quotations/QuotationList';
import api from '../services/api';
import './QuotationManagement.css';

const QuotationManagement = () => {
    const { user } = useAuth();
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingQuotation, setEditingQuotation] = useState(null);
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

    const handleCreateQuotation = () => {
        setEditingQuotation(null);
        setShowForm(true);
    };

    const handleEditQuotation = (quotation) => {
        setEditingQuotation(quotation);
        setShowForm(true);
    };

    const handleDeleteQuotation = async (quotationId) => {
        try {
            await api.delete(`/quotations/${quotationId}`);
            await fetchQuotations();
        } catch (error) {
            console.error('Error deleting quotation:', error);
            alert(error.response?.data?.message || 'Failed to delete quotation');
        }
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditingQuotation(null);
    };

    const handleQuotationSaved = () => {
        fetchQuotations();
    };

    // Check if user has permission to manage quotations
    const canManageQuotations = user && ['Admin', 'Sales', 'Operations'].includes(user.role);
    const canDeleteQuotations = user && user.role === 'Admin';

    return (
        <DashboardLayout>
            <div className="quotation-management">
                <div className="page-header">
                    <div className="header-content">
                        <h1>Quotation Management</h1>
                        <p className="header-subtitle">
                            Create and manage quotations with smart product and specification dropdowns
                        </p>
                    </div>
                    {canManageQuotations && (
                        <button onClick={handleCreateQuotation} className="btn btn-primary">
                            + Create Quotation
                        </button>
                    )}
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
                        onEdit={canManageQuotations ? handleEditQuotation : null}
                        onDelete={canDeleteQuotations ? handleDeleteQuotation : null}
                    />
                )}

                {showForm && (
                    <QuotationForm
                        quotation={editingQuotation}
                        onClose={handleFormClose}
                        onSaved={handleQuotationSaved}
                    />
                )}
            </div>
        </DashboardLayout>
    );
};

export default QuotationManagement;
