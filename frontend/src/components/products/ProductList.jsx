import { useState } from 'react';
import './ProductList.css';

const ProductList = ({ products, onEdit, onDelete, onRefresh }) => {
    const [expandedId, setExpandedId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.pricing?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (product) => {
        if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
            await onDelete(product.id);
        }
    };

    return (
        <div className="product-list">
            <div className="list-header">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input search-input"
                    />
                </div>
                <div className="product-count">
                    {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                </div>
            </div>

            {filteredProducts.length === 0 ? (
                <div className="empty-state">
                    <p>No products found.</p>
                    {searchTerm && <p className="empty-hint">Try adjusting your search</p>}
                </div>
            ) : (
                <div className="products-grid">
                    {filteredProducts.map((product) => (
                        <div key={product.id} className="product-card">
                            <div className="product-header">
                                <h3 className="product-name">{product.name}</h3>
                                <div className="product-actions">
                                    <button
                                        onClick={() => onEdit(product)}
                                        className="btn-icon btn-edit"
                                        title="Edit product"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product)}
                                        className="btn-icon btn-delete"
                                        title="Delete product"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>

                            {product.pricing && (
                                <div className="product-pricing">
                                    <span className="pricing-label">Pricing:</span>
                                    <span className="pricing-value">{product.pricing}</span>
                                </div>
                            )}

                            {product.availability_notes && (
                                <div className="product-availability">
                                    <span className="availability-label">Availability:</span>
                                    <span className="availability-value">{product.availability_notes}</span>
                                </div>
                            )}

                            {product.specifications && product.specifications.length > 0 && (
                                <div className="specifications-container">
                                    <button
                                        onClick={() => toggleExpand(product.id)}
                                        className="btn-toggle-specs"
                                    >
                                        {expandedId === product.id ? '▼' : '▶'} Specifications ({product.specifications.length})
                                    </button>

                                    {expandedId === product.id && (
                                        <div className="specifications-list">
                                            {product.specifications.map((spec, index) => (
                                                <div key={index} className="spec-item">
                                                    <span className="spec-key">{spec.spec_key}:</span>
                                                    <span className="spec-value">{spec.spec_value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="product-footer">
                                <span className="product-meta">
                                    Added by {product.creator_email || 'Unknown'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductList;
