import { useState, useEffect } from 'react';
import api from '../../services/api';
import SmartDropdown from '../ui/SmartDropdown';
import './QuotationForm.css';

const QuotationForm = ({ quotation, requestId, onClose, onSaved }) => {
    const [formData, setFormData] = useState({
        requestId: quotation?.request_id || requestId || '',
        customerEmail: quotation?.customer_email || '',
        customerName: quotation?.customer_name || '',
        productName: quotation?.product_name || '',
        pricing: quotation?.pricing || '',
        quantity: quotation?.quantity || 1,
        notes: quotation?.notes || '',
        status: quotation?.status || 'Draft',
    });

    const [specifications, setSpecifications] = useState(
        quotation?.specifications || [{ key: '', value: '' }]
    );

    const [productOptions, setProductOptions] = useState([]);
    const [specKeyOptions, setSpecKeyOptions] = useState([]);
    const [specValueOptions, setSpecValueOptions] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProductOptions();
        fetchSpecKeyOptions();
    }, []);

    const fetchProductOptions = async () => {
        try {
            const response = await api.get('/products/dropdown');
            setProductOptions(response.data.data.map(p => p.name));
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchSpecKeyOptions = async () => {
        try {
            const response = await api.get('/quotations/spec-keys');
            setSpecKeyOptions(response.data.data);
        } catch (error) {
            console.error('Error fetching spec keys:', error);
        }
    };

    const fetchSpecValueOptions = async (key) => {
        try {
            const response = await api.get(`/quotations/spec-values/${encodeURIComponent(key)}`);
            setSpecValueOptions(prev => ({
                ...prev,
                [key]: response.data.data,
            }));
        } catch (error) {
            console.error('Error fetching spec values:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSpecChange = (index, field, value) => {
        const newSpecs = [...specifications];
        newSpecs[index][field] = value;
        setSpecifications(newSpecs);

        // Fetch value options when key changes
        if (field === 'key' && value) {
            fetchSpecValueOptions(value);
        }
    };

    const addSpecification = () => {
        setSpecifications([...specifications, { key: '', value: '' }]);
    };

    const removeSpecification = (index) => {
        if (specifications.length > 1) {
            setSpecifications(specifications.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.customerEmail || !formData.productName) {
            setError('Customer email and product name are required');
            return;
        }

        // Filter out empty specifications
        const validSpecs = specifications.filter(spec => spec.key.trim() && spec.value.trim());

        try {
            setLoading(true);
            setError('');

            const payload = {
                ...formData,
                specifications: validSpecs,
                autoSaveProduct: true, // Enable auto-save for new products/specs
            };

            if (quotation) {
                // Update existing quotation
                await api.put(`/quotations/${quotation.id}`, payload);
            } else {
                // Create new quotation
                await api.post('/quotations', payload);
            }

            onSaved && onSaved();
            onClose();
        } catch (error) {
            console.error('Error saving quotation:', error);
            setError(error.response?.data?.message || 'Failed to save quotation');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content quotation-form-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{quotation ? 'Edit Quotation' : 'Create New Quotation'}</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {error && (
                            <div className="error-message">{error}</div>
                        )}

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="customerEmail">Customer Email *</label>
                                <input
                                    type="email"
                                    id="customerEmail"
                                    name="customerEmail"
                                    value={formData.customerEmail}
                                    onChange={handleInputChange}
                                    className="input"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="customerName">Customer Name</label>
                                <input
                                    type="text"
                                    id="customerName"
                                    name="customerName"
                                    value={formData.customerName}
                                    onChange={handleInputChange}
                                    className="input"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Product Name *</label>
                            <SmartDropdown
                                options={productOptions}
                                value={formData.productName}
                                onChange={(value) => setFormData(prev => ({ ...prev, productName: value }))}
                                placeholder="Select product or add new..."
                                allowCustom={true}
                                customLabel="+ Add New Product"
                            />
                            <p className="field-hint">Select from existing products or type a new one</p>
                        </div>

                        <div className="specifications-section">
                            <div className="spec-header">
                                <label>Specifications</label>
                                <button
                                    type="button"
                                    onClick={addSpecification}
                                    className="btn-add-spec"
                                >
                                    + Add Specification
                                </button>
                            </div>

                            {specifications.map((spec, index) => (
                                <div key={index} className="spec-row">
                                    <div className="spec-field">
                                        <SmartDropdown
                                            options={specKeyOptions}
                                            value={spec.key}
                                            onChange={(value) => handleSpecChange(index, 'key', value)}
                                            placeholder="Spec name (e.g., Processor)"
                                            allowCustom={true}
                                            customLabel="+ Add New Spec"
                                        />
                                    </div>
                                    <div className="spec-field">
                                        <SmartDropdown
                                            options={specValueOptions[spec.key] || []}
                                            value={spec.value}
                                            onChange={(value) => handleSpecChange(index, 'value', value)}
                                            placeholder="Spec value"
                                            allowCustom={true}
                                            customLabel="+ Add New Value"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeSpecification(index)}
                                        className="btn-remove-spec"
                                        disabled={specifications.length === 1}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="pricing">Pricing</label>
                                <input
                                    type="text"
                                    id="pricing"
                                    name="pricing"
                                    value={formData.pricing}
                                    onChange={handleInputChange}
                                    className="input"
                                    placeholder="e.g., $5,000 or Contact for Quote"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="quantity">Quantity</label>
                                <input
                                    type="number"
                                    id="quantity"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleInputChange}
                                    className="input"
                                    min="1"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="notes">Notes</label>
                            <textarea
                                id="notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                className="input"
                                rows="3"
                                placeholder="Additional notes or terms..."
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="status">Status</label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="input"
                            >
                                <option value="Draft">Draft</option>
                                <option value="Sent">Sent</option>
                                <option value="Accepted">Accepted</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="btn btn-secondary">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : quotation ? 'Update Quotation' : 'Create Quotation'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuotationForm;
