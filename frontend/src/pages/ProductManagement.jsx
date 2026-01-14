import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ProductForm from '../components/products/ProductForm';
import ProductList from '../components/products/ProductList';
import api from '../services/api';
import './ProductManagement.css';

const ProductManagement = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/products');
            setProducts(response.data.data || []);
            setError('');
        } catch (error) {
            console.error('Error fetching products:', error);
            setError('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduct = () => {
        setEditingProduct(null);
        setShowForm(true);
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setShowForm(true);
    };

    const handleDeleteProduct = async (productId) => {
        try {
            await api.delete(`/products/${productId}`);
            await fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            alert(error.response?.data?.message || 'Failed to delete product');
        }
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditingProduct(null);
    };

    const handleProductSaved = () => {
        fetchProducts();
    };

    // Check if user has permission to add/edit products
    const canManageProducts = user && ['Admin', 'Sales', 'Operations'].includes(user.role);
    const canDeleteProducts = user && user.role === 'Admin';

    return (
        <div className="product-management">
            <div className="page-header">
                <div className="header-content">
                    <h1>Product Management</h1>
                    <p className="header-subtitle">
                        Manage your product catalog with specifications, pricing, and availability
                    </p>
                </div>
                {canManageProducts && (
                    <button onClick={handleAddProduct} className="btn btn-primary">
                        + Add Product
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
                    <p>Loading products...</p>
                </div>
            ) : (
                <ProductList
                    products={products}
                    onEdit={canManageProducts ? handleEditProduct : null}
                    onDelete={canDeleteProducts ? handleDeleteProduct : null}
                    onRefresh={fetchProducts}
                />
            )}

            {showForm && (
                <ProductForm
                    product={editingProduct}
                    onClose={handleFormClose}
                    onSaved={handleProductSaved}
                />
            )}
        </div>
    );
};

export default ProductManagement;
