import { useState, useEffect } from 'react';
import api from '../../services/api';
import SmartDropdown from '../ui/SmartDropdown';

const QuotationForm = ({ quotation, requestId, onClose, onSaved }) => {
    const [formData, setFormData] = useState({
        requestId: quotation?.request_id || requestId || '',
        // Quotation Info
        quotationDate: quotation?.quotation_date || new Date().toISOString().split('T')[0],
        referenceNumber: quotation?.reference_number || '',
        // Customer Details
        customerEmail: quotation?.customer_email || '',
        customerName: quotation?.customer_name || '',
        customerCompany: quotation?.customer_company || '',
        customerAddress: quotation?.customer_address || '',
        attentionTo: quotation?.attention_to || '',
        subject: quotation?.subject || '',
        // Product Details
        productName: quotation?.product_name || '',
        productDescription: quotation?.product_description || '',
        quantity: quotation?.quantity || 1,
        unitRate: quotation?.unit_rate || '',
        pricing: quotation?.pricing || '',
        // Terms & Conditions
        paymentTerms: quotation?.payment_terms || '100% Advance Against PO',
        taxes: quotation?.taxes || '18% GST Extra',
        freight: quotation?.freight || 'Extra At Actual',
        warrantyTerms: quotation?.warranty_terms || 'As Per Offer',
        delivery: quotation?.delivery || 'Within 1 - 2 Weeks',
        validity: quotation?.validity || '',
        gstin: quotation?.gstin || '27AAFCC6898N1ZQ',
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
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');

    // Generate reference number format: CLUDO/MONTH/XXX/YY-XX
    const generateReferenceNumber = () => {
        const now = new Date();
        const monthNames = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
            'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
        const month = monthNames[now.getMonth()];
        const year = now.getFullYear().toString().slice(-2);
        const randomNum = Math.floor(Math.random() * 999) + 1;
        return `CLUDO/${month}/${randomNum.toString().padStart(3, '0')}/${year}-${(parseInt(year) + 1).toString()}`;
    };

    useEffect(() => {
        fetchProductOptions();
        fetchSpecKeyOptions();
        // Set default validity to 30 days from now and generate reference number
        const updates = {};
        if (!formData.validity) {
            const validityDate = new Date();
            validityDate.setDate(validityDate.getDate() + 30);
            updates.validity = validityDate.toISOString().split('T')[0];
        }
        if (!formData.referenceNumber && !quotation) {
            updates.referenceNumber = generateReferenceNumber();
        }
        if (Object.keys(updates).length > 0) {
            setFormData(prev => ({ ...prev, ...updates }));
        }
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

    // Calculate subtotal
    const calculateSubtotal = () => {
        const rate = parseFloat(formData.unitRate) || 0;
        const qty = parseInt(formData.quantity) || 1;
        return rate * qty;
    };

    const handleSubmit = async (e, shouldSend = false) => {
        e.preventDefault();

        if (!formData.customerEmail || !formData.productName) {
            setError('Customer email and product name are required');
            return;
        }

        const validSpecs = specifications.filter(spec => spec.key.trim() && spec.value.trim());

        try {
            if (shouldSend) {
                setSending(true);
            } else {
                setLoading(true);
            }
            setError('');

            const payload = {
                ...formData,
                specifications: validSpecs,
                autoSaveProduct: true,
                subtotal: calculateSubtotal(),
            };

            let savedQuotation;
            if (quotation && quotation.id) {
                savedQuotation = await api.put(`/quotations/${quotation.id}`, payload);
            } else {
                savedQuotation = await api.post('/quotations', payload);
            }

            // If sending, also trigger the send email endpoint
            if (shouldSend && savedQuotation?.data?.data?.id) {
                try {
                    await api.post(`/quotations/${savedQuotation.data.data.id}/send-email`);
                    // Update status to Sent
                    await api.put(`/quotations/${savedQuotation.data.data.id}`, { status: 'Sent' });

                    // If linked to a request, update request status to 'Quoted'
                    if (formData.requestId) {
                        try {
                            await api.put(`/requests/${formData.requestId}`, { funnel_stage: 'Quoted' });
                        } catch (reqError) {
                            console.error('Error updating request status:', reqError);
                        }
                    }
                } catch (sendError) {
                    console.error('Error sending quotation:', sendError);
                    // Still close but show a warning
                }
            }

            onSaved && onSaved();
            onClose();
        } catch (error) {
            console.error('Error saving quotation:', error);
            setError(error.response?.data?.message || 'Failed to save quotation');
        } finally {
            setLoading(false);
            setSending(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content quotation-form-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{quotation && quotation.id ? 'Edit Quotation' : 'Create New Quotation'}</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <form onSubmit={(e) => handleSubmit(e, false)}>
                    <div className="modal-body">
                        {error && (
                            <div className="error-message">{error}</div>
                        )}

                        {/* Section: Quotation Info */}
                        <div className="form-section">
                            <h3 className="form-section-title">Quotation Info</h3>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="quotationDate">Date *</label>
                                    <input
                                        type="date"
                                        id="quotationDate"
                                        name="quotationDate"
                                        value={formData.quotationDate}
                                        onChange={handleInputChange}
                                        className="input"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="referenceNumber">Ref. No.</label>
                                    <input
                                        type="text"
                                        id="referenceNumber"
                                        name="referenceNumber"
                                        value={formData.referenceNumber}
                                        onChange={handleInputChange}
                                        className="input"
                                        placeholder="e.g., CLUDO/NOVEMBER/773/25-26"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section: Customer Details */}
                        <div className="form-section">
                            <h3 className="form-section-title">Customer Details</h3>

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
                                    <label htmlFor="customerName">Contact Name</label>
                                    <input
                                        type="text"
                                        id="customerName"
                                        name="customerName"
                                        value={formData.customerName}
                                        onChange={handleInputChange}
                                        className="input"
                                        placeholder="e.g., John Doe"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="customerCompany">Company Name</label>
                                    <input
                                        type="text"
                                        id="customerCompany"
                                        name="customerCompany"
                                        value={formData.customerCompany}
                                        onChange={handleInputChange}
                                        className="input"
                                        placeholder="e.g., Ascent Business Solutions"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="attentionTo">Kindly Attn</label>
                                    <input
                                        type="text"
                                        id="attentionTo"
                                        name="attentionTo"
                                        value={formData.attentionTo}
                                        onChange={handleInputChange}
                                        className="input"
                                        placeholder="Attention to person name"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="customerAddress">Address</label>
                                <textarea
                                    id="customerAddress"
                                    name="customerAddress"
                                    value={formData.customerAddress}
                                    onChange={handleInputChange}
                                    className="input"
                                    rows="2"
                                    placeholder="e.g., Address-22 IT Park, South Ambazari Road, Nagpur, Maharashtra 440022"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="subject">Subject</label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleInputChange}
                                    className="input"
                                    placeholder="e.g., Proposal for Dell Laptop"
                                />
                            </div>
                        </div>

                        {/* Section: Product Details */}
                        <div className="form-section">
                            <h3 className="form-section-title">Product Details</h3>

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
                            </div>

                            <div className="form-group">
                                <label htmlFor="productDescription">Product Description</label>
                                <textarea
                                    id="productDescription"
                                    name="productDescription"
                                    value={formData.productDescription}
                                    onChange={handleInputChange}
                                    className="input"
                                    rows="3"
                                    placeholder="e.g., CI7-1355U / 16GB RAM DDR5 / 512 SSD / DOS / 14&quot; FHD / NO ODD/Backlit Keyboard / Finger print reader..."
                                />
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
                                                placeholder="Spec name"
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
                        </div>

                        {/* Section: Pricing */}
                        <div className="form-section">
                            <h3 className="form-section-title">Pricing</h3>

                            <div className="form-row form-row-3">
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

                                <div className="form-group">
                                    <label htmlFor="unitRate">Unit Rate (₹)</label>
                                    <input
                                        type="number"
                                        id="unitRate"
                                        name="unitRate"
                                        value={formData.unitRate}
                                        onChange={handleInputChange}
                                        className="input"
                                        placeholder="e.g., 74290.00"
                                        step="0.01"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Sub Total (₹)</label>
                                    <input
                                        type="text"
                                        value={calculateSubtotal().toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        className="input"
                                        readOnly
                                        style={{ background: '#f5f5f7' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section: Terms & Conditions */}
                        <div className="form-section">
                            <h3 className="form-section-title">Terms &amp; Conditions</h3>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="paymentTerms">Payment</label>
                                    <input
                                        type="text"
                                        id="paymentTerms"
                                        name="paymentTerms"
                                        value={formData.paymentTerms}
                                        onChange={handleInputChange}
                                        className="input"
                                        placeholder="e.g., 100% Advance Against PO"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="taxes">Taxes</label>
                                    <input
                                        type="text"
                                        id="taxes"
                                        name="taxes"
                                        value={formData.taxes}
                                        onChange={handleInputChange}
                                        className="input"
                                        placeholder="e.g., 18% GST Extra"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="freight">Freight</label>
                                    <input
                                        type="text"
                                        id="freight"
                                        name="freight"
                                        value={formData.freight}
                                        onChange={handleInputChange}
                                        className="input"
                                        placeholder="e.g., Extra At Actual"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="warrantyTerms">Warranty Terms</label>
                                    <input
                                        type="text"
                                        id="warrantyTerms"
                                        name="warrantyTerms"
                                        value={formData.warrantyTerms}
                                        onChange={handleInputChange}
                                        className="input"
                                        placeholder="e.g., As Per Offer"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="delivery">Delivery</label>
                                    <input
                                        type="text"
                                        id="delivery"
                                        name="delivery"
                                        value={formData.delivery}
                                        onChange={handleInputChange}
                                        className="input"
                                        placeholder="e.g., Within 1 - 2 Weeks"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="validity">Validity</label>
                                    <input
                                        type="date"
                                        id="validity"
                                        name="validity"
                                        value={formData.validity}
                                        onChange={handleInputChange}
                                        className="input"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="gstin">GSTIN No</label>
                                <input
                                    type="text"
                                    id="gstin"
                                    name="gstin"
                                    value={formData.gstin}
                                    onChange={handleInputChange}
                                    className="input"
                                    placeholder="e.g., 27AAFCC6898N1ZQ"
                                />
                            </div>
                        </div>

                        {/* Section: Additional Notes */}
                        <div className="form-section">
                            <h3 className="form-section-title">Additional Notes</h3>

                            <div className="form-group">
                                <textarea
                                    id="notes"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    className="input"
                                    rows="3"
                                    placeholder="Any additional notes or special instructions..."
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
                    </div>

                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="btn btn-secondary">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading || sending}
                        >
                            {loading ? 'Saving...' : (quotation && quotation.id ? 'Update' : 'Save as Draft')}
                        </button>
                        <button
                            type="button"
                            onClick={(e) => handleSubmit(e, true)}
                            className="btn btn-send"
                            disabled={loading || sending}
                        >
                            {sending ? 'Sending...' : '📤 Save & Send'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuotationForm;
