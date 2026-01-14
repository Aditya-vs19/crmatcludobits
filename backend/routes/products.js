import express from 'express';
import {
    createProduct,
    getAllProducts,
    getProductsForDropdown,
    getProductById,
    updateProduct,
    deleteProduct,
    getProductStats,
} from '../controllers/productController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get products for dropdown (authenticated users)
router.get('/dropdown', authenticate, getProductsForDropdown);

// Get product statistics
router.get('/stats', authenticate, getProductStats);

// Get all products
router.get('/', authenticate, getAllProducts);

// Get single product
router.get('/:id', authenticate, getProductById);

// Create product (Admin, Sales, Operations)
router.post('/', authenticate, authorize('Admin', 'Sales', 'Operations'), createProduct);

// Update product (Admin, Sales, Operations)
router.put('/:id', authenticate, authorize('Admin', 'Sales', 'Operations'), updateProduct);

// Delete product (Admin only)
router.delete('/:id', authenticate, authorize('Admin'), deleteProduct);

export default router;
