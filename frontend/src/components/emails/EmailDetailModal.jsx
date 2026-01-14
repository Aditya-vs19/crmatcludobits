import './EmailDetailModal.css';

const EmailDetailModal = ({ email, onClose }) => {
    if (!email) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Email Details</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    {/* Email Info */}
                    <div className="email-info-section">
                        <div className="info-row">
                            <span className="info-label">From:</span>
                            <span className="info-value">
                                {email.sender_name ? `${email.sender_name} <${email.sender_email}>` : email.sender_email}
                            </span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Account:</span>
                            <span className="info-value" style={{ textTransform: 'capitalize' }}>{email.account}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Subject:</span>
                            <span className="info-value">{email.subject}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Received:</span>
                            <span className="info-value">{new Date(email.received_at).toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Email Body */}
                    <div className="email-body-section">
                        <h3>Message</h3>
                        <div className="email-body">
                            {email.body_text || 'No text content'}
                        </div>
                    </div>

                    {/* Extracted Data */}
                    {email.extractedData && (
                        <div className="extracted-data-section">
                            <h3>AI Extracted Data</h3>
                            <div className="extracted-data-card">
                                <div className="extracted-item">
                                    <span className="extracted-label">Product:</span>
                                    <span className="extracted-value">
                                        {email.extractedData.product_name || 'Not detected'}
                                    </span>
                                </div>
                                <div className="extracted-item">
                                    <span className="extracted-label">Quantity:</span>
                                    <span className="extracted-value">
                                        {email.extractedData.quantity || 'Not specified'}
                                    </span>
                                </div>
                                {email.extractedData.specifications && (
                                    <div className="extracted-item">
                                        <span className="extracted-label">Specifications:</span>
                                        <div className="specs-list">
                                            {JSON.parse(email.extractedData.specifications) &&
                                                Object.entries(JSON.parse(email.extractedData.specifications)).map(([key, value]) => (
                                                    <div key={key} className="spec-item">
                                                        <strong>{key}:</strong> {value}
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>
                                )}
                                <div className="confidence-score">
                                    <span className="extracted-label">AI Confidence:</span>
                                    <div className="confidence-bar">
                                        <div
                                            className="confidence-fill"
                                            style={{ width: `${(email.extractedData.confidence_score || 0) * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className="confidence-value">
                                        {((email.extractedData.confidence_score || 0) * 100).toFixed(0)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Attachments */}
                    {email.attachments && email.attachments.length > 0 && (
                        <div className="attachments-section">
                            <h3>Attachments ({email.attachments.length})</h3>
                            <div className="attachments-list">
                                {email.attachments.map((attachment) => (
                                    <div key={attachment.id} className="attachment-item">
                                        <span className="attachment-icon">📎</span>
                                        <div className="attachment-info">
                                            <div className="attachment-name">{attachment.filename}</div>
                                            <div className="attachment-meta">
                                                {attachment.content_type} • {(attachment.size / 1024).toFixed(1)} KB
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmailDetailModal;
