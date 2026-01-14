import { useState } from 'react';
import api from '../../services/api';
import './ProductForm.css';

const ProductForm = ({ product, onClose, onSaved }) => {
    const [formData, setFormData] = useState({
        name: product?.name || '',
        pricing: product?.pricing || '',
        availabilityNotes: product?.availability_notes || '',
    });

    const [specifications, setSpecifications] = useState(
        product?.specifications?.map(spec => ({
            key: spec.spec_key,
            value: spec.spec_value,
        })) || [{ key: '', value: '' }]
    );

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSpecChange = (index, field, value) => {
        const newSpecs = [...specifications];
        newSpecs[index][field] = value;
        setSpecifications(newSpecs);
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

        if (!formData.name.trim()) {
            setError('Product name is required');
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
            };

            if (product) {
                // Update existing product
                await api.put(`/products/${product.id}`, payload);
            } else {
                // Create new product
                await api.post('/products', payload);
            }

            onSaved && onSaved();
            onClose();
        } catch (error) {
            console.error('Error saving product:', error);
            setError(error.response?.data?.message || 'Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content product-form-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{product ? 'Edit Product' : 'Add New Product'}</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {error && (
                            <div className="error-message">{error}</div>
                        )}

                        <div className="form-group">
                            <label htmlFor="name">Product Name *</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="input"
                                placeholder="e.g., IBM Server X3650 M5"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="pricing">Pricing</label>
                            <input
                                type="text"
                                id="pricing"
                                name="pricing"
                                value={formData.pricing}
                                onChange={handleInputChange}
                                className="input"
                                placeholder="e.g., $5,000 - $7,500 or Contact for Quote"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="availabilityNotes">Availability Notes</label>
                            <textarea
                                id="availabilityNotes"
                                name="availabilityNotes"
                                value={formData.availabilityNotes}
                                onChange={handleInputChange}
                                className="input"
                                rows="3"
                                placeholder="e.g., In stock, 2-3 weeks lead time, Made to order"
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
                                    <input
                                        type="text"
                                        value={spec.key}
                                        onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                                        className="input spec-key"
                                        placeholder="Key (e.g., Processor)"
                                    />
                                    <input
                                        type="text"
                                        value={spec.value}
                                        onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                                        className="input spec-value"
                                        placeholder="Value (e.g., Intel Xeon E5-2600 v4)"
                                    />
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

                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="btn btn-secondary">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductForm;
