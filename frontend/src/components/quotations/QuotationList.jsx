import { useState } from 'react';

const QuotationList = ({ quotations, onEdit, onDelete }) => {
    const [expandedId, setExpandedId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const filteredQuotations = quotations.filter(quotation =>
        quotation.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quotation.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quotation.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (quotation) => {
        if (window.confirm(`Are you sure you want to delete this quotation for "${quotation.product_name}"?`)) {
            await onDelete(quotation.id);
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Draft': return 'status-draft';
            case 'Sent': return 'status-sent';
            case 'Accepted': return 'status-accepted';
            case 'Rejected': return 'status-rejected';
            default: return '';
        }
    };

    return (
        <div className="quotation-list">
            <div className="list-header">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search quotations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input search-input"
                    />
                </div>
                <div className="quotation-count">
                    {filteredQuotations.length} {filteredQuotations.length === 1 ? 'quotation' : 'quotations'}
                </div>
            </div>

            {filteredQuotations.length === 0 ? (
                <div className="empty-state">
                    <p>No quotations found.</p>
                    {searchTerm && <p className="empty-hint">Try adjusting your search</p>}
                </div>
            ) : (
                <div className="quotations-grid">
                    {filteredQuotations.map((quotation) => (
                        <div key={quotation.id} className="quotation-card">
                            <div className="quotation-header">
                                <div className="header-left">
                                    <h3 className="product-name">{quotation.product_name}</h3>
                                    <span className={`status-badge ${getStatusClass(quotation.status)}`}>
                                        {quotation.status}
                                    </span>
                                </div>
                                <div className="quotation-actions">
                                    {onEdit && (
                                        <button
                                            onClick={() => onEdit(quotation)}
                                            className="btn-icon btn-edit"
                                            title="Edit quotation"
                                        >
                                            ✏️
                                        </button>
                                    )}
                                    {onDelete && (
                                        <button
                                            onClick={() => handleDelete(quotation)}
                                            className="btn-icon btn-delete"
                                            title="Delete quotation"
                                        >
                                            🗑️
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="quotation-details">
                                <div className="detail-row">
                                    <span className="detail-label">Customer:</span>
                                    <span className="detail-value">
                                        {quotation.customer_name || quotation.customer_email}
                                    </span>
                                </div>

                                {quotation.pricing && (
                                    <div className="detail-row">
                                        <span className="detail-label">Pricing:</span>
                                        <span className="detail-value pricing">{quotation.pricing}</span>
                                    </div>
                                )}

                                {quotation.quantity > 1 && (
                                    <div className="detail-row">
                                        <span className="detail-label">Quantity:</span>
                                        <span className="detail-value">{quotation.quantity}</span>
                                    </div>
                                )}
                            </div>

                            {quotation.specifications && quotation.specifications.length > 0 && (
                                <div className="specifications-container">
                                    <button
                                        onClick={() => toggleExpand(quotation.id)}
                                        className="btn-toggle-specs"
                                    >
                                        {expandedId === quotation.id ? '▼' : '▶'} Specifications ({quotation.specifications.length})
                                    </button>

                                    {expandedId === quotation.id && (
                                        <div className="specifications-list">
                                            {quotation.specifications.map((spec, index) => (
                                                <div key={index} className="spec-item">
                                                    <span className="spec-key">{spec.key}:</span>
                                                    <span className="spec-value">{spec.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {quotation.notes && (
                                <div className="quotation-notes">
                                    <strong>Notes:</strong> {quotation.notes}
                                </div>
                            )}

                            <div className="quotation-footer">
                                <span className="quotation-meta">
                                    Created by {quotation.creator_email || 'Unknown'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default QuotationList;
